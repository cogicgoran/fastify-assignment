import { refreshTokenSchema, userSchema } from "@database/schema";
import { eq } from "drizzle-orm";

export interface IUserRepository {
  createUser: (body: any) => Promise<number>;
  getUserByEmail: (
    email: string
  ) => Promise<{ id: number; email: string; password: string } | undefined>;
  addRefreshToken: (userId: number, refreshToken: string) => Promise<void>;
  replaceRefreshToken: (oldTokenId: number, newToken: string) => Promise<void>;
  logout: (refreshToken: string) => Promise<void>;
  logoutAll: (userId: number) => Promise<void>;
}

export const userRepository: IUserRepository = {
  async createUser(body) {
    const [{ id: createdUserId }] = await fastify.db
      .insert(userSchema)
      .values(body)
      .returning({ id: userSchema.id });
    return createdUserId;
  },
  async getUserByEmail(email: string) {
    const [user] = await fastify.db
      .select({
        id: userSchema.id,
        email: userSchema.email,
        password: userSchema.password,
      })
      .from(userSchema)
      .where(eq(userSchema.email, email));
    return user;
  },
  addRefreshToken(userId, token) {
    return fastify.db.insert(refreshTokenSchema).values({
      userId: userId,
      token,
    });
  },
  replaceRefreshToken(oldTokenId, newToken) {
    return fastify.db
      .update(refreshTokenSchema)
      .set({
        token: newToken,
      })
      .where(eq(refreshTokenSchema.id, oldTokenId));
  },
  logout(refreshToken) {
    return fastify.db
      .delete(refreshTokenSchema)
      .where(eq(refreshTokenSchema.token, refreshToken));
  },
  logoutAll(userId) {
    return fastify.db
      .delete(refreshTokenSchema)
      .where(eq(refreshTokenSchema.userId, userId));
  },
};

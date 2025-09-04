import {
  emailVerificatoinTokenSchema,
  refreshTokenSchema,
  userSchema,
} from "@database/schema";
import { BadRequestError } from "@utils/exceptions";
import { and, eq } from "drizzle-orm";

export interface IUserRepository {
  createUser: (body: any, token: string) => Promise<number>;
  getUserByEmail: (
    email: string
  ) => Promise<{ id: number; email: string; password: string } | undefined>;
  addRefreshToken: (userId: number, refreshToken: string) => Promise<void>;
  replaceRefreshToken: (oldTokenId: number, newToken: string) => Promise<void>;
  logout: (refreshToken: string) => Promise<void>;
  logoutAll: (userId: number) => Promise<void>;
  updateVerificationEmailToken: (email: string, token: string) => Promise<any>;
}

export const userRepository: IUserRepository = {
  async updateVerificationEmailToken(email, token) {
    return fastify.db.transaction(async (transaction) => {
      const result = await transaction
        .update(emailVerificatoinTokenSchema)
        .set({
          valid: false,
        })
        .where(
          and(
            eq(emailVerificatoinTokenSchema.token, token),
            eq(emailVerificatoinTokenSchema.valid, true)
          )
        );
      if(result.rowCount !== 1) throw new BadRequestError('Token not found')
      await transaction
        .update(userSchema)
        .set({
          is_email_verified: true,
        })
        .where(eq(userSchema.email, email));
    });
  },
  async createUser(body, token) {
    return await fastify.db.transaction(async (transaction) => {
      const [{ id: createdUserId }] = await transaction
        .insert(userSchema)
        .values(body)
        .returning({ id: userSchema.id });
      await transaction
        .insert(emailVerificatoinTokenSchema)
        .values({ token: token, userId: createdUserId });
      return createdUserId;
    });
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

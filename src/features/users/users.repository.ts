import { userSchema } from "@database/schema"

export interface IUserRepository {
    createUser: (body: any) => Promise<number>
}

export const userRepository: IUserRepository = {
    async createUser(body) {
        const result = await fastify.db.insert(userSchema).values(body).returning({ id: userSchema.id });
        return result[0].id;
    },
}
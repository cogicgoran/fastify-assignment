import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { FastifyInstance } from 'fastify';
import { IUserRepository } from './features/users/users.repository';

declare module 'fastify' {
    // interface FastifyRequest {
    //     jwt: JWT;
    // }
    interface FastifyInstance {
        db: PostgresJsDatabase<typeof schema>;
        userRepository: IUserRepository;
    }
}

interface FastifyGlobal {
    fastify: FastifyInstance;
}

declare global {
    var fastify: FastifyInstance;
}

export {};

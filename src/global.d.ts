import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { FastifyInstance } from "fastify";
import { IUserRepository } from "./features/users/users.repository";
import * as schema from "@database/schema";
import { JWT } from "@fastify/jwt";
import Mailjet from "node-mailjet";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: any;
  }
}

declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT;
  }
  interface FastifyInstance {
    db: PostgresJsDatabase<typeof schema>;
    userRepository: IUserRepository;
    mailjet: Mailjet;
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

interface FastifyGlobal {
  fastify: FastifyInstance;
}

declare global {
  var fastify: FastifyInstance;
}

export {};

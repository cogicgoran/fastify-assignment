import Fastify from "fastify";
import { userRepository } from "@src/features/users/users.repository";
import { usersRoute } from "@src/features/users/users.routes";
import { Exception } from "./exceptions";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";

export const createFastifyInstance = () => {
  const fastify = Fastify({
    logger: true,
  });

  global.fastify = fastify;
};

export function registerRoutes() {
  fastify.register(usersRoute, { prefix: "/users" });
}

export function registerRepositories() {
  fastify.decorate("userRepository", userRepository);
}

export function registerErrorHandling() {
  fastify.setErrorHandler((error, _, reply) => {
    if (error instanceof Exception) {
      return reply
        .code((error as Exception).code) // TODO: fix this later
        .send({ message: (error as Exception).message });
    }
    return reply.code(500).send({ message: error.message });
  });
}

export function registerJwt() {
  fastify.register(fastifyJwt, { secret: process.env.JWT_TOKEN_SECRET || 'default_secret' }); 

  fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
    hook: "preHandler",
  });
}

import Fastify, { FastifyRequest } from "fastify";
import { userRepository } from "@src/features/users/users.repository";
import { usersRoute } from "@src/features/users/users.routes";
import { Exception, UnauthorizedError } from "./exceptions";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { Value } from "@sinclair/typebox/value";
import {
  AuthTokenPayloadUserSchema,
  authTokenPayloadUserSchema,
} from "@src/features/users/users.schema";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

export const createFastifyInstance = () => {
  const fastify = Fastify({
    logger: true,
  }).withTypeProvider<TypeBoxTypeProvider>();

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
    if (error.validation) {
      if (error.validation[0].instancePath === "/email") {
        return reply
          .status(400)
          .send({ message: "Invalid email", type: "validation" });
      }

      return reply
        .status(400)
        .send({ message: error.message, type: "validation" });
    }
    if (error instanceof Exception) {
      return reply
        .code((error as Exception).statusCode) // TODO: fix this later
        .send({ message: (error as Exception).message });
    }
    return reply.code(500).send({ message: error.message });
  });
}

export const authenticate = async (request: FastifyRequest) => {
  try {
    const accessToken = request.cookies.access_token;
    if (!accessToken) throw new UnauthorizedError();
    const tokenPayload =
      fastify.jwt.verify<AuthTokenPayloadUserSchema>(accessToken);
    Value.Assert(authTokenPayloadUserSchema, tokenPayload);
    request.user = { id: tokenPayload.userId, email: tokenPayload.email };
  } catch (e) {
    console.log(e);
    throw new UnauthorizedError();
  }
};

export function registerJwt() {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_TOKEN_SECRET || "default_secret",
  });

  fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
    hook: "preHandler",
  });

  fastify.decorate("authenticate", authenticate);
}

export const registerDocumentation = () => {
  const swaggerOptions = {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "My API",
        description: "API documentation",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development server",
        },
      ],
    },
  };

  const swaggerUiOptions = {
    routePrefix: `/api/documentation`,
    exposeRoute: true,
  };

  fastify.register(fastifySwagger, swaggerOptions);
  fastify.register(fastifySwaggerUi, swaggerUiOptions);
};

import { FastifyInstance } from "fastify";
import {
  createUser,
  getAuthenticatedUser,
  loginUser,
  logout,
  logoutAll,
  refreshToken,
  verifyEmail,
} from "./users.controller";
import {
  userLoginSchema,
  userRegisterSchema,
  userVerificationSchema,
} from "./users.schema";

export const usersRoute = async (fastify: FastifyInstance) => {
  fastify.post(
    "/register",
    {
      schema: {
        body: userRegisterSchema,
      },
    },
    createUser
  );

  fastify.post(
    "/login",
    {
      schema: {
        body: userLoginSchema,
      },
    },
    loginUser
  );

  fastify.post(
    "/refresh-token",
    {
      preHandler: [fastify.authenticate],
      schema: {},
    },
    refreshToken
  );

  fastify.post(
    "/verify",
    {
      schema: {
        body: userVerificationSchema,
      },
    },
    verifyEmail
  );

  fastify.post(
    "/logout",
    {
      preHandler: [fastify.authenticate],
      schema: {},
    },
    logout
  );

  fastify.post(
    "/logout-all",
    {
      preHandler: [fastify.authenticate],
      schema: {},
    },
    logoutAll
  );

  fastify.get(
    "/me",
    {
      preHandler: [fastify.authenticate],
      schema: {},
    },
    getAuthenticatedUser
  );
};

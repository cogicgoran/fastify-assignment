import { FastifyInstance } from "fastify";
import {
  createUser,
  loginUser,
  logout,
  logoutAll,
  refreshToken,
} from "./users.controller";

export const usersRoute = async (fastify: FastifyInstance) => {
  fastify.post(
    "/register",
    {
      schema: {},
    },
    createUser
  );

  fastify.post(
    "/login",
    {
      schema: {},
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
};

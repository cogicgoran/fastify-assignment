import { FastifyInstance } from "fastify";
import { createUser, loginUser } from "./users.controller";

export const usersRoute = async (fastify: FastifyInstance) => {
  fastify.post(
    "/register",
    {
      schema: {
        // body: userSchemas.createUser,
        // response: {
        //     201: userSchemas.userIdentifier
        // }
      },
    },
    createUser
  );

  fastify.post(
    "/login",
    {
      schema: {
        // body: userSchemas.createUser,
        // response: {
        //     201: userSchemas.userIdentifier
        // }
      },
    },
    loginUser
  );
};

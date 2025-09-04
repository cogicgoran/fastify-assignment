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

export const usersRoute = async (fastify: FastifyInstance) => {
  fastify.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              default: "cogicgoran99+4@gmail.com",
            },
            password: { type: "string", minLength: 6, default: "Banana*123" },
          },
        },
        response: {
          201: {
            description: "User successfully registered",
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string", format: "email" },
            },
          },
          400: {
            description: "Invalid input or validation error",
            type: "object",
            properties: {
              statusCode: { type: "number" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          401: {
            description: "Unauthorized (if applicable, e.g. duplicate email)",
            type: "object",
            properties: {
              statusCode: { type: "number" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          500: {
            description: "Internal server error",
            type: "object",
            properties: {
              statusCode: { type: "number" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    createUser
  );

  fastify.post(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              default: "cogicgoran99+4@gmail.com",
            },
            password: { type: "string", minLength: 6, default: "Banana*123" },
          },
        },
        response: {
          201: {
            description: "User successfully registered",
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string", format: "email" },
            },
          },
          400: {
            description: "Invalid input or validation error",
            type: "object",
            properties: {
              statusCode: { type: "number" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          401: {
            description: "Unauthorized (if applicable, e.g. duplicate email)",
            type: "object",
            properties: {
              statusCode: { type: "number" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          500: {
            description: "Internal server error",
            type: "object",
            properties: {
              statusCode: { type: "number" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
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
        body: {
          type: "object",
          required: ["verificationToken"],
          properties: {
            verificationToken: { type: "string" },
          },
        },
        response: {
          201: {
            description: "User successfully registered",
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string", format: "email" },
            },
          },
          400: {
            description: "Invalid input or validation error",
            type: "object",
            properties: {
              statusCode: { type: "number" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          401: {
            description: "Unauthorized (if applicable, e.g. duplicate email)",
            type: "object",
            properties: {
              statusCode: { type: "number" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          500: {
            description: "Internal server error",
            type: "object",
            properties: {
              statusCode: { type: "number" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
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

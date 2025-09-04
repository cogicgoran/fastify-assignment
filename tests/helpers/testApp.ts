import { FastifyInstance } from "fastify";
import {
  createFastifyInstance,
  registerErrorHandling,
  registerJwt,
  registerRepositories,
  registerRoutes,
} from "../../src/utils/serverSetup";
import { registerDatabase } from "../../src/database";
import { config } from "dotenv";
export const createTestApp = async (): Promise<FastifyInstance> => {
  config({ path: ".env.test" });
  console.log("myvar:", process.env.JWT_TOKEN_SECRET);

  createFastifyInstance();
  registerJwt();
  registerDatabase();
  registerRepositories();
  registerRoutes();
  registerErrorHandling();

  await global.fastify.ready();
  return global.fastify;
};

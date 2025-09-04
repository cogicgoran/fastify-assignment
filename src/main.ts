import { config } from "dotenv";
config();
import { createFastifyInstance, registerDocumentation, registerErrorHandling, registerJwt, registerRepositories, registerRoutes } from "@utils/serverSetup";
import { registerDatabase } from "./database";

const apiHost = '0.0.0.0';
const API_PORT = 3000;

const main = async () => {
    try {
        const port = Number(API_PORT);
        await fastify.listen({host: apiHost, port });
        // await fastify.ready()
        // fastify.swagger()
        console.log(`Server is running on port:${port}`);
        console.log(fastify.printRoutes())
    } catch (e) {
        fastify.log.error(e);
        process.exit(1);
    }
};

createFastifyInstance();
registerJwt();
registerDatabase()
registerRepositories()
registerDocumentation()
registerRoutes()
registerErrorHandling();
main();
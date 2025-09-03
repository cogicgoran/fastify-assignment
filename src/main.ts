import { createFastifyInstance } from "@utils/serverSetup";
import { registerDatabase } from "./database";
import { config } from "dotenv";
config();

const API_PORT = 3000;

const main = async () => {
    try {
        const port = Number(API_PORT);
        await fastify.listen({ port });
        console.log(`Server is running on port:${port}`);
    } catch (e) {
        fastify.log.error(e);
        process.exit(1);
    }
};

createFastifyInstance();
registerDatabase()
main();
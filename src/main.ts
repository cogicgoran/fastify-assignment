import Fastify from 'fastify';

const API_PORT = 3000;

const createFastifyInstance = () => {
    const fastify = Fastify({
        logger: true,
    });
    
    global.fastify = fastify;
};

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
main();
import Fastify from 'fastify';

export const createFastifyInstance = () => {
    const fastify = Fastify({
        logger: true,
    });
    
    global.fastify = fastify;
};



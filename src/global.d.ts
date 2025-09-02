import { FastifyInstance } from 'fastify';

interface FastifyGlobal {
    fastify: FastifyInstance;
}

declare global {
    var fastify: FastifyInstance;
}

export {};

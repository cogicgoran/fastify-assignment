import { BadRequestError } from "@utils/exceptions";
import { FastifyReply, FastifyRequest } from "fastify";
import { hashPassword } from "@utils/string";

const ERROR_CODE_DUPLICATE_KEY = '23505';

export const createUser = async (
    request: FastifyRequest<{
        Body: {email: string, password: string};
    }>,
    reply: FastifyReply
) => {
    try {
        const user = request.body;
        const hashData = hashPassword(user.password);
        user.password = hashData.hash;
        const createdUserId = await fastify.userRepository.createUser(user);
        return reply.code(201).send({ id: createdUserId });

    } catch (error) {
        if((error as any)?.cause.code === ERROR_CODE_DUPLICATE_KEY) throw new BadRequestError('User already exists'); // TODO: check if db error
        throw error;
        // const errorMessage = `User registration failed.`;
        // handleException(e, errorMessage, reply);
    }
};
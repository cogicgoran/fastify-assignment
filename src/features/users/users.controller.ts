import { BadRequestError } from "@utils/exceptions";
import { FastifyReply, FastifyRequest } from "fastify";
import { hashPassword, verifyPassword } from "@utils/string";
import {
  ACCESS_TOKEN_DURATION,
  ERROR_CODE_DUPLICATE_KEY,
  REFRESH_TOKEN_DURATION,
} from "@utils/common";
import { userRepository } from "./users.repository";

export const createUser = async (
  request: FastifyRequest<{
    Body: { email: string; password: string };
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
    if ((error as any)?.cause.code === ERROR_CODE_DUPLICATE_KEY)
      throw new BadRequestError("User already exists"); // TODO: check if db error
    throw error;
    // const errorMessage = `User registration failed.`;
    // handleException(e, errorMessage, reply);
  }
};

export const loginUser = async (
  request: FastifyRequest<{
    Body: { email: string; password: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const user = request.body;
    const hashData = hashPassword(user.password);
    // user.password = hashData.hash;
    const databaseUser = await fastify.userRepository.getUserByEmail(
      user.email
    );
    if (!databaseUser) throw new BadRequestError("User does not exist");
    if (verifyPassword(databaseUser.password,hashData))
      throw new BadRequestError("Bad password or email");
    // create access token, refresh token, update database with new refresh token, set cookies
    const tokenPayload = { email: user.email, id: databaseUser.id };
    const accessToken = fastify.jwt.sign(tokenPayload, {
      expiresIn: ACCESS_TOKEN_DURATION,
    });
    const refreshToken = fastify.jwt.sign(tokenPayload, {
      expiresIn: REFRESH_TOKEN_DURATION,
    });
    await userRepository.addRefreshToken(databaseUser.id, refreshToken);

    reply
      .setCookie("refresh_token", refreshToken, {
        path: "/",
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
      })
      .status(200)
      .send({
        success: true,
        data: {
          id: databaseUser.id,
          email: user.email,
          accessToken: accessToken,
        },
      });
  } catch (error) {
    if ((error as any)?.cause.code === ERROR_CODE_DUPLICATE_KEY)
      throw new BadRequestError("User already exists"); // TODO: check if db error
    throw error;
    // const errorMessage = `User registration failed.`;
    // handleException(e, errorMessage, reply);
  }
};

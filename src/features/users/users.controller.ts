import { BadRequestError } from "@utils/exceptions";
import { FastifyReply, FastifyRequest } from "fastify";
import { hashPassword, verifyPassword } from "@utils/string";
import {
  ACCESS_TOKEN_DURATION,
  ERROR_CODE_DUPLICATE_KEY,
  REFRESH_TOKEN_DURATION,
  SESSION_ACCESS_TOKEN_DURATION,
  SESSION_REFRESH_TOKEN_DURATION,
} from "@utils/common";
import { userRepository } from "./users.repository";
import { refreshTokenSchema, userSchema } from "@database/schema";
import { eq } from "drizzle-orm";
import { sendMail } from "../email/email.service";
import {
  UserLoginSchema,
  UserRegisterSchema,
  UserVerificationSchema,
} from "./users.schema";

export const createUser = async (
  request: FastifyRequest<{ Body: UserRegisterSchema }>,
  reply: FastifyReply
) => {
  try {
    const user = request.body;
    const hashData = hashPassword(user.password);
    user.password = hashData.hash;
    const token = fastify.jwt.sign({
      email: user.email,
      type: "email_verification",
    });
    const createdUserId = await fastify.userRepository.createUser(user, token);
    sendMail(
      request.body.email,
      "Registration",
      "This is reg",
      `<p>Test email, here is the token: ${token}<p>`
    );
    return reply.code(201).send({ id: createdUserId });
  } catch (error) {
    if ((error as any)?.cause?.code === ERROR_CODE_DUPLICATE_KEY)
      throw new BadRequestError("User already exists"); // TODO: check if db error
    throw error;
  }
};

export const verifyEmail = async (
  request: FastifyRequest<{ Body: UserVerificationSchema }>,
  reply: FastifyReply
) => {
  const verificationToken = request.body.verificationToken;
  const decodedToken = fastify.jwt.verify<{ email: string }>(verificationToken); //TODO: validate
  const createdUserId =
    await fastify.userRepository.updateVerificationEmailToken(
      decodedToken.email,
      verificationToken
    );
  return reply.code(201).send({ id: createdUserId });
};

export const loginUser = async (
  request: FastifyRequest<{ Body: UserLoginSchema }>,
  reply: FastifyReply
) => {
  const user = request.body;
  const hashData = hashPassword(user.password);
  const databaseUser = await fastify.userRepository.getUserByEmail(user.email);
  if (!databaseUser) throw new BadRequestError("User does not exist");
  if (verifyPassword(databaseUser.password, hashData))
    throw new BadRequestError("Bad password or email");
  const tokenPayload = { email: user.email, userId: databaseUser.id };
  const accessToken = fastify.jwt.sign(
    { ...tokenPayload },
    {
      expiresIn: ACCESS_TOKEN_DURATION,
    }
  );
  const refreshToken = fastify.jwt.sign(
    { ...tokenPayload },
    {
      expiresIn: REFRESH_TOKEN_DURATION,
    }
  );
  await userRepository.addRefreshToken(databaseUser.id, refreshToken);

  reply
    .setCookie("access_token", accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(Date.now() + SESSION_ACCESS_TOKEN_DURATION),
    })
    .setCookie("refresh_token", refreshToken, {
      path: "/",
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(Date.now() + SESSION_REFRESH_TOKEN_DURATION),
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
};

export const refreshToken = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const token = request.cookies["refresh_token"];
  if (!token) throw new BadRequestError("Invalid refresh token");
  const [activeTokenUser] = await fastify.db
    .select({
      userId: refreshTokenSchema.userId,
      id: refreshTokenSchema.id,
      email: userSchema.email,
    })
    .from(refreshTokenSchema)
    .innerJoin(userSchema, eq(refreshTokenSchema.userId, userSchema.id))
    .where(eq(refreshTokenSchema.token, token));
  if (!activeTokenUser)
    throw new BadRequestError("Invalid refresh token[User not found]");
  // TODO: check expiration and all that just in case
  const accessToken = fastify.jwt.sign(
    { email: activeTokenUser.email, userId: activeTokenUser.userId },
    {
      expiresIn: ACCESS_TOKEN_DURATION,
    }
  );
  const newRefreshToken = fastify.jwt.sign(
    { email: activeTokenUser.email, userId: activeTokenUser.userId },
    {
      expiresIn: REFRESH_TOKEN_DURATION,
    }
  );

  await userRepository.replaceRefreshToken(activeTokenUser.id, newRefreshToken);

  reply
    .setCookie("access_token", accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(Date.now() + SESSION_ACCESS_TOKEN_DURATION),
    })
    .setCookie("refresh_token", newRefreshToken, {
      path: "/",
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(Date.now() + SESSION_REFRESH_TOKEN_DURATION),
    })
    .status(200)
    .send({
      success: true,
      data: {
        id: activeTokenUser.id,
        email: activeTokenUser.email,
        accessToken: accessToken,
      },
    });
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  const refreshToken = request.cookies["refresh_token"];
  if (!refreshToken) throw new BadRequestError("Invalid refresh token");
  await fastify.userRepository.logout(refreshToken);
  reply
    .setCookie("access_token", "", {
      path: "/",
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(Date.now()),
    })
    .setCookie("refresh_token", "", {
      path: "/",
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(Date.now()),
    })
    .status(200)
    .send({
      success: true,
    });
};

export const logoutAll = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  await fastify.userRepository.logoutAll(request.user.id);
  reply
    .setCookie("access_token", "", {
      path: "/",
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(Date.now()),
    })
    .setCookie("refresh_token", "", {
      path: "/",
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(Date.now()),
    })
    .status(200)
    .send({
      success: true,
    });
};

export const getAuthenticatedUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Emails is already found inside of the token, no need to send request to database(even though we could)
  reply.status(200).send({
    email: request.user.email,
  });
};

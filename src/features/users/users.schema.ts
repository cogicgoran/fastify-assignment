import { Type, Static } from "@sinclair/typebox";
import Ajv from "ajv";
import addFormats from "ajv-formats"; // Required for 'email' format validation

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const emailSchema = Type.String({pattern:'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'}); // TODO: native email doesnt seem to work

export const userRegisterSchema = Type.Object({
  email: emailSchema,
  password: Type.String({ minLength: 6 }),
});

export type UserRegisterSchema = Static<typeof userRegisterSchema>;

export const userLoginSchema = Type.Object({
  email: emailSchema,
  password: Type.String({ minLength: 6 }),
});

export type UserLoginSchema = Static<typeof userLoginSchema>;

export const userVerificationSchema = Type.Object({
  verificationToken: Type.String(),
});

export type UserVerificationSchema = Static<typeof userVerificationSchema>;

export const authTokenPayloadUserSchema = Type.Object(
  {
    userId: Type.Number(),
    email: emailSchema,
  }
);

export type AuthTokenPayloadUserSchema = Static<
  typeof authTokenPayloadUserSchema
>;

// tests/e2e/users.test.ts
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import fastify, { FastifyInstance } from "fastify";
import { createTestApp } from "../helpers/testApp";
import * as emailService from "../../src/features/email/email.service";
import {
  refreshTokenSchema,
  userSchema,
  emailVerificatoinTokenSchema,
} from "../../src/database/schema";
import { eq } from "drizzle-orm";

async function cleanupDatabase() {
  await global.fastify.db.delete(refreshTokenSchema);
  await global.fastify.db.delete(userSchema);
  await global.fastify.db.delete(emailVerificatoinTokenSchema);
}

describe("User Authentication E2E", () => {
  let app: FastifyInstance;

  async function createVerifiedUser() {
    vi.spyOn(emailService, "sendMail").mockResolvedValue();
    const payload = {
      email: "login@example.com",
      password: "TestPassword123!",
      name: "Login User",
    };
    await app.inject({
      method: "POST",
      url: "/users/register",
      payload,
    });
    await global.fastify.db
      .update(userSchema)
      .set({
        is_email_verified: true,
      })
      .where(eq(userSchema.email, payload.email));
  }

  beforeAll(async () => {
    app = await createTestApp();
    await cleanupDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /users/register", () => {
    beforeAll(async () => {
      await cleanupDatabase();
    });

    it("should register a new user successfully", async () => {
      const sendEmailSpy = vi
        .spyOn(emailService, "sendMail")
        .mockResolvedValue();
      const response = await app.inject({
        method: "POST",
        url: "/users/register",
        payload: {
          email: "test@example.com",
          password: "TestPassword123!",
          name: "Test User",
        },
      });

      expect(sendEmailSpy).toBeCalledTimes(1);
      expect(response.statusCode).toBe(201);
      expect(app).toBeDefined();
    });

    it("should reject duplicate email registration", async () => {
      await app.inject({
        method: "POST",
        url: "/users/register",
        payload: {
          email: "duplicate@example.com",
          password: "TestPassword123!",
          name: "Test User",
        },
      });

      const response = await app.inject({
        method: "POST",
        url: "/users/register",
        payload: {
          email: "duplicate@example.com",
          password: "TestPassword123!",
          name: "Test User 2",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("User already exists");
    });
  });

  describe("POST /users/login", () => {
    beforeAll(async () => {
      await cleanupDatabase();
      await createVerifiedUser();
    });

    it("should login successfully with valid credentials", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/users/login",
        payload: {
          email: "login@example.com",
          password: "TestPassword123!",
        },
      });
      console.log(response);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty("accessToken");

      // Check cookies are set
      expect(response.cookies).toHaveLength(2);
      expect(
        response.cookies.some((cookie) => cookie.name === "access_token")
      ).toBe(true);
    });

    it("should reject invalid credentials", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/users/login",
        payload: {
          email: "nonexistent@example.com",
          password: "WrongPassword123!",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toBe("User does not exist");
    });
  });

  describe("Authentication Flow", () => {
    beforeAll(async () => {
      await cleanupDatabase();
      await createVerifiedUser();
    });

    it("should complete full auth flow: register -> login -> refresh -> logout", async () => {
      const loginResponse = await app.inject({
        method: "POST",
        url: "/users/login",
        payload: {
          email: "login@example.com",
          password: "TestPassword123!",
        },
      });
      expect(loginResponse.statusCode).toBe(200);

      const loginCookies = loginResponse.cookies;
      const cookieHeader = loginCookies
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

      const meResponse = await app.inject({
        method: "GET",
        url: "/users/me",
        headers: {
          cookie: cookieHeader,
        },
      });
      expect(meResponse.statusCode).toBe(200);

      const refreshResponse = await app.inject({
        method: "POST",
        url: "/users/refresh-token",
        headers: {
          cookie: cookieHeader,
        },
      });
      expect(refreshResponse.statusCode).toBe(200);

      const logoutResponse = await app.inject({
        method: "POST",
        url: "/users/logout",
        headers: {
          cookie: cookieHeader,
        },
      });
      expect(logoutResponse.statusCode).toBe(200);
    });
  });
});

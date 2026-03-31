import express from "express";
import supertest from "supertest";
import authRouter from "../server/routes/auth";
import { authService } from "../server/services";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);

describe("Auth Routes", () => {
  describe("POST /register", () => {
    it("should return 200 and user on successful registration", async () => {
      spyOn(authService, "register").and.resolveTo({ id: 1, username: "test", email: "test@example.com" } as any);
      
      const response = await supertest(app)
        .post("/api/auth/register")
        .send({ username: "testuser", email: "test@example.com", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, username: "test", email: "test@example.com" });
    });

    it("should return 400 if validation fails", async () => {
      const response = await supertest(app)
        .post("/api/auth/register")
        .send({ username: "te", email: "invalid", password: "123" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Validation failed");
    });
  });

  describe("POST /login", () => {
    it("should set session_id cookie and return user on success", async () => {
      spyOn(authService, "login").and.resolveTo({ id: 123, username: "testuser", email: "test@example.com" } as any);
      
      const response = await supertest(app)
        .post("/api/auth/login")
        .send({ username: "testuser", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(123);
      expect(response.headers["set-cookie"]).toBeDefined();
      expect(response.headers["set-cookie"][0]).toContain("session_id=123");
    });

    it("should return 401 on invalid credentials", async () => {
      spyOn(authService, "login").and.resolveTo(null);
      
      const response = await supertest(app)
        .post("/api/auth/login")
        .send({ username: "testuser", password: "wrongpassword" });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid credentials");
    });
  });

  describe("POST /logout", () => {
    it("should clear session_id cookie", async () => {
      const response = await supertest(app)
        .post("/api/auth/logout");

      expect(response.status).toBe(200);
      expect(response.headers["set-cookie"][0]).toContain("session_id=;");
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /reset-password", () => {
    it("should return 200 on success", async () => {
      spyOn(authService, "resetPassword").and.resolveTo(true);
      
      const response = await supertest(app)
        .post("/api/auth/reset-password")
        .send({ email: "test@example.com", newPassword: "newpassword123" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return 404 if user not found", async () => {
      spyOn(authService, "resetPassword").and.resolveTo(false);
      
      const response = await supertest(app)
        .post("/api/auth/reset-password")
        .send({ email: "nonexistent@example.com", newPassword: "newpassword123" });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("User not found");
    });
  });

  describe("GET /google/url", () => {
    it("should return a google auth url", async () => {
      const response = await supertest(app)
        .get("/api/auth/google/url");

      expect(response.status).toBe(200);
      expect(response.body.url).toContain("accounts.google.com");
    });
  });
});

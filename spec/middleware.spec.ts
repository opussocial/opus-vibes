import { requireAuth, requirePermission } from "../server/middleware";
import { validate, registerSchema } from "../server/validation";
import { z } from "zod";

describe("Middleware", () => {
  let req: any;
  let res: any;
  let next: jasmine.Spy;

  beforeEach(() => {
    req = {};
    res = {
      status: jasmine.createSpy("status").and.callFake(() => res),
      json: jasmine.createSpy("json")
    };
    next = jasmine.createSpy("next");
  });

  describe("requireAuth", () => {
    it("should call next if user is present", () => {
      req.user = { id: 1, username: "test" };
      requireAuth(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 401 if user is missing", () => {
      requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("requirePermission", () => {
    it("should call next if user has permission", () => {
      req.user = { permissions: ["manage_types"] };
      requirePermission("manage_types")(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 403 if user is missing permission", () => {
      req.user = { permissions: ["view_all"] };
      requirePermission("manage_types")(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing required permission: manage_types" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 if user is missing entirely", () => {
      requirePermission("manage_types")(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("validate", () => {
    it("should call next if validation passes", () => {
      const schema = z.object({ name: z.string() });
      req.body = { name: "test" };
      validate(schema)(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 400 if validation fails", () => {
      const schema = z.object({ name: z.string() });
      req.body = { name: 123 }; // Invalid type
      validate(schema)(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(jasmine.objectContaining({
        error: "Validation failed"
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it("should work with real schemas like registerSchema", () => {
      req.body = { username: "user", email: "invalid", password: "123" };
      validate(registerSchema)(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });
});

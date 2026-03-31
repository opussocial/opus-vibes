import { AuthService } from "../server/services/AuthService";
import { db } from "../server/db";
import bcrypt from "bcryptjs";

describe("AuthService", () => {
  let authService: AuthService;
  let prepareSpy: jasmine.Spy;
  let statementMock: any;

  beforeEach(() => {
    authService = new AuthService();
    statementMock = {
      get: jasmine.createSpy("get"),
      run: jasmine.createSpy("run"),
      all: jasmine.createSpy("all")
    };
    prepareSpy = spyOn(db, "prepare").and.returnValue(statementMock);
  });

  describe("login", () => {
    it("should return user if credentials are valid", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        password: bcrypt.hashSync("password123", 10),
        profile_element_id: 100
      };
      statementMock.get.and.returnValue(mockUser);

      const result = await authService.login("testuser", "password123");

      expect(result).toEqual(jasmine.objectContaining({ id: 1, username: "testuser", email: "test@example.com" }));
      expect(db.prepare).toHaveBeenCalledWith("SELECT * FROM users WHERE username = ? OR email = ?");
    });

    it("should return null if password is invalid", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        password: bcrypt.hashSync("password123", 10)
      };
      statementMock.get.and.returnValue(mockUser);

      const result = await authService.login("testuser", "wrongpassword");

      expect(result).toBeNull();
    });

    it("should return null if user is not found", async () => {
      statementMock.get.and.returnValue(undefined);

      const result = await authService.login("nonexistent", "password");

      expect(result).toBeNull();
    });
  });

  describe("register", () => {
    it("should hash password and insert user", async () => {
      statementMock.get.and.returnValue({ id: 1 }); // For role lookup
      statementMock.run.and.returnValue({ lastInsertRowid: 123 });
      
      // Mock ensureUserProfile to avoid deep nesting of mocks
      spyOn(authService, "ensureUserProfile").and.resolveTo(456);

      const result = await authService.register("newuser", "new@example.com", "password123");

      expect(result).toEqual(jasmine.objectContaining({ id: 123, username: "newuser", email: "new@example.com" }));
      expect(statementMock.run).toHaveBeenCalled();
      const insertCall = prepareSpy.calls.all().find(c => c.args[0].includes("INSERT INTO users"));
      expect(insertCall).toBeDefined();
    });
  });

  describe("resetPassword", () => {
    it("should update password if user exists", async () => {
      statementMock.get.and.returnValue({ id: 1, email: "test@example.com" });
      statementMock.run.and.returnValue({ changes: 1 });

      const result = await authService.resetPassword("test@example.com", "newpassword");

      expect(result).toBe(true);
      expect(statementMock.run).toHaveBeenCalled();
    });

    it("should return false if user does not exist", async () => {
      statementMock.get.and.returnValue(undefined);

      const result = await authService.resetPassword("nonexistent@example.com", "newpassword");

      expect(result).toBe(false);
      expect(statementMock.run).not.toHaveBeenCalled();
    });
  });

  describe("ensureUserProfile", () => {
    it("should return existing profile_element_id if present", async () => {
      statementMock.get.and.returnValue({ profile_element_id: 999 });

      const result = await authService.ensureUserProfile(1, "testuser");

      expect(result).toBe(999);
      expect(statementMock.run).not.toHaveBeenCalled();
    });

    it("should create new profile if not present", async () => {
      // 1. SELECT profile_element_id
      // 2. SELECT id FROM element_types
      // 3. INSERT INTO elements
      // 4. UPDATE users
      // 5. INSERT INTO content
      // 6. INSERT INTO place
      // 7. INSERT INTO file
      
      statementMock.get.and.callFake((...args: any[]) => {
        if (prepareSpy.calls.mostRecent().args[0].includes("SELECT profile_element_id")) return null;
        if (prepareSpy.calls.mostRecent().args[0].includes("SELECT id FROM element_types")) return { id: 5 };
        return null;
      });
      
      statementMock.run.and.returnValue({ lastInsertRowid: 777 });

      const result = await authService.ensureUserProfile(1, "testuser");

      expect(result).toBe(777);
      expect(statementMock.run).toHaveBeenCalled();
    });
  });

  describe("handleGoogleAuth", () => {
    it("should return existing user if found", async () => {
      const mockUser = { id: 1, username: "googleuser", email: "google@example.com", google_id: "sub123" };
      statementMock.get.and.returnValue(mockUser);
      spyOn(authService, "ensureUserProfile").and.resolveTo(100);

      const result = await authService.handleGoogleAuth({ sub: "sub123", email: "google@example.com" });

      expect(result).toEqual(jasmine.objectContaining({ id: 1, email: "google@example.com" }));
    });

    it("should create new user if not found", async () => {
      statementMock.get.and.callFake((...args: any[]) => {
        if (prepareSpy.calls.mostRecent().args[0].includes("SELECT * FROM users")) return null;
        if (prepareSpy.calls.mostRecent().args[0].includes("SELECT id FROM roles")) return { id: 3 };
        return null;
      });
      statementMock.run.and.returnValue({ lastInsertRowid: 888 });
      spyOn(authService, "ensureUserProfile").and.resolveTo(200);

      const result = await authService.handleGoogleAuth({ sub: "newgoogle", email: "newgoogle@example.com" });

      expect(result.id).toBe(888);
      expect(result.email).toBe("newgoogle@example.com");
    });
  });
});

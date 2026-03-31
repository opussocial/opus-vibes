import { ConfigService } from "../server/services/ConfigService";
import { SettingsService } from "../server/services/SettingsService";
import { AdminService } from "../server/services/AdminService";
import { db } from "../server/db";
import express from "express";
import supertest from "supertest";
import configRouter from "../server/routes/config";
import settingsRouter from "../server/routes/settings";
import adminRouter from "../server/routes/admin";
import cookieParser from "cookie-parser";

describe("Config, Settings & Admin", () => {
  let statementMock: any;
  let prepareSpy: jasmine.Spy;

  beforeEach(() => {
    statementMock = {
      get: jasmine.createSpy("get"),
      run: jasmine.createSpy("run"),
      all: jasmine.createSpy("all")
    };
    prepareSpy = spyOn(db, "prepare").and.returnValue(statementMock);
  });

  describe("ConfigService", () => {
    let configService: ConfigService;
    beforeEach(() => { configService = new ConfigService(); });

    it("should get config", async () => {
      statementMock.all.and.returnValue([{ key: "site_name", value: '"My App"' }]);
      const result = await configService.getConfig();
      expect(result[0].value).toBe("My App");
    });

    it("should update config", async () => {
      await configService.updateConfig("test", { a: 1 });
      expect(statementMock.run).toHaveBeenCalledWith("test", '{"a":1}');
    });
  });

  describe("SettingsService", () => {
    let settingsService: SettingsService;
    beforeEach(() => { settingsService = new SettingsService(); });

    it("should get settings", async () => {
      statementMock.all.and.returnValue([{ key: "theme", value: '"dark"' }]);
      const result = await settingsService.getSettings({ user_id: 1 });
      expect(result.theme).toBe("dark");
    });
  });

  describe("AdminService", () => {
    let adminService: AdminService;
    beforeEach(() => { adminService = new AdminService(); });

    it("should get users", async () => {
      statementMock.all.and.returnValue([{ id: 1, username: "user", settings: "{}" }]);
      const result = await adminService.getUsers();
      expect(result[0].username).toBe("user");
    });

    it("should create a role", async () => {
      statementMock.run.and.returnValue({ lastInsertRowid: 1 });
      statementMock.all.and.returnValue([]); // No types for permissions
      const id = await adminService.createRole({ name: "Editor", description: "Edits things" });
      expect(id).toBe(1);
      expect(db.prepare).toHaveBeenCalledWith(jasmine.stringMatching(/INSERT INTO roles/));
    });

    it("should update role permissions", async () => {
      statementMock.get.and.returnValue({ id: 1 });
      await adminService.updateRolePermissions("1", [1, 2]);
      expect(db.prepare).toHaveBeenCalledWith(jasmine.stringMatching(/DELETE FROM role_permissions/));
      expect(db.prepare).toHaveBeenCalledWith(jasmine.stringMatching(/INSERT INTO role_permissions/));
    });
  });

  describe("Routes Integration", () => {
    let app: express.Application;
    let mockUser: any;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use(cookieParser());
      
      mockUser = {
        id: 123,
        username: "admin",
        role_name: "Super Admin",
        permissions: ["manage_roles"],
        type_permissions: []
      };

      app.use((req: any, res, next) => {
        req.user = mockUser;
        next();
      });

      app.use("/api/config", configRouter);
      app.use("/api/settings", settingsRouter);
      app.use("/api/admin", adminRouter);
    });

    it("GET /api/config should return config", async () => {
      statementMock.all.and.returnValue([]);
      const response = await supertest(app).get("/api/config");
      expect(response.status).toBe(200);
    });

    it("POST /api/settings/settings/:key should update setting", async () => {
      const response = await supertest(app)
        .post("/api/settings/settings/test_key")
        .send({ value: "test_val" });
      expect(response.status).toBe(200);
    });

    it("GET /api/admin/users should return users", async () => {
      statementMock.all.and.returnValue([]);
      const response = await supertest(app).get("/api/admin/users");
      expect(response.status).toBe(200);
    });

    it("POST /api/admin/roles should create role", async () => {
      statementMock.run.and.returnValue({ lastInsertRowid: 1 });
      statementMock.all.and.returnValue([]);
      const response = await supertest(app)
        .post("/api/admin/roles")
        .send({ name: "New Role", description: "Desc" });
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
    });
  });
});

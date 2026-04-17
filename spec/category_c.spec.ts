import { settingsService, featureService, configService, queueService, templateService } from "../server/services";
import { db } from "../server/db";
import express from "express";
import supertest from "supertest";
import settingsRouter from "../server/routes/settings";
import configRouter from "../server/routes/config";
import tasksRouter from "../server/routes/tasks";
import featuresRouter from "../server/routes/features";
import templateRouter from "../server/routes/template";
import cookieParser from "cookie-parser";

describe("Category C: Settings, Features & Config", () => {
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

  describe("SettingsService (Multi-level)", () => {
    it("should get global settings", async () => {
      statementMock.all.and.returnValue([{ key: "site_name", value: '"My App"' }]);
      const settings = await settingsService.getSettings({});
      expect(settings.site_name).toBe("My App");
      expect(prepareSpy).toHaveBeenCalledWith(jasmine.stringMatching(/type_id IS NULL AND user_id IS NULL/));
    });

    it("should get type-level settings", async () => {
      statementMock.all.and.returnValue([{ key: "default_status", value: '"draft"' }]);
      const settings = await settingsService.getSettings({ type_id: 1 });
      expect(settings.default_status).toBe("draft");
      expect(prepareSpy).toHaveBeenCalledWith(jasmine.stringMatching(/type_id = \? AND user_id IS NULL/));
    });

    it("should get user-level settings", async () => {
      statementMock.all.and.returnValue([{ key: "theme", value: '"dark"' }]);
      const settings = await settingsService.getSettings({ user_id: 123 });
      expect(settings.theme).toBe("dark");
      expect(prepareSpy).toHaveBeenCalledWith(jasmine.stringMatching(/type_id IS NULL AND user_id = \?/));
    });

    it("should update a setting with ON CONFLICT", async () => {
      statementMock.run.and.returnValue({ changes: 1 });
      await settingsService.updateSetting("test_key", "test_val", { user_id: 123 });
      expect(statementMock.run).toHaveBeenCalledWith("test_key", '"test_val"', null, 123);
    });
  });

  describe("FeatureService (Switches)", () => {
    it("should check if a feature is enabled", () => {
      statementMock.get.and.returnValue({ enabled: 1 });
      const enabled = featureService.isFeatureEnabled("my_feature");
      expect(enabled).toBe(true);
      expect(prepareSpy).toHaveBeenCalledWith(jasmine.stringMatching(/FROM feature_switches/));
    });

    it("should return false for disabled or missing feature", () => {
      statementMock.get.and.returnValue(null);
      const enabled = featureService.isFeatureEnabled("missing");
      expect(enabled).toBe(false);
    });
  });

  describe("ConfigService (Site Config)", () => {
    it("should get all config keys", async () => {
      statementMock.all.and.returnValue([{ key: "k1", value: '"v1"' }, { key: "k2", value: "123" }]);
      const config = await configService.getConfig();
      expect(config.length).toBe(2);
      expect(config[0].value).toBe("v1");
      expect(config[1].value).toBe(123);
    });
  });

  describe("QueueService (Jobs)", () => {
    it("should add a job to the queue", async () => {
      statementMock.run.and.returnValue({ lastInsertRowid: 100 });
      const id = await queueService.enqueue("test_job", { foo: "bar" });
      expect(id).toBe(100);
      expect(statementMock.run).toHaveBeenCalledWith("test_job", '{"foo":"bar"}', 0);
    });

    it("should pick and complete a task", async () => {
      const mockJob = { id: 1, type: "test_job", payload: '{"foo":"bar"}' };
      statementMock.get.and.returnValue(mockJob);
      statementMock.run.and.returnValue({ changes: 1 });
      
      spyOn(db, "transaction").and.callFake((fn: any) => () => fn());

      const task = await queueService.pickNextTask();
      expect(task?.id).toBe(1);
      
      await queueService.completeTask(1);
      expect(statementMock.run).toHaveBeenCalled();
    });
  });

  describe("TemplateService (Public Data)", () => {
    it("should get element by slug with modular data, parent, children, and neighbors", async () => {
      statementMock.get.and.callFake(() => {
        const query = prepareSpy.calls.mostRecent().args[0].toLowerCase().replace(/\s+/g, " ");
        if (query.includes("from elements") && query.includes("where slug = ?")) return { id: 1, type_id: 1, slug: "test", parent_id: 2 };
        if (query.includes("from element_types")) return { id: 1, name: "Type", slug: "type-slug" };
        if (query.includes("from elements") && query.includes("where id = ?")) return { id: 2, name: "Parent", slug: "parent-slug" };
        if (query.includes("from content")) return { body: "Hello" };
        return null;
      });
      statementMock.all.and.callFake(() => {
        const query = prepareSpy.calls.mostRecent().args[0].toLowerCase().replace(/\s+/g, " ");
        if (query.includes("from properties")) return [{ table_name: "content" }];
        if (query.includes("from elements") && query.includes("where parent_id = ?")) return [{ id: 3, name: "Child", slug: "child-slug" }];
        if (query.includes("from elements e join graph_edges ge")) return [{ id: 4, name: "Neighbor", slug: "neighbor-slug" }];
        return [];
      });

      const element = await templateService.getElementBySlug("test");
      expect(element).not.toBeNull();
      expect(element.slug).toBe("test");
      expect(element.content.body).toBe("Hello");
      expect(element.parent.name).toBe("Parent");
      expect(element.children.length).toBe(1);
      expect(element.neighbors.length).toBe(1);
      expect(element.type_slug).toBe("type-slug");
    });
  });

  describe("Integration Routes (Category C)", () => {
    let app: express.Application;
    let mockUser: any;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use(cookieParser());
      
      mockUser = {
        id: 1,
        username: "admin",
        role_name: "Super Admin",
        permissions: ["manage_settings", "manage_config", "manage_roles"],
        type_permissions: []
      };

      app.use((req: any, res, next) => {
        req.user = mockUser;
        next();
      });

      app.use("/api", settingsRouter);
      app.use("/api", configRouter);
      app.use("/api", tasksRouter);
      app.use("/api", featuresRouter);
      app.use("/api", templateRouter);
    });

    it("GET /api/settings should return settings", async () => {
      spyOn(settingsService, "getSettings").and.resolveTo({ theme: "dark" });
      const response = await supertest(app).get("/api/settings");
      expect(response.status).toBe(200);
      expect(response.body.theme).toBe("dark");
    });

    it("POST /api/config/:key should update config", async () => {
      spyOn(configService, "updateConfig").and.resolveTo();
      const response = await supertest(app)
        .put("/api/site_name")
        .send({ value: "New Name" });
      expect(response.status).toBe(200);
    });

    it("GET /api/tasks should return tasks", async () => {
      spyOn(queueService, "getTasks").and.resolveTo([{ id: 1, type: "test" }] as any);
      const response = await supertest(app).get("/api/tasks");
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
    });

    it("GET /api/features should return features", async () => {
      spyOn(featureService, "getAllFeatures").and.resolveTo({ f1: true } as any);
      const response = await supertest(app).get("/api/features");
      expect(response.status).toBe(200);
      expect(response.body.f1).toBe(true);
    });

    it("GET /api/theme/element/:slug should return element", async () => {
      spyOn(templateService, "getElementBySlug").and.resolveTo({ id: 1, slug: "test" } as any);
      spyOn(templateService, "getChildren").and.resolveTo([]);
      spyOn(templateService, "getRelatedElements").and.resolveTo([]);
      const response = await supertest(app).get("/api/theme/element/test");
      expect(response.status).toBe(200);
      expect(response.body.element.slug).toBe("test");
    });
  });
});

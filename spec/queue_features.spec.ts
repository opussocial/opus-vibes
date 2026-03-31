import { queueService } from "../server/services";
import { featureService } from "../server/services/FeatureService";
import { db } from "../server/db";
import supertest from "supertest";
import express from "express";
import taskRouter from "../server/routes/tasks";
import featureRouter from "../server/routes/features";

describe("QueueService", () => {
  let statementMock: any;

  beforeEach(() => {
    statementMock = {
      get: jasmine.createSpy("get"),
      run: jasmine.createSpy("run"),
      all: jasmine.createSpy("all")
    };
    spyOn(db, "prepare").and.returnValue(statementMock);
    spyOn(db, "transaction").and.callFake((fn: any) => fn);
  });

  it("should enqueue a task", async () => {
    statementMock.run.and.returnValue({ lastInsertRowid: 1 });
    const id = await queueService.enqueue("test", { foo: "bar" });
    expect(id).toBe(1);
    expect(db.prepare).toHaveBeenCalledWith(jasmine.stringMatching(/INSERT INTO tasks/));
  });

  it("should pick the next task", async () => {
    statementMock.get.and.returnValue({ id: 1, type: "test", payload: '{"foo":"bar"}', status: "pending" });
    const task = await queueService.pickNextTask();
    expect(task?.id).toBe(1);
    expect(task?.payload.foo).toBe("bar");
    expect(db.prepare).toHaveBeenCalledWith(jasmine.stringMatching(/UPDATE tasks/));
  });
});

describe("FeatureService", () => {
  let statementMock: any;

  beforeEach(() => {
    statementMock = {
      get: jasmine.createSpy("get"),
      run: jasmine.createSpy("run"),
      all: jasmine.createSpy("all")
    };
    spyOn(db, "prepare").and.returnValue(statementMock);
  });

  it("should check if feature is enabled", () => {
    statementMock.get.and.returnValue({ enabled: 1 });
    expect(featureService.isFeatureEnabled("test")).toBe(true);
  });

  it("should set feature enabled", async () => {
    await featureService.setFeatureEnabled("test", true);
    expect(db.prepare).toHaveBeenCalledWith(jasmine.stringMatching(/INSERT INTO feature_switches/));
  });
});

describe("Task & Feature Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use((req: any, res, next) => {
      req.user = { id: 1, username: "admin", role_name: "Super Admin", permissions: ["manage_roles"] };
      next();
    });
    app.use("/api/tasks", taskRouter);
    app.use("/api", featureRouter);
  });

  it("GET /api/tasks should return tasks", async () => {
    spyOn(queueService, "getTasks").and.resolveTo([]);
    const response = await supertest(app).get("/api/tasks/tasks");
    expect(response.status).toBe(200);
  });

  it("GET /api/features should return features", async () => {
    spyOn(featureService, "getAllFeatures").and.resolveTo({ test: true });
    const response = await supertest(app).get("/api/features");
    expect(response.status).toBe(200);
    expect(response.body.test).toBe(true);
  });

  it("POST /api/features/:name should toggle feature", async () => {
    spyOn(featureService, "setFeatureEnabled").and.resolveTo();
    const response = await supertest(app)
      .post("/api/features/test")
      .send({ enabled: true });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

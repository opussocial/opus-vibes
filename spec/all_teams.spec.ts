import { db } from "../server/db";
import express from "express";
import supertest from "supertest";
import authRouter from "../server/routes/auth";
import elementRouter from "../server/routes/elements";
import schemaRouter from "../server/routes/schema";
import configRouter from "../server/routes/config";
import templateRouter from "../server/routes/template";
import definitionRouter from "../server/routes/definition";
import cookieParser from "cookie-parser";

describe("All Teams Integration Flow", () => {
  let app: express.Application;
  let statementMock: any;
  let prepareSpy: jasmine.Spy;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());

    statementMock = {
      get: jasmine.createSpy("get"),
      run: jasmine.createSpy("run"),
      all: jasmine.createSpy("all").and.returnValue([])
    };
    prepareSpy = spyOn(db, "prepare").and.returnValue(statementMock);
    spyOn(db, "transaction").and.callFake((fn: any) => fn);

    // Mock user for all routes
    app.use((req: any, res, next) => {
      req.user = {
        id: 1,
        username: "admin",
        role_name: "Super Admin",
        permissions: ["manage_roles", "manage_types"],
        type_permissions: [{ type_id: 1, can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 }]
      };
      next();
    });

    app.use("/api/auth", authRouter);
    app.use("/api/elements", elementRouter);
    app.use("/api/schema", schemaRouter);
    app.use("/api/config", configRouter);
    app.use("/api/definition", definitionRouter);
    app.use("/api", templateRouter);
  });

  it("should perform a full cross-functional flow", async () => {
    // 1. Schema: Create a type
    statementMock.run.and.returnValue({ lastInsertRowid: 1 });
    statementMock.get.and.returnValue({ id: 1 }); // Role check
    const typeRes = await supertest(app)
      .post("/api/schema/types")
      .send({ name: "Page", description: "A page", properties: [] });
    expect(typeRes.status).toBe(200);
    expect(typeRes.body.id).toBe(1);

    // 2. Elements: Create an element of that type
    statementMock.get.and.callFake((...args: any[]) => {
      const query = prepareSpy.calls.mostRecent().args[0];
      if (query.includes("FROM elements")) return null; // Slug check
      return null;
    });
    statementMock.run.and.returnValue({ lastInsertRowid: 10 });
    const elRes = await supertest(app)
      .post("/api/elements/elements")
      .send({ name: "Home", type_id: 1, modular_data: {} });
    expect(elRes.status).toBe(200);
    expect(elRes.body.id).toBe(10);

    // 3. Template: Fetch the element
    statementMock.get.and.callFake((...args: any[]) => {
      const query = prepareSpy.calls.mostRecent().args[0];
      if (query.includes("FROM elements")) return { id: 10, name: "Home", slug: "home", type_id: 1 };
      if (query.includes("FROM element_types")) return { name: "Page" };
      if (query.includes("FROM settings")) return { value: '"home"' };
      return null;
    });
    statementMock.all.and.returnValue([]);
    const templateRes = await supertest(app).get("/api/theme/element/home");
    expect(templateRes.status).toBe(200);
    expect(templateRes.body.element.name).toBe("Home");

    // 4. Config: Update site name
    const configRes = await supertest(app)
      .put("/api/config/site_name")
      .send({ value: "My New Site" });
    expect(configRes.status).toBe(200);
    expect(configRes.body.success).toBe(true);

    // 5. Definition: Export the app definition
    statementMock.all.and.callFake((...args: any[]) => {
      const query = prepareSpy.calls.mostRecent().args[0];
      if (query.includes("FROM element_types")) return [{ id: 1, slug: "page", name: "Page" }];
      return [];
    });
    const exportRes = await supertest(app).get("/api/definition/export");
    expect(exportRes.status).toBe(200);
    expect(exportRes.body.element_types.length).toBe(1);
    expect(exportRes.body.element_types[0].slug).toBe("page");
  });
});

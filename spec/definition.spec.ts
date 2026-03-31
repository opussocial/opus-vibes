import { definitionService } from "../server/services";
import { db } from "../server/db";
import supertest from "supertest";
import express from "express";
import definitionRouter from "../server/routes/definition";

describe("DefinitionService", () => {
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

  it("should export app definition", async () => {
    statementMock.all.and.callFake((...args: any[]) => {
      const query = (db.prepare as jasmine.Spy).calls.mostRecent().args[0];
      if (query.includes("FROM element_types")) return [{ id: 1, slug: "page", name: "Page" }];
      if (query.includes("FROM properties")) return [{ table_name: "page_data", label: "Data" }];
      if (query.includes("FROM type_hierarchy")) return [{ slug: "folder" }];
      if (query.includes("FROM roles")) return [{ id: 1, slug: "admin", name: "Admin" }];
      if (query.includes("FROM permissions")) return [{ name: "manage_types" }];
      if (query.includes("FROM role_type_permissions")) return [{ type_slug: "page", can_view: 1 }];
      if (query.includes("FROM graph_relationship_types")) return [{ name: "links", source_slug: "page", target_slug: "page" }];
      return [];
    });
    
    const def = await definitionService.exportDefinition();
    
    expect(def.element_types.length).toBe(1);
    expect(def.element_types[0].slug).toBe("page");
    expect(def.roles.length).toBe(1);
    expect(def.relationship_types.length).toBe(1);
  });

  it("should import app definition", async () => {
    const def = {
      metadata: { exported_at: "now", version: "1.0.0" },
      element_types: [{ slug: "page", name: "Page", properties: [], allowed_parents: [] }],
      roles: [{ slug: "admin", name: "Admin", permissions: [], type_permissions: [] }],
      relationship_types: []
    };
    
    statementMock.get.and.returnValue(null); // No existing types/roles
    statementMock.run.and.returnValue({ lastInsertRowid: 1 });
    
    await definitionService.importDefinition(def as any);
    
    expect(db.prepare).toHaveBeenCalledWith(jasmine.stringMatching(/INSERT INTO element_types/));
    expect(db.prepare).toHaveBeenCalledWith(jasmine.stringMatching(/INSERT INTO roles/));
  });
});

describe("Definition Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use((req: any, res, next) => {
      req.user = { id: 1, username: "testuser", permissions: ["manage_types"] };
      next();
    });
    app.use("/api", definitionRouter);
  });

  it("GET /api/export should return definition", async () => {
    spyOn(definitionService, "exportDefinition").and.resolveTo({
      metadata: { exported_at: "now", version: "1.0.0" },
      element_types: [],
      roles: [],
      relationship_types: []
    });
    
    const response = await supertest(app).get("/api/export");
    
    expect(response.status).toBe(200);
    expect(response.body.metadata.version).toBe("1.0.0");
  });

  it("POST /api/import should import definition", async () => {
    spyOn(definitionService, "importDefinition").and.resolveTo();
    
    const response = await supertest(app)
      .post("/api/import")
      .send({ metadata: {}, element_types: [], roles: [], relationship_types: [] });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

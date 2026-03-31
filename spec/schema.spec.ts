import { schemaService } from "../server/services";
import { db } from "../server/db";
import express from "express";
import supertest from "supertest";
import schemaRouter from "../server/routes/schema";
import cookieParser from "cookie-parser";

describe("Schema", () => {
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

  describe("SchemaService", () => {
    it("should get all element types", async () => {
      const mockTypes = [{ id: 1, name: "Type 1", slug: "type-1" }];
      statementMock.all.and.callFake((...args: any[]) => {
        const query = prepareSpy.calls.mostRecent().args[0];
        if (query.includes("FROM element_types")) return mockTypes;
        if (query.includes("FROM properties")) return [{ id: 1, label: "Prop" }];
        if (query.includes("FROM type_hierarchy")) return [{ parent_type_id: 2 }];
        return [];
      });
      statementMock.get.and.returnValue({ count: 5 });

      const result = await schemaService.getTypes();

      expect(result.length).toBe(1);
      expect(result[0].name).toBe("Type 1");
      expect(result[0].properties.length).toBe(1);
      expect(result[0].element_count).toBe(5);
    });

    it("should create a new type", async () => {
      statementMock.run.and.returnValue({ lastInsertRowid: 10 });
      statementMock.get.and.returnValue({ id: 1 }); // For admin role check
      
      spyOn(db, "transaction").and.callFake((fn: any) => fn);

      const data = {
        name: "New Type",
        description: "Desc",
        properties: [{ table_name: "content", label: "Content" }],
        allowed_parent_types: [1]
      };

      const id = await schemaService.createType(data);

      expect(id).toBe(10);
      expect(statementMock.run).toHaveBeenCalled();
    });
  });

  describe("Schema Routes", () => {
    let app: express.Application;
    let mockUser: any;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use(cookieParser());
      
      mockUser = {
        id: 123,
        username: "admin",
        permissions: ["manage_types"],
        type_permissions: []
      };

      app.use((req: any, res, next) => {
        req.user = mockUser;
        next();
      });

      app.use("/api/schema", schemaRouter);
    });

    it("GET /types should return types", async () => {
      spyOn(schemaService, "getTypes").and.resolveTo([{ id: 1, name: "Test" }] as any);
      
      const response = await supertest(app).get("/api/schema/types");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ id: 1, name: "Test" }]);
    });

    it("POST /types should create type", async () => {
      spyOn(schemaService, "createType").and.resolveTo(10);
      
      const response = await supertest(app)
        .post("/api/schema/types")
        .send({ 
          name: "New Type", 
          description: "Desc", 
          properties: [{ table_name: "content", label: "Content" }] 
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(10);
    });

    it("DELETE /types/:id should delete type", async () => {
      spyOn(schemaService, "deleteType").and.resolveTo();
      
      const response = await supertest(app).delete("/api/schema/types/1");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

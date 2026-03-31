import { elementService } from "../server/services";
import { db } from "../server/db";
import express from "express";
import supertest from "supertest";
import elementRouter from "../server/routes/elements";
import cookieParser from "cookie-parser";

describe("Elements", () => {
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

  describe("ElementService", () => {
    it("should get elements based on allowed types", async () => {
      const mockElements = [{ id: 1, name: "Element 1", type_id: 1 }];
      statementMock.all.and.returnValue(mockElements);

      const result = await elementService.getElements([1], 123, false);

      expect(result).toEqual(mockElements);
      expect(db.prepare).toHaveBeenCalled();
      const query = prepareSpy.calls.mostRecent().args[0];
      expect(query).toContain("WHERE e.type_id IN (?)");
      expect(query).toContain("AND (e.user_id = ? OR e.user_id IS NULL)");
      expect(statementMock.all).toHaveBeenCalledWith(1, 123);
    });

    it("should get root elements", async () => {
      const mockRoots = [{ id: 1, name: "Root", parent_id: null }];
      statementMock.all.and.returnValue(mockRoots);

      const result = await elementService.getRootElements([1], 123, false);

      expect(result).toEqual(mockRoots);
      expect(prepareSpy.calls.mostRecent().args[0]).toContain("WHERE e.parent_id IS NULL");
    });

    it("should get a single element with its modular data", async () => {
      const mockElement = { id: 1, name: "Element", type_id: 5 };
      statementMock.get.and.callFake((...args: any[]) => {
        const query = prepareSpy.calls.mostRecent().args[0];
        if (query.includes("FROM elements")) return mockElement;
        if (query.includes("FROM content")) return { body: "Hello" };
        return null;
      });
      statementMock.all.and.callFake((...args: any[]) => {
        const query = prepareSpy.calls.mostRecent().args[0];
        if (query.includes("FROM properties")) return [{ table_name: "content" }];
        if (query.includes("FROM interactions")) return [];
        if (query.includes("FROM graph_edges")) return [];
        return [];
      });

      const result = await elementService.getElement("1", 123, true);

      expect(result.id).toBe(1);
      expect(result.content).toEqual({ body: "Hello" });
    });

    it("should create an element and its modular data", async () => {
      statementMock.get.and.returnValue(null); // For slug uniqueness check
      statementMock.run.and.returnValue({ lastInsertRowid: 10 });
      statementMock.all.and.returnValue([{ table_name: "content" }]);
      
      spyOn(db, "transaction").and.callFake((fn: any) => fn);

      const data = {
        name: "New Element",
        type_id: 1,
        parent_id: null,
        modular_data: { content: { body: "Test" } }
      };

      const id = await elementService.createElement(data, 123);

      expect(id).toBe(10);
      expect(statementMock.run).toHaveBeenCalled();
    });
  });

  describe("Element Routes", () => {
    let app: express.Application;
    let mockUser: any;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use(cookieParser());
      
      mockUser = {
        id: 123,
        username: "testuser",
        permissions: ["manage_elements"],
        type_permissions: [{ type_id: 1, can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 }]
      };

      app.use((req: any, res, next) => {
        req.user = mockUser;
        next();
      });

      app.use("/api", elementRouter);
    });

    it("GET /elements should return elements", async () => {
      spyOn(elementService, "getElements").and.resolveTo([{ id: 1, name: "Test" }] as any);
      
      const response = await supertest(app).get("/api/elements");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ id: 1, name: "Test" }]);
    });

    it("POST /elements should create element", async () => {
      spyOn(elementService, "createElement").and.resolveTo(10);
      
      const response = await supertest(app)
        .post("/api/elements")
        .send({ name: "New", type_id: 1, modular_data: {} });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(10);
    });

    it("DELETE /elements/:id should delete element", async () => {
      statementMock.get.and.returnValue({ type_id: 1 }); // For checkTypePermission
      spyOn(elementService, "deleteElement").and.resolveTo();
      
      const response = await supertest(app).delete("/api/elements/1");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

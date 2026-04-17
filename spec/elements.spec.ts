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
      const mockElements = [{ id: 1, name: "Element 1", type_id: 1, type_name: "T", type_slug: "t", slug: "e1", created_at: "", updated_at: "" }] as any[];
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
      const mockRoots = [{ id: 1, name: "Root", parent_id: null, type_id: 1, type_name: "T", type_slug: "t", slug: "r1", created_at: "", updated_at: "" }] as any[];
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

    it("should update an element and its modular data", async () => {
      const mockElement = { id: 1, type_id: 1 };
      statementMock.get.and.returnValue(mockElement);
      statementMock.run.and.returnValue({ changes: 1 });
      statementMock.all.and.returnValue([{ table_name: "content" }]);
      
      spyOn(db, "transaction").and.callFake((fn: any) => fn);

      const data = {
        name: "Updated Element",
        parent_id: null,
        modular_data: { content: { body: "Updated" } }
      };

      await elementService.updateElement("1", data, 123, false);

      expect(statementMock.run).toHaveBeenCalled();
      const queries = prepareSpy.calls.all().map(c => c.args[0]);
      expect(queries).toContain("UPDATE elements SET name = ?, parent_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    });

    it("should delete an element", async () => {
      statementMock.get.and.returnValue({ id: 1 });
      statementMock.run.and.returnValue({ changes: 1 });

      await elementService.deleteElement("1", 123, false);

      expect(statementMock.run).toHaveBeenCalled();
      const query = prepareSpy.calls.mostRecent().args[0];
      expect(query).toContain("DELETE FROM elements WHERE id = ?");
    });

    it("should get children of an element", async () => {
      statementMock.get.and.returnValue({ id: 1 });
      statementMock.all.and.returnValue([{ id: 2, name: "Child" }]);

      const children = await elementService.getChildren("1");

      expect(children.length).toBe(1);
      expect(children[0].name).toBe("Child");
      const query = prepareSpy.calls.mostRecent().args[0];
      expect(query).toContain("WHERE e.parent_id = ?");
    });

    it("should get parent of an element", async () => {
      statementMock.get.and.callFake((...args: any[]) => {
        const query = prepareSpy.calls.mostRecent().args[0];
        if (query.includes("parent_id FROM elements")) return { parent_id: 10 };
        if (query.includes("SELECT e.*")) return { id: 10, name: "Parent" };
        return null;
      });

      const parent = await elementService.getParent("1");

      expect(parent?.id).toBe(10);
      expect(parent?.name).toBe("Parent");
    });

    it("should get graph edges for an element", async () => {
      statementMock.get.and.returnValue({ id: 1 });
      statementMock.all.and.returnValue([{ id: 100, rel_name: "related" }]);

      const graph = await elementService.getGraph("1");

      expect(graph.length).toBe(1);
      expect(graph[0].rel_name).toBe("related");
    });

    it("should create a graph edge", async () => {
      statementMock.run.and.returnValue({ lastInsertRowid: 50 });

      const id = await elementService.createGraphEdge({ rel_type_id: 1, source_el_id: 1, target_el_id: 2 });

      expect(id).toBe(50);
      expect(statementMock.run).toHaveBeenCalled();
    });

    it("should delete a graph edge", async () => {
      statementMock.run.and.returnValue({ changes: 1 });

      await elementService.deleteGraphEdge(50);

      expect(statementMock.run).toHaveBeenCalled();
      const query = prepareSpy.calls.mostRecent().args[0];
      expect(query).toContain("DELETE FROM graph_edges WHERE id = ?");
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

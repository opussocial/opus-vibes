import { schemaService, adminService } from "../server/services";
import { db } from "../server/db";
import express from "express";
import supertest from "supertest";
import schemaRouter from "../server/routes/schema";
import adminRouter from "../server/routes/admin";
import cookieParser from "cookie-parser";
import { checkTypePermission } from "../server/middleware";

describe("Category B: Types and Roles", () => {
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

  describe("SchemaService (Types & Hierarchy)", () => {
    it("should update a type and its hierarchy", async () => {
      statementMock.get.and.returnValue({ id: 1, name: "Type 1" });
      statementMock.run.and.returnValue({ changes: 1 });
      statementMock.all.and.returnValue([]); // No elements, no parents
      
      spyOn(db, "transaction").and.callFake((fn: any) => fn);

      const data = {
        name: "Updated Type",
        description: "New Desc",
        properties: [],
        allowed_parent_types: [2]
      };

      await schemaService.updateType("1", data);

      expect(statementMock.run).toHaveBeenCalled();
      const queries = prepareSpy.calls.all().map(c => c.args[0]);
      expect(queries).toContain(jasmine.stringMatching(/UPDATE element_types/));
      expect(queries).toContain(jasmine.stringMatching(/INSERT INTO type_hierarchy/));
    });

    it("should throw error on circular dependency in hierarchy", async () => {
      statementMock.get.and.returnValue({ id: 1, name: "Type 1" });
      statementMock.all.and.returnValue([{ parent_type_id: 1 }]); // Circular: 1 is parent of 2, and we try to make 2 parent of 1
      
      spyOn(db, "transaction").and.callFake((fn: any) => fn);

      const data = {
        name: "Type 1",
        description: "Desc",
        properties: [],
        allowed_parent_types: [2]
      };

      await expectAsync(schemaService.updateType("1", data)).toBeRejectedWithError(/Circular dependency detected/);
    });

    it("should create a relationship type", async () => {
      statementMock.run.and.returnValue({ lastInsertRowid: 5 });
      
      const id = await schemaService.createRelationshipType({
        source_type_id: 1,
        target_type_id: 2,
        name: "Related To"
      });

      expect(id).toBe(5);
      expect(statementMock.run).toHaveBeenCalledWith(1, 2, "Related To");
    });
  });

  describe("AdminService (Roles & Permissions)", () => {
    it("should update user role", async () => {
      statementMock.run.and.returnValue({ changes: 1 });
      await adminService.updateUserRole(123, 2);
      expect(statementMock.run).toHaveBeenCalledWith(2, 123);
    });

    it("should update role type permissions", async () => {
      statementMock.get.and.callFake((...args: any[]) => {
        const query = prepareSpy.calls.mostRecent().args[0];
        if (query.includes("FROM roles")) return { id: 1 };
        if (query.includes("FROM element_types")) return { id: 2 };
        return null;
      });
      statementMock.run.and.returnValue({ changes: 1 });

      await adminService.updateRoleTypePermissions("admin", "page", { can_view: true, can_edit: true });

      expect(statementMock.run).toHaveBeenCalledWith(1, 0, 1, 0, 1, 2);
    });

    it("should get roles with permissions and type permissions", async () => {
      statementMock.all.and.callFake((...args: any[]) => {
        const query = prepareSpy.calls.mostRecent().args[0];
        if (query.includes("SELECT * FROM roles")) return [{ id: 1, name: "Admin" }];
        if (query.includes("FROM permissions")) return [{ id: 1, name: "manage_roles" }];
        if (query.includes("FROM role_type_permissions")) return [{ type_id: 1, can_view: 1 }];
        return [];
      });

      const roles = await adminService.getRoles();

      expect(roles.length).toBe(1);
      expect(roles[0].permissions.length).toBe(1);
      expect(roles[0].type_permissions.length).toBe(1);
    });
  });

  describe("Middleware (Type Permissions)", () => {
    let req: any, res: any, next: jasmine.Spy;

    beforeEach(() => {
      req = {
        body: {},
        params: {},
        user: {
          type_permissions: [
            { type_id: 1, can_view: 1, can_create: 0 }
          ]
        }
      };
      res = {
        status: jasmine.createSpy("status").and.callFake(() => res),
        json: jasmine.createSpy("json")
      };
      next = jasmine.createSpy("next");
    });

    it("should allow access if permission exists", () => {
      req.params.type_id = 1;
      const middleware = checkTypePermission("can_view");
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should deny access if permission is missing", () => {
      req.params.type_id = 1;
      const middleware = checkTypePermission("can_create");
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("should deny access if type is not in permissions list", () => {
      req.params.type_id = 999;
      const middleware = checkTypePermission("can_view");
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe("Integration Routes (Category B)", () => {
    let app: express.Application;
    let mockUser: any;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use(cookieParser());
      
      mockUser = {
        id: 1,
        username: "admin",
        permissions: ["manage_types", "manage_roles", "manage_users"],
        type_permissions: []
      };

      app.use((req: any, res, next) => {
        req.user = mockUser;
        next();
      });

      app.use("/api/schema", schemaRouter);
      app.use("/api/admin", adminRouter);
    });

    it("POST /api/schema/relationship-types should create rel type", async () => {
      spyOn(schemaService, "createRelationshipType").and.resolveTo(1);
      const response = await supertest(app)
        .post("/api/schema/relationship-types")
        .send({ source_type_id: 1, target_type_id: 2, name: "Rel" });
      expect(response.status).toBe(200);
    });

    it("PUT /api/admin/users/:id/role should update user role", async () => {
      spyOn(adminService, "updateUserRole").and.resolveTo();
      const response = await supertest(app)
        .put("/api/admin/users/123/role")
        .send({ role_id: 2 });
      expect(response.status).toBe(200);
    });

    it("PUT /api/admin/roles/:roleId/type-permissions/:typeId should update type perms", async () => {
      spyOn(adminService, "updateRoleTypePermissions").and.resolveTo();
      const response = await supertest(app)
        .put("/api/admin/roles/1/type-permissions/2")
        .send({ can_edit: true });
      expect(response.status).toBe(200);
    });
  });
});

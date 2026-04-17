import { templateService } from "../server/services/TemplateService";
import { db } from "../server/db";
import express from "express";
import supertest from "supertest";
import templateRouter from "../server/routes/template";

describe("Template System", () => {
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

  describe("TemplateService", () => {
    it("should get element by slug with modular data", async () => {
      const mockElement = { id: 1, name: "Home", slug: "home", type_id: 1 };
      statementMock.get.and.callFake((...args: any[]) => {
        const query = prepareSpy.calls.mostRecent().args[0];
        if (query.includes("FROM elements")) return mockElement;
        if (query.includes("FROM element_types")) return { name: "Page" };
        if (query.includes("FROM content")) return { body: "Welcome" };
        return null;
      });
      statementMock.all.and.returnValue([{ table_name: "content" }]);

      const result = await templateService.getElementBySlug("home");

      expect(result.name).toBe("Home");
      expect(result.content.body).toBe("Welcome");
      expect(result.type_name).toBe("Page");
    });
  });

  describe("Template Routes", () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use("/api", templateRouter);
    });

    it("GET /theme/element/:slug should return element data", async () => {
      spyOn(templateService, "getElementBySlug").and.resolveTo({ id: 1, name: "Test" } as any);
      spyOn(templateService, "getChildren").and.resolveTo([]);
      spyOn(templateService, "getRelatedElements").and.resolveTo([]);

      const response = await supertest(app).get("/api/theme/element/test");

      expect(response.status).toBe(200);
      expect(response.body.element.name).toBe("Test");
    });
  });
});

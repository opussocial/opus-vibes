import { themeService } from "../server/services/ThemeService";
import { db } from "../server/db";
import express from "express";
import supertest from "supertest";
import themeRouter from "../server/routes/theme";

describe("Theme", () => {
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

  describe("ThemeService", () => {
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

      const result = await themeService.getElementBySlug("home");

      expect(result.name).toBe("Home");
      expect(result.content.body).toBe("Welcome");
      expect(result.type_name).toBe("Page");
    });
  });

  describe("Theme Routes", () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use("/api", themeRouter);
    });

    it("GET /theme/element/:slug should return element data", async () => {
      spyOn(themeService, "getElementBySlug").and.resolveTo({ id: 1, name: "Test" } as any);
      spyOn(themeService, "getChildren").and.resolveTo([]);
      spyOn(themeService, "getRelatedElements").and.resolveTo([]);

      const response = await supertest(app).get("/api/theme/element/test");

      expect(response.status).toBe(200);
      expect(response.body.element.name).toBe("Test");
    });
  });
});

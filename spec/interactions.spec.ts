import { interactionService } from "../server/services";
import { db } from "../server/db";
import supertest from "supertest";
import express from "express";
import interactionRouter from "../server/routes/interactions";
import { authMiddleware } from "../server/middleware";

describe("InteractionService", () => {
  let statementMock: any;

  beforeEach(() => {
    statementMock = {
      get: jasmine.createSpy("get"),
      run: jasmine.createSpy("run"),
      all: jasmine.createSpy("all")
    };
    spyOn(db, "prepare").and.returnValue(statementMock);
  });

  it("should get interactions for an element", async () => {
    statementMock.get.and.returnValue({ id: 1 });
    statementMock.all.and.returnValue([{ id: 1, content: "Cool" }]);
    
    const interactions = await interactionService.getInteractions("1");
    
    expect(interactions.length).toBe(1);
    expect(interactions[0].content).toBe("Cool");
  });

  it("should create an interaction", async () => {
    statementMock.get.and.callFake((...args: any[]) => {
      const query = (db.prepare as jasmine.Spy).calls.mostRecent().args[0];
      if (query.includes("FROM elements")) return { id: 1 };
      if (query.includes("FROM interaction_types")) return { name: "comment" };
      return null;
    });
    statementMock.run.and.returnValue({ lastInsertRowid: 10 });
    
    const id = await interactionService.createInteraction("1", 1, { type_id: 1, content: "Nice" });
    
    expect(id).toBe(10);
  });

  it("should prevent duplicate likes", async () => {
    statementMock.get.and.callFake((...args: any[]) => {
      const query = (db.prepare as jasmine.Spy).calls.mostRecent().args[0];
      if (query.includes("FROM elements")) return { id: 1 };
      if (query.includes("FROM interaction_types")) return { name: "like" };
      if (query.includes("FROM interactions")) return { id: 5 }; // Existing like
      return null;
    });
    
    await expectAsync(interactionService.createInteraction("1", 1, { type_id: 1, content: "" }))
      .toBeRejectedWithError("Already liked this element");
  });
});

describe("Interaction Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use((req: any, res, next) => {
      req.user = { id: 1, username: "testuser", permissions: [], type_permissions: [] };
      next();
    });
    app.use("/api", interactionRouter);
  });

  it("GET /api/interaction-types should return types", async () => {
    spyOn(interactionService, "getInteractionTypes").and.resolveTo([{ id: 1, name: "like", icon: "heart" }]);
    
    const response = await supertest(app).get("/api/interaction-types");
    
    expect(response.status).toBe(200);
    expect(response.body[0].name).toBe("like");
  });

  it("POST /api/elements/:id/interactions should create interaction", async () => {
    spyOn(interactionService, "createInteraction").and.resolveTo(10);
    
    const response = await supertest(app)
      .post("/api/elements/1/interactions")
      .send({ type_id: 1, content: "Great!" });
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(10);
  });

  it("DELETE /api/interactions/:id should delete interaction", async () => {
    spyOn(interactionService, "deleteInteraction").and.resolveTo();
    
    const response = await supertest(app).delete("/api/interactions/1");
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

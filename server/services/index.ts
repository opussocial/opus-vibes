import { AuthService } from "./AuthService";
import { SchemaService } from "./SchemaService";
import { ElementService } from "./ElementService";
import { InteractionService } from "./InteractionService";
import { AdminService } from "./AdminService";
import { QueueService } from "./QueueService";
import { DefinitionService } from "./DefinitionService";

export const authService = new AuthService();
export const schemaService = new SchemaService();
export const elementService = new ElementService();
export const interactionService = new InteractionService();
export const adminService = new AdminService();
export const queueService = new QueueService();
export const definitionService = new DefinitionService();

export * from "./interfaces";

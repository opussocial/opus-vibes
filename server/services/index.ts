import { AuthService } from "./AuthService";
import { SchemaService } from "./SchemaService";
import { ElementService } from "./ElementService";
import { InteractionService } from "./InteractionService";
import { AdminService } from "./AdminService";

export const authService = new AuthService();
export const schemaService = new SchemaService();
export const elementService = new ElementService();
export const interactionService = new InteractionService();
export const adminService = new AdminService();

export * from "./interfaces";

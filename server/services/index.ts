import { AuthService } from "./AuthService";
import { SchemaService } from "./SchemaService";
import { ElementService } from "./ElementService";
import { InteractionService } from "./InteractionService";
import { AdminService } from "./AdminService";
import { QueueService } from "./QueueService";
import { DefinitionService } from "./DefinitionService";
import { SettingsService } from "./SettingsService";
import { ConfigService } from "./ConfigService";
import { featureService } from "./FeatureService";
import { templateService } from "./TemplateService";

export const authService = new AuthService();
export const schemaService = new SchemaService();
export const elementService = new ElementService();
export const interactionService = new InteractionService();
export const adminService = new AdminService();
export const queueService = new QueueService();
export const definitionService = new DefinitionService();
export const settingsService = new SettingsService();
export const configService = new ConfigService();
export { featureService, templateService };

export * from "./interfaces";

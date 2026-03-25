import { Element, ElementType, TypePermission, User, Role, Permission, Interaction, InteractionType, RelationshipType, GraphEdge } from "../../src/types";

export interface IAuthService {
  register(username: string, email: string, password: string): Promise<User>;
  login(username: string, password: string): Promise<User | null>;
  resetPassword(email: string, newPassword: string): Promise<boolean>;
  ensureUserProfile(userId: number, username: string): Promise<number | null>;
  handleGoogleAuth(userInfo: { sub: string, email: string }): Promise<User>;
}

export interface ISchemaService {
  getTypes(): Promise<ElementType[]>;
  createType(data: { name: string, description: string, statuses?: string[], color?: string, icon?: string, settings?: any, properties: any[], allowed_parent_types?: number[] }): Promise<number>;
  updateType(idOrSlug: string, data: { name: string, description: string, statuses?: string[], color?: string, icon?: string, settings?: any, properties: any[], allowed_parent_types?: number[] }): Promise<void>;
  deleteType(idOrSlug: string): Promise<void>;
  getRelationshipTypes(): Promise<RelationshipType[]>;
  createRelationshipType(data: { source_type_id: number, target_type_id: number, name: string }): Promise<number>;
  deleteRelationshipType(id: number): Promise<void>;
}

export interface IElementService {
  getElements(allowedTypeIds: number[], userId?: number, canViewAll?: boolean): Promise<Element[]>;
  getRootElements(allowedTypeIds: number[], userId?: number, canViewAll?: boolean): Promise<Element[]>;
  getElement(idOrSlug: string, userId?: number, canViewAll?: boolean): Promise<any>;
  getChildren(idOrSlug: string): Promise<Element[]>;
  getParent(idOrSlug: string): Promise<Element | null>;
  getGraph(idOrSlug: string): Promise<GraphEdge[]>;
  createElement(data: { name: string, type_id: number, parent_id: number | null, modular_data: any }, userId?: number): Promise<number>;
  updateElement(idOrSlug: string, data: { name: string, parent_id: number | null, modular_data: any }, userId?: number, canViewAll?: boolean): Promise<void>;
  deleteElement(idOrSlug: string, userId?: number, canViewAll?: boolean): Promise<void>;
  getAllGraphEdges(): Promise<GraphEdge[]>;
  createGraphEdge(data: { rel_type_id: number, source_el_id: number, target_el_id: number }): Promise<number>;
  deleteGraphEdge(id: number): Promise<void>;
}

export interface IInteractionService {
  getInteractions(elementIdOrSlug: string): Promise<Interaction[]>;
  createInteraction(elementIdOrSlug: string, userId: number, data: { type_id: number, content: string }): Promise<number>;
  deleteInteraction(id: number, userId: number, isAdmin: boolean): Promise<void>;
  getInteractionTypes(): Promise<InteractionType[]>;
}

export interface IAdminService {
  getUsers(): Promise<User[]>;
  updateUserRole(userId: number, roleId: number): Promise<void>;
  getRoles(): Promise<Role[]>;
  createRole(data: { name: string, description: string }): Promise<number>;
  updateRolePermissions(roleIdOrSlug: string, permissionIds: number[]): Promise<void>;
  updateRoleTypePermissions(roleIdOrSlug: string, typeIdOrSlug: string, permissions: Partial<TypePermission>): Promise<void>;
  getPermissions(): Promise<Permission[]>;
}

export interface ISettingsService {
  getSettings(filters: { type_id?: number, user_id?: number }): Promise<any>;
  getSetting(key: string, filters: { type_id?: number, user_id?: number }): Promise<any>;
  updateSetting(key: string, value: any, filters: { type_id?: number, user_id?: number }): Promise<void>;
  deleteSetting(key: string, filters: { type_id?: number, user_id?: number }): Promise<void>;
}

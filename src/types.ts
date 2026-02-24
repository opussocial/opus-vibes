export interface ElementType {
  id: number;
  name: string;
  description: string;
  properties: Property[];
}

export interface Property {
  id: number;
  type_id: number;
  table_name: string;
  label: string;
}

export interface Element {
  id: number;
  type_id: number;
  parent_id?: number;
  type_name: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface RelationshipType {
  id: number;
  source_type_id: number;
  target_type_id: number;
  name: string;
  source_type_name: string;
  target_type_name: string;
}

export interface GraphEdge {
  id: number;
  rel_type_id: number;
  source_el_id: number;
  target_el_id: number;
  rel_name: string;
  source_name: string;
  target_name: string;
}

export interface ElementDetail extends Element {
  [key: string]: any; // Modular data tables
}

export interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  role_name: string;
  permissions: string[];
  type_permissions: TypePermission[];
}

export interface TypePermission {
  role_id: number;
  type_id: number;
  can_view: number;
  can_create: number;
  can_edit: number;
  can_delete: number;
  type_name?: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  type_permissions: TypePermission[];
}

export interface Permission {
  id: number;
  name: string;
  description: string;
}

export const MODULAR_TABLES = [
  { value: "content", label: "Text Content", fields: ["body"] },
  { value: "place", label: "Location/Geo", fields: ["latitude", "longitude", "address"] },
  { value: "file", label: "File/Image", fields: ["filename", "url", "mime_type"] },
  { value: "urls_embeds", label: "URL/Embed", fields: ["url", "title", "embed_code"] },
  { value: "time_tracking", label: "Time Tracking", fields: ["start_time", "end_time", "duration"] },
  { value: "product_info", label: "Product Info", fields: ["sku", "price", "currency", "stock"] },
];

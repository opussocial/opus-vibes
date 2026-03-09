import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: err.issues.map(e => ({ path: e.path, message: e.message }))
      });
    }
    next(err);
  }
};

// Auth Schemas
export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6)
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(6)
});

// Schema Schemas
export const typeSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  statuses: z.array(z.string()).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  properties: z.array(z.object({
    table_name: z.string(),
    label: z.string()
  })),
  allowed_parent_types: z.array(z.number()).optional()
});

export const relationshipTypeSchema = z.object({
  source_type_id: z.number(),
  target_type_id: z.number(),
  name: z.string().min(2)
});

// Interaction Schemas
export const interactionSchema = z.object({
  type_id: z.number(),
  content: z.string().optional()
});

// Admin Schemas
export const updateUserRoleSchema = z.object({
  role_id: z.number()
});

export const createRoleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional()
});

export const rolePermissionsSchema = z.object({
  permission_ids: z.array(z.number())
});

export const roleTypePermissionsSchema = z.object({
  can_view: z.boolean().optional(),
  can_create: z.boolean().optional(),
  can_edit: z.boolean().optional(),
  can_delete: z.boolean().optional()
});

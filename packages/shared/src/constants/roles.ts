import { z } from "zod";

export const RoleSchema = z.enum(["admin", "seller", "delivery"]);
export type Role = z.infer<typeof RoleSchema>;

export const ROLES = RoleSchema.options;

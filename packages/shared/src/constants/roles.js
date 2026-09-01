import { z } from "zod";
export const RoleSchema = z.enum(["admin", "seller", "delivery"]);
export const ROLES = RoleSchema.options;
//# sourceMappingURL=roles.js.map
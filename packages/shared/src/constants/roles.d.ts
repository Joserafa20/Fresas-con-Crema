import { z } from "zod";
export declare const RoleSchema: z.ZodEnum<["admin", "seller", "delivery"]>;
export type Role = z.infer<typeof RoleSchema>;
export declare const ROLES: ["admin", "seller", "delivery"];
//# sourceMappingURL=roles.d.ts.map
import { z } from "zod";
export declare const HealthResponseSchema: z.ZodObject<{
    status: z.ZodLiteral<"ok">;
}, "strip", z.ZodTypeAny, {
    status: "ok";
}, {
    status: "ok";
}>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
//# sourceMappingURL=health.d.ts.map
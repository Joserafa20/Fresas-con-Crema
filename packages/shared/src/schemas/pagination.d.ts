import { z } from "zod";
export declare const PaginationDtoSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type PaginationDto = z.infer<typeof PaginationDtoSchema>;
//# sourceMappingURL=pagination.d.ts.map
import { z } from "zod";

export const mimeEnum = z.enum(["image/jpeg", "image/png", "image/webp"]);
export type MimeType = z.infer<typeof mimeEnum>;

export const priceCentsSchema = z.number().int().min(0);
export const sortOrderSchema = z.number().int();
export const sizeBytesSchema = z.number().int().min(0).max(5 * 1024 * 1024);

export const toppingSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1),
  priceCents: priceCentsSchema.default(1500),
});

export const productVariantSchema = z.object({
  id: z.string().cuid().optional(),
  productId: z.string().cuid().optional(),
  name: z.string().min(1),
  priceCents: priceCentsSchema,
  isActive: z.boolean().default(true),
});

export const productImageSchema = z.object({
  id: z.string().cuid().optional(),
  productId: z.string().cuid().optional(),
  url: z.string().url(),
  mimeType: mimeEnum,
  sizeBytes: sizeBytesSchema,
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  sortOrder: sortOrderSchema.default(0),
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  id: z.string().cuid().optional(),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: sortOrderSchema.default(0),
});

export const priceHistorySchema = z.object({
  id: z.string().cuid().optional(),
  variantId: z.string().cuid(),
  priceCents: priceCentsSchema,
  effectiveFrom: z.coerce.date().optional(),
});

// Create/Update DTOs
export const createProductSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: sortOrderSchema.optional().default(0),
  variants: z.array(productVariantSchema.omit({ productId: true })).optional(),
  toppingIds: z.array(z.string().cuid()).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: sortOrderSchema.optional(),
});

export const createVariantSchema = z.object({
  productId: z.string().cuid(),
  name: z.string().min(1),
  priceCents: priceCentsSchema,
  isActive: z.boolean().optional(),
});

export const updateVariantPriceSchema = z.object({
  priceCents: priceCentsSchema,
});

export const imageUploadMetaSchema = z.object({
  url: z.string().url(),
  mimeType: mimeEnum,
  sizeBytes: sizeBytesSchema,
});

export type ProductDto = z.infer<typeof productSchema>;
export type ProductVariantDto = z.infer<typeof productVariantSchema>;
export type ToppingDto = z.infer<typeof toppingSchema>;
export type ProductImageDto = z.infer<typeof productImageSchema>;
export type PriceHistoryDto = z.infer<typeof priceHistorySchema>;
export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CatalogService } from "../application/catalog.service.js";
import { Roles } from "../guards/roles.decorator.js";
import { RolesGuard } from "../guards/roles.guard.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { createProductSchema, updateProductSchema, updateVariantPriceSchema } from "@maison-fraise/shared";
import { memoryStorage } from "multer";

const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

@Controller()
export class CatalogController {
  constructor(private service: CatalogService) {}

  @Get("products")
  findActive() {
    return this.service.findActive();
  }

  @Get("products/:slug")
  findBySlug(@Param("slug") slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get("variants")
  findVariants() {
    return this.service.findVariants();
  }

  @Get("toppings")
  findToppings() {
    return this.service.findToppings();
  }

  @Post("products")
  @UseGuards(RolesGuard)
  @Roles("admin")
  create(@Body(new ZodValidationPipe(createProductSchema)) body: any) {
    return this.service.create(body);
  }

  @Patch("products/:id")
  @UseGuards(RolesGuard)
  @Roles("admin")
  update(@Param("id") id: string, @Body(new ZodValidationPipe(updateProductSchema)) body: any) {
    return this.service.update(id, body);
  }

  @Patch("variants/:id")
  @UseGuards(RolesGuard)
  @Roles("admin")
  updateVariant(@Param("id") id: string, @Body(new ZodValidationPipe(updateVariantPriceSchema)) body: any) {
    return this.service.updateVariantPrice(id, body.priceCents);
  }

  @Get("variants/:id/price-history")
  getHistory(@Param("id") id: string) {
    return this.service.getPriceHistory(id);
  }

  @Post("products/:id/images")
  @UseGuards(RolesGuard)
  @Roles("admin")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
        if (!allowedMimes.includes(file.mimetype)) {
          return cb(new BadRequestException("Unsupported media type"), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@Param("id") id: string, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    if (!file) throw new BadRequestException("File required");
    if (file.size > MAX_SIZE) throw new BadRequestException("File too large");
    // optional sharp resize to 800w — try but fallback if sharp not available
    let width: number | undefined;
    let height: number | undefined;
    try {
      const sharp = (await import("sharp")).default;
      const meta = await sharp(file.buffer).metadata();
      width = meta.width;
      height = meta.height;
      // we could resize to 800w but store original as URL placeholder for now
    } catch {
      // sharp not available or failed — continue
    }
    // In free-tier, store URL as data URI or placeholder local path; here use provided url or fallback
    const url = body?.url || `https://placeholder.maison-fraise.local/${id}/${file.originalname}`;
    return this.service.createImage(id, {
      url,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      width,
      height,
      sortOrder: body?.sortOrder ? Number(body.sortOrder) : 0,
    });
  }
}

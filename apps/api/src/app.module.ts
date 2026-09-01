import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./modules/health/health.module.js";
import { CatalogModule } from "./catalog/catalog.module.js";
import { validateEnv } from "./config/env.schema.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    HealthModule,
    CatalogModule,
  ],
})
export class AppModule {}

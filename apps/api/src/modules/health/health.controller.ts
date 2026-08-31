import { Controller, Get } from "@nestjs/common";
import { HealthService } from "./health.service.js";
import type { HealthResponse } from "@maison-fraise/shared";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check(): HealthResponse {
    return this.healthService.check();
  }
}

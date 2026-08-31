import { Injectable } from "@nestjs/common";
import type { HealthResponse } from "@maison-fraise/shared";

@Injectable()
export class HealthService {
  check(): HealthResponse {
    return { status: "ok" };
  }
}

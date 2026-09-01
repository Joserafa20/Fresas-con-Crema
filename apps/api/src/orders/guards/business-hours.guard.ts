import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { BusinessHoursConfig } from "../domain/order.types.js";

@Injectable()
export class BusinessHoursGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const startStr = this.config.get<string>("BUSINESS_HOURS_START");
    const endStr = this.config.get<string>("BUSINESS_HOURS_END");

    // If no business hours configured, always allow
    if (!startStr || !endStr) return true;

    const config = this.parseHours(startStr, endStr);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = config.startHour * 60 + config.startMinute;
    const endMinutes = config.endHour * 60 + config.endMinute;

    if (currentMinutes < startMinutes || currentMinutes >= endMinutes) {
      throw new BadRequestException(
        `Orders can only be placed during business hours (${startStr} - ${endStr})`,
      );
    }

    return true;
  }

  private parseHours(start: string, end: string): BusinessHoursConfig {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return {
      startHour: sh,
      startMinute: sm ?? 0,
      endHour: eh,
      endMinute: em ?? 0,
    };
  }
}

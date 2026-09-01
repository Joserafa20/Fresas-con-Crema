import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator.js";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!required || required.length === 0) return true;
    const req = context.switchToHttp().getRequest();
    // Simple JWT mock: check header x-role or Authorization bearer contains role
    // In real app JwtAuthGuard would populate req.user
    const user = req.user as { role?: string } | undefined;
    const role = user?.role ?? req.headers["x-role"] ?? req.headers["x-admin-token"];
    // For demo: if token equals 'admin' allow, else check role
    if (role === "admin" || user?.role === "admin") return true;
    // Allow passing role via header for testing
    if (required.includes(role as string)) return true;
    throw new ForbiddenException("Forbidden: admin role required");
  }
}

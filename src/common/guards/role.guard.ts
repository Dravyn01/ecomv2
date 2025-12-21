import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class CheckRoleGuard implements CanActivate {
  private readonly className = CheckRoleGuard.name;
  private readonly logger = new Logger(this.className);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    this.logger.log(`[guard::${this.className}] started check role`);

    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    this.logger.debug(
      `[guard::${this.className}] get role from metadata: ${requiredRoles}`,
    );
    if (!requiredRoles) throw new UnauthorizedException();

    const user: JwtPayload = context.switchToHttp().getRequest().user;
    this.logger.debug(
      `[guard::${this.className}] user=${JSON.stringify(user)}`,
    );

    const hasRole = requiredRoles.includes(user.role);
    this.logger.log(`[guard::${this.className}] has role?: ${hasRole}`);

    return hasRole;
  }
}

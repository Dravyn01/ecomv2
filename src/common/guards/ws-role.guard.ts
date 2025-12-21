import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../strategies/jwt.strategy';

export class WsCheckRole implements CanActivate {
  private readonly className = WsCheckRole.name;
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
    if (!requiredRoles) throw new ForbiddenException();

    const user: JwtPayload = context.switchToWs().getClient().data.user;
    this.logger.debug(
      `[guard::${this.className}] user=${JSON.stringify(user)}`,
    );

    return requiredRoles.includes(user.role);
  }
}

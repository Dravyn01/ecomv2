import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const token = client.handshake.auth.token;

    if (!token) return false;

    try {
      const payload: JwtPayload = this.jwtService.verify(token, {
        secret: this.config.get<string>('SECRET_KEY'),
      });
      client.data.user = payload; // เก็บ payload ไว้ใช้ใน event
      return true;
    } catch (err) {
      return false;
    }
  }
}

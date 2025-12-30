import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  iss: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('SECRET_KEY'),
    });
  }

  async validate(
    payload: JwtPayload,
  ): Promise<{ sub: string; email: string; role: string }> {
    console.log('[jwt.strategy.ts]:', payload);
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}

/*
  payload: {
    sub: 1,
    email: 'admin@admin.com',
    iat: 1758785977,
    exp: 1758789577,
    iss: 'ecomv2.api.service'
  }
*/

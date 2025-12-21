import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly userService: UserService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<User> {
    console.log('[local.strategy.ts]:', { email: email, pass: password });
    return await this.userService.validateUser(email, password);
  }
}

/*
 *
 * user -> POST http://localhost:8080/api/login
 * Called controller -> use local guard
 * find email & compare password
 * if invalid -> throw UnAuthorization
 * if valid -> call service.login
 * save login-history
 * generatee accessToken
 *
 * */

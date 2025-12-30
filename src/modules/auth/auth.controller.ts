import { Body, Controller, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { LocalGuard } from 'src/common/guards/local.guard';
import { User } from 'src/modules/user/entities/user.entity';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { BaseUserDTO } from '../user/dto/base-user.dto';

@Controller('/api/auth')
export class AuthController {
  private readonly className = 'auth.controller';
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() body: RegisterDTO): Promise<ApiResponse<BaseUserDTO>> {
    this.logger.log(
      `[${this.className}::register] register with username=${body.username} email=${body.email}`,
    );
    const user = await this.authService.register(body);
    return { message: 'register success', data: user };
  }

  @UseGuards(LocalGuard)
  @Post('/login')
  async login(
    @Req() req: { user: User },
  ): Promise<ApiResponse<{ accessToken: string }>> {
    this.logger.log(
      `[$${this.className}::login] login with email=${req.user.email}`,
    );
    const result = await this.authService.login(req.user);
    return { message: 'login success', data: result };
  }

  @UseGuards(JwtGuard)
  @Post('/reset-password')
  async reset_password() {}
}

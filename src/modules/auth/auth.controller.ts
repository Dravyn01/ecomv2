import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/register.request';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { LocalGuard } from 'src/common/guards/local.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserResponse } from 'src/modules/user/dto/user.response';
import { User } from 'src/modules/user/entities/user.entity';

@Controller('/api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(
    @Body() req: RegisterRequest,
  ): Promise<ApiResponse<UserResponse>> {
    this.logger.log(
      `[POST] /auth/register called with username=${req.username}, email=${req.email}`,
    );
    const user = await this.authService.register(req);
    this.logger.log(`[POST] /auth/register success for email=${user.email}`);
    return { message: 'register success', data: user };
  }

  @Post('/login')
  @UseGuards(LocalGuard)
  async login(
    @GetUser() user: User,
  ): Promise<ApiResponse<{ accessToken: string }>> {
    this.logger.log(`[POST] /auth/login called for email=${user.email}`);
    const result = await this.authService.login(user);
    this.logger.log(`[POST] /auth/login success for email=${user.email}`);
    return { message: 'login success', data: result };
  }
}

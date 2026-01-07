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
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() body: RegisterDTO): Promise<ApiResponse<BaseUserDTO>> {
    const user = await this.authService.register(body);
    return { message: 'สมัครสมาชิกเรียบร้อย', data: user };
  }

  @UseGuards(LocalGuard)
  @Post('/login')
  async login(
    @Req() req: { user: User },
  ): Promise<ApiResponse<{ accessToken: string }>> {
    const result = await this.authService.login(req.user);
    return { message: 'เข้าสุ่ระบบเรียบร้อย', data: result };
  }

  @UseGuards(JwtGuard)
  @Post('/logout')
  async logout() {}

  @UseGuards(JwtGuard)
  @Post('/reset-password')
  async reset_password() {
    await this.authService.reset_password();
  }
}

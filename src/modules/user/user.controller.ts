import { UserService } from './user.service';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { UserResponse } from './dto/user.response';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { CheckRoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role, User } from './entities/user.entity';
import { Controller, Get, Logger, Req, UseGuards } from '@nestjs/common';
import { JwtPayload } from 'src/common/strategies/jwt.strategy';

@UseGuards(JwtGuard)
@Controller('/admin/users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @UseGuards(CheckRoleGuard)
  @Roles(Role.ADMIN)
  @Get()
  async findAll(): Promise<ApiResponse<UserResponse[]>> {
    const users = await this.userService.getAllUser();
    return {
      message: '',
      data: users,
    };
  }

  @UseGuards(JwtGuard)
  @Get('/profile')
  async getProfile(
    @Req() req: { user: JwtPayload },
  ): Promise<ApiResponse<UserResponse>> {
    this.logger.log(`[POST] /user/profile called for email=${req.user.email}`);
    const user = await this.userService.getProfile(req.user.email);
    return { message: 'user info', data: user };
  }
}

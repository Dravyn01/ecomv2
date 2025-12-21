import { UserService } from './user.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { UserResponse } from './dto/user.response';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { CheckRoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from './entities/user.entity';
import { Controller, Get, Logger, UseGuards } from '@nestjs/common';

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

  @Get('/profile')
  async getProfile(
    @GetUser() req: { email: string },
  ): Promise<ApiResponse<UserResponse>> {
    this.logger.log(`[POST] /user/profile called for email=${req.email}`);
    const user = await this.userService.getProfile(req.email);
    return { message: 'user info', data: user };
  }
}

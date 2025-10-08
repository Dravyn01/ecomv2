import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { UserResponse } from './dto/user.response';
import { ApiResponse } from 'src/common/dto/res/common-response';

@Controller('/user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Get('/all-user')
  async allUser() {
    return await this.userService.getAllUser();
  }

  @Get('/profile')
  @UseGuards(JwtGuard)
  async getProfile(
    @CurrentUser() req: { email: string },
  ): Promise<ApiResponse<UserResponse>> {
    this.logger.log(`[POST] /user/profile called for email=${req.email}`);
    const user = await this.userService.getProfile(req.email);
    return { message: 'user info', data: user };
  }
}

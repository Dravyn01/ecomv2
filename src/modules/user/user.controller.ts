import { UserService } from './user.service';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { CheckRoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from './entities/user.entity';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtPayload } from 'src/common/strategies/jwt.strategy';
import { BaseUserDTO } from './dto/base-user.dto';
import { CreateImageDTO } from '../image/dto/create-image.dto';

@UseGuards(JwtGuard)
@Controller('/api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(CheckRoleGuard)
  @Roles(Role.ADMIN)
  @Get()
  async findAll(): Promise<ApiResponse<BaseUserDTO[]>> {
    const users = await this.userService.getAllUser();
    return {
      message: ``,
      data: users,
    };
  }

  @Get('/profile')
  async getProfile(
    @Req() req: { user: JwtPayload },
  ): Promise<ApiResponse<BaseUserDTO>> {
    const user = await this.userService.getProfile(req.user.email);
    return { message: 'user info', data: user };
  }

  @Post('/upload-profile')
  async uploadProfile(
    @Res() req: { user: JwtPayload },
    @Body() body: CreateImageDTO,
  ): Promise<ApiResponse<null>> {
    await this.userService.uploadProfile(req.user.sub, body);
    return {
      message: '',
      data: null,
    };
  }
}

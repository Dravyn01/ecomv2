import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { Wishlist } from './entities/wishlist.entity';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { CheckRoleGuard } from 'src/common/guards/role.guard';
import { Role, User } from '../user/entities/user.entity';

@UseGuards(JwtGuard, CheckRoleGuard)
@Controller('/api/wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Roles(Role.USER, Role.ADMIN)
  @Get()
  async findByUser(
    @Req() req: { user: User },
  ): Promise<ApiResponse<Wishlist[]>> {
    console.log('check role guard', req.user);
    const wishlists = await this.wishlistService.findAllByUser(req.user.id);
    return {
      message: `พบสินค้่ในรายการโปรดทั้งหมด ${wishlists.length} รายการ`,
      data: wishlists,
    };
  }

  @Roles(Role.USER)
  @Post()
  async create(
    @Req() req: { user: User },
    @Body() body: AddToWishlistDto,
  ): Promise<ApiResponse<Wishlist>> {
    console.log('req', req.user);
    const wishlist = await this.wishlistService.create(req.user.id, body);
    return { message: 'นำสินค้าเข้ารายการโปรดเรียบร้อย', data: wishlist };
  }

  @Roles(Role.USER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':wishlist_id')
  async remove(
    @Req() req: { user: User },
    @Param('product_id') product_id: string,
  ): Promise<ApiResponse<null>> {
    await this.wishlistService.remove(req.user.id, +product_id);
    return { message: 'นำสินค้าออกจากรายการโปรดเรียบร้อย', data: null };
  }
}

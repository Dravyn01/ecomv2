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
import { User } from 'src/config/entities.config';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import { CheckRoleGuard } from 'src/common/guards/role.guard';

@UseGuards(JwtGuard, CheckRoleGuard)
@Controller('/api/wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Roles('customer', 'admin')
  @Get()
  async findByUser(
    @Req() req: { user: User },
    @GetUser() user: any,
  ): Promise<ApiResponse<Wishlist[]>> {
    console.log('check role guard', req.user);
    console.log('@GetUser', user);
    const wishlists = await this.wishlistService.findAllByUser(req.user.id);
    return {
      message: `พบสินค้่ในรายการโปรดทั้งหมด ${wishlists.length} รายการ`,
      data: wishlists,
    };
  }

  @Roles('customer')
  @Post()
  async create(
    @Req() req: { user: User },
    @Body() body: AddToWishlistDto,
  ): Promise<ApiResponse<Wishlist>> {
    console.log('req', req.user);
    const wishlist = await this.wishlistService.create(req.user.id, body);
    return { message: 'นำสินค้าเข้ารายการโปรดเรียบร้อย', data: wishlist };
  }

  @Roles('customer')
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

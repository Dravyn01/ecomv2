import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { Wishlist } from './entities/wishlist.entity';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/config/entities.config';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';

@Controller('/admin/wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async findByUser(@GetUser() user: User): Promise<ApiResponse<Wishlist[]>> {
    console.log('dec$@GetUser()', user);
    const wishlists = await this.wishlistService.findAllByUser(user.id);
    return { message: '', data: wishlists };
  }

  @Post()
  async create(
    @GetUser() user: User,
    @Body() body: AddToWishlistDto,
  ): Promise<ApiResponse<Wishlist>> {
    console.log('dec$@GetUser()', user);
    const wishlist = await this.wishlistService.create(user.id, body);
    return { message: '', data: wishlist };
  }

  @Delete(':wishlist_id')
  async remove(
    @GetUser() user: User,
    @Param('product_id') product_id: string,
  ): Promise<ApiResponse<null>> {
    await this.wishlistService.remove(user.id, +product_id);
    return { message: '', data: null };
  }
}

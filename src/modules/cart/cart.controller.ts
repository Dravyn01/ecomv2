import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Delete,
  Param,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { FindAllCartsDto } from './dto/req/find-all-carts.query';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { CartsRes } from './dto/res/carts.res';
import { AddToCartReq } from './dto/req/add-to-cart.req';

@Controller('/admin/carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async findAllCarts(
    @Query() req: FindAllCartsDto,
  ): Promise<ApiResponse<CartsRes>> {
    const carts = await this.cartService.findAll(req);
    return {
      message: '',
      data: carts,
    };
  }

  @Post()
  async addToCart(@Body() req: AddToCartReq): Promise<ApiResponse<null>> {
    await this.cartService.addToCart(req);
    return {
      message: '',
      data: null,
    };
  }

  @Delete(':id')
  async deleteCart(@Param('id') cart_id: string): Promise<ApiResponse<null>> {
    await this.cartService.delete(+cart_id);
    return { message: 'delete cart successfully!', data: null };
  }
}

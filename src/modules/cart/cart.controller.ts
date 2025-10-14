import { Controller, Get, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { FindAllCartsDto } from './dto/req/find-all-carts.query';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { CartsRes } from './dto/res/carts.res';
import { Post, Body } from '@nestjs/common';
import { CartItem } from './entities/cart.entity';
import { CreateCartItemReq } from './dto/req/create-cart-item.req';

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
  async createCart(@Body() req: CreateCartItemReq): Promise<ApiResponse<null>> {
    const cart = await this.cartService.addToCart(req);
    return {
      message: '',
      data: null,
    };
  }
}

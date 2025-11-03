import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { FindAllCartsDto } from './dto/req/find-all-carts.query';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { CartsResponse } from './dto/res/carts.res';
import { AddToCartReq } from './dto/req/add-to-cart.req';
import { ActionsCartItemReq } from './dto/req/actions-cartitem.req';
import { CartItem } from './entities/cart.entity';

@Controller('/admin/carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async findAllCarts(
    @Query() query: FindAllCartsDto,
  ): Promise<ApiResponse<CartsResponse>> {
    const carts = await this.cartService.findAll(query);
    return {
      message: `พบตะกร้าทั้งหมด ${carts.count} รายการ`,
      data: carts,
    };
  }

  @Post()
  async addToCart(@Body() body: AddToCartReq): Promise<ApiResponse<CartItem>> {
    const cart_item = await this.cartService.addToCart(body);
    return {
      message: 'เพิ่มสินค้าเข้าตะกร้าเรียบร้อย',
      data: cart_item,
    };
  }

  @Delete(':cart_id')
  async delete(@Param('cart_id') cart_id: string): Promise<ApiResponse<null>> {
    await this.cartService.delete(+cart_id);
    return { message: `ลบตะกร้าหมายเลข ${cart_id} เรียบร้อย`, data: null };
  }

  @Put('/item-action')
  async cartItemAction(
    @Body() body: ActionsCartItemReq,
  ): Promise<ApiResponse<CartItem>> {
    const result = await this.cartService.itemAction(body);
    return {
      message:
        body.action === 'REMOVE'
          ? `ลบสินค้าหมายเลข "${body.variant_id}" ออกจากตะกร้าเรียบร้อย`
          : 'ลดจำนวนสินค้าลง 1 ซิ้น',
      data: result,
    };
  }
}

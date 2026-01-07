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
import { ApiResponse } from 'src/common/dto/res/common-response';
import { Cart, CartItem } from './entities/cart.entity';
import { FindAllCartsDto } from './dto/find-all-carts.query';
import { DatasResponse } from 'src/common/dto/res/datas.response';
import { AddToCartDTO } from './dto/add-to-cart.dto';
import { ActionCartItemDTO } from './dto/action-cartitem.dto';

@Controller('/admin/carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('/debug')
  async findAllCarts(
    @Query() query: FindAllCartsDto,
  ): Promise<ApiResponse<DatasResponse<Cart[]>>> {
    const carts = await this.cartService.findAll(query);
    return {
      message: `พบตะกร้าทั้งหมด ${carts.count} รายการ`,
      data: carts,
    };
  }

  @Post('/add-to-cart')
  async addToCart(@Body() body: AddToCartDTO): Promise<ApiResponse<CartItem>> {
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
    @Body() body: ActionCartItemDTO,
  ): Promise<ApiResponse<CartItem>> {
    const result = await this.cartService.itemAction(body);
    return {
      message:
        result.status === 'deleted'
          ? `ลบสินค้าหมายเลข "${body.variant_id}" ออกจากตะกร้าเรียบร้อย`
          : 'ลดจำนวนสินค้าลง 1 ซิ้น',
      data: result.cart_item,
    };
  }
}

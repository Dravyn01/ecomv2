import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Query,
  Put,
  Body,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { OrdersResponse } from './dto/res/orders.res';
import { FindAllOrdersQuery } from './dto/req/find-all-orders.query';
import { Order } from './entities/order.entity';
import { CreateOrderReq } from './dto/req/create-order.req';

@Controller('/admin/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // *DEBUG MODE*
  @Get()
  async debug(): Promise<any> {
    const orders = await this.orderService.findAll();
    return { message: '', data: orders };
  }

  @Get(':user_id')
  async findByUser(
    @Param('user_id') user_id: string,
    @Query() query: FindAllOrdersQuery,
  ): Promise<ApiResponse<OrdersResponse>> {
    const orders = await this.orderService.findOrderByUser(+user_id, query);
    return { message: '', data: orders };
  }

  @Post(':user_id')
  async checkout(
    @Param('user_id') user_id: string,
    @Body() body: CreateOrderReq,
  ): Promise<any> {
    const order = await this.orderService.checkout(+user_id, body);
    return { message: '', data: order };
  }

  @Put(':order_id')
  async cancel(
    @Param('order_id') order_id: string,
  ): Promise<ApiResponse<Order>> {
    const order = await this.orderService.cancel(+order_id);
    return { message: 'canceled order successfully!', data: order };
  }

  @Delete(':order_id')
  async delete(
    @Param('order_id') order_id: string,
  ): Promise<ApiResponse<null>> {
    await this.orderService.delete(+order_id);
    return { message: 'delete order successfully!', data: null };
  }
}

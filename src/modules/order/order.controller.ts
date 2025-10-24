import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { OrdersResponse } from './dto/res/orders.res';
import { FindAllOrdersQuery } from './dto/req/find-all-orders.query';
import { Order } from './entities/order.entity';

@Controller('/admin/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // *DEBUG MODE*
  @Get()
  async allOrder(): Promise<any> {
    const orders = await this.orderService.findAll();
    return { message: '', data: orders };
  }

  @Get(':user_id')
  async orderByUser(
    @Param('user_id') user_id: string,
    @Query() req: FindAllOrdersQuery,
  ): Promise<ApiResponse<OrdersResponse>> {
    console.log(user_id);
    console.log(req);
    const orders = await this.orderService.findOrderByUser(+user_id, req);
    return { message: '', data: orders };
  }

  @Post(':user_id')
  async checkout(@Param('user_id') user_id: string): Promise<any> {
    const order = await this.orderService.checkout(+user_id);
    return { message: '', data: order };
  }

  @Put(':order_id')
  async cancelOrder(
    @Param('order_id') order_id: string,
  ): Promise<ApiResponse<Order>> {
    const order = await this.orderService.cancel(+order_id);
    return { message: 'canceled order successfully!', data: order };
  }

  @Delete(':order_id')
  async deleteOrder(
    @Param('order_id') order_id: string,
  ): Promise<ApiResponse<null>> {
    await this.orderService.delete(+order_id);
    return { message: 'delete order successfully!', data: null };
  }
}

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
import { Order } from './entities/order.entity';
import { DatasResponse } from 'src/common/dto/res/datas.response';
import { FindAllOrdersQuery } from './dto/find-all-orders.query';

// add @UseGuard(JwtGuard)

@Controller('/admin/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // # DEBUG METHOD
  @Get()
  async allOrders(): Promise<any> {
    const orders = await this.orderService.findAll();
    return { message: `พบ order ${orders.length} รายการ`, data: orders };
  }

  // find by user_id
  @Get(':user_id')
  async findByUser(
    @Param('user_id') user_id: string,
    @Query() query: FindAllOrdersQuery,
  ): Promise<ApiResponse<DatasResponse<Order[]>>> {
    const orders = await this.orderService.findByUser(+user_id, query);
    return {
      message: `พบ order ของผู้ใช้ หมายเลข ${user_id} ทั้งหมด ${orders.count} รายการ`,
      data: orders,
    };
  }

  // checkout by user_id
  @Post('/checkout/:user_id')
  async checkout(@Param('user_id') user_id: string): Promise<any> {
    const order = await this.orderService.checkout(+user_id);
    return { message: 'เช็คเอาท์สำเร็จ', data: order };
  }

  // cancel order
  @Put('/cancel/:order_id')
  async cancel(
    @Param('order_id') order_id: string,
  ): Promise<ApiResponse<Order>> {
    const order = await this.orderService.cancel(+order_id);
    return { message: 'ยกเลิก order แล้ว', data: order };
  }

  // delete order(admin contro)
  @Delete(':order_id')
  async delete(
    @Param('order_id') order_id: string,
  ): Promise<ApiResponse<Order>> {
    const order = await this.orderService.delete(+order_id);
    return { message: `ลบ order หมายเลข ${order_id} เรียบร้อย`, data: order };
  }

  // paid order
  @Put('/paid/:order_id')
  async paidOrder(
    @Param('order_id') order_id: string,
  ): Promise<ApiResponse<Order>> {
    const order = await this.orderService.paid(+order_id);
    return { message: `paid order #${order.id}`, data: order };
  }
}

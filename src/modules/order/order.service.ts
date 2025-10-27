import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository, DataSource, Not, In } from 'typeorm';
import { OrdersResponse } from './dto/res/orders.res';
import { FindAllOrdersQuery } from './dto/req/find-all-orders.query';
import { UserService } from '../user/user.service';
import { Cart } from 'src/config/entities.config';
import { StockService } from '../stock/stock.service';
import { CreateMovement } from '../stock/dto/create-movement.stock';
import { StockChangeType } from '../stock/enums/stock-change.enum';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly userService: UserService,
    private readonly stockService: StockService,
    private readonly datasource: DataSource,
  ) {}

  async findAll(): Promise<Order[]> {
    const orders = await this.orderRepo.find({ relations: ['user', 'items'] });
    return orders;
  }

  async findOrderByUser(
    user_id: number,
    req: FindAllOrdersQuery,
  ): Promise<OrdersResponse> {
    const { page, limit, order } = req;

    const [orders, count] = await this.orderRepo.findAndCount({
      where: { user: { id: user_id }, status: req.status },
      skip: (page - 1) * limit,
      take: limit,
      order: { order_date: order },
      relations: ['items'],
    });

    return { orders, count };
  }

  async findOne(order_id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: order_id },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('not found order');
    return order;
  }

  async checkout(user_id: number): Promise<Order> {
    const user = await this.userService.findOne(user_id);

    const order = await this.datasource.transaction(async (tx) => {
      const cart = await tx.findOne(Cart, {
        where: { user: { id: user.id } },
        relations: ['items.variant', 'user'],
      });

      if (!cart || cart.items.length === 0)
        throw new NotFoundException('not checkout');

      const total_price = cart.items.reduce(
        (acc, item) => acc + item.variant.price * item.quantity,
        0,
      );

      const order = await tx.save(Order, {
        user: { id: user_id },
        total_price: total_price,
        items: cart.items.map((item) => ({
          unit_price: item.variant.price,
          total_price: item.variant.price * item.quantity,
          quantity: item.quantity,
          variant: { id: item.variant.id },
        })),
      });

      await tx.delete(Cart, cart.id);

      for (const item of cart.items) {
        const dto: CreateMovement = {
          quantity: item.quantity,
          change_type: StockChangeType.OUT,
          variant_id: item.variant.id,
          order_id: order.id,
        };

        await this.stockService.createMovement(dto, tx);
      }

      return order;
    });

    return order;
  }

  async cancel(order_id: number): Promise<Order> {
    const order = this.datasource.transaction(async (tx) => {
      const order = await tx.findOne(Order, {
        where: {
          id: order_id,
          status: Not(In([OrderStatus.CANCELLED, OrderStatus.RETURNED])),
        },
        relations: ['items.variant'],
      });

      if (!order) {
        throw new NotFoundException('Not Found Order');
      }

      order.status = OrderStatus.CANCELLED;
      await tx.save(order);

      for (const item of order.items) {
        const dto: CreateMovement = {
          order_id,
          change_type: StockChangeType.RETURN,
          quantity: item.quantity,
          variant_id: item.variant.id,
        };

        await this.stockService.createMovement(dto, tx);
      }

      return order;
    });

    return order;
  }

  async delete(order_id: number): Promise<void> {
    const order = await this.findOne(order_id);
    await this.userService.findOne(order.user.id);

    await this.orderRepo.remove(order);
  }
}

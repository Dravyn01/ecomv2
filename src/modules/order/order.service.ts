import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Repository, DataSource } from 'typeorm';
import { OrdersResponse } from './dto/res/orders.res';
import { FindAllOrdersQuery } from './dto/req/find-all-orders.query';
import { UserService } from '../user/user.service';
import { Cart } from 'src/config/entities.config';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly userService: UserService,
    private readonly datasource: DataSource,
  ) {}

  async findAll(): Promise<Order[]> {
    const orders = await this.orderRepo.find({ relations: ['user.id'] });
    return orders;
  }

  async findOrderByUser(
    user_id: number,
    req: FindAllOrdersQuery,
  ): Promise<OrdersResponse> {
    const { page, limit, order } = req;

    const [orders, count] = await this.orderRepo.findAndCount({
      where: { user: { id: user_id } },
      skip: (page - 1) * limit,
      take: limit,
      order: { order_date: order },
      relations: ['order_item'],
    });

    return { orders, count };
  }

  async checkout(user_id: number): Promise<Order> {
    const order = this.datasource.transaction(async (tx) => {
      const cart = await tx.findOne(Cart, {
        where: { user: { id: user_id } },
        relations: ['cart_items'],
      });

      if (!cart || cart.cart_items.length === 0)
        throw new NotFoundException('not checkout');

      const total_price = cart.cart_items.reduce(
        (acc, item) => acc + item.variant.price * item.quantity,
        0,
      );

      const order = await tx.save(Order, {
        user: { id: user_id },
        total_price: total_price,
        order_items: cart.cart_items.map((item) => ({
          unit_price: item.variant.price,
          total_price: item.variant.price * item.quantity,
          quantity: item.quantity,
          variant: { id: item.variant.id },
        })),
      });

      await tx.delete(Cart, cart.id);
      return order;
    });
    return order;
  }

  async findOne(order_id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: order_id },
      relations: ['order_items'],
    });
    if (!order) throw new NotFoundException('not found order');
    return order;
  }

  async cancel(order_id: number): Promise<Order> {
    const order = this.datasource.transaction(async (tx) => {
      const order = await tx.findOneBy(Order, { id: order_id });
      if (!order) {
        throw new NotFoundException('Not Found Order');
      }

      order.status = OrderStatus.CANCELLED;
      await tx.save(order);

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

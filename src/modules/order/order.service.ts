import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderItem } from './entities/order.entity';
import { Repository, DataSource, Not, In } from 'typeorm';
import { OrdersResponse } from './dto/res/orders.res';
import { FindAllOrdersQuery } from './dto/req/find-all-orders.query';
import { UserService } from '../user/user.service';
import { Cart, Product, UserPurchaseHistory } from 'src/config/entities.config';
import { StockService } from '../stock/stock.service';
import { CreateMovement } from '../stock/dto/create-movement.stock';
import { StockChangeType } from '../stock/enums/stock-change.enum';
import { OrderStatus } from './enums/order-status.enum';
import { CreateOrderReq } from './dto/req/create-order.req';
import { ProductService } from '../product/product.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly userService: UserService,
    private readonly stockService: StockService,
    private readonly datasource: DataSource,
    private readonly productService: ProductService,
  ) {}

  async findAll(): Promise<Order[]> {
    return await this.orderRepo.find({ relations: ['user', 'items'] });
  }

  async findByUser(
    user_id: number,
    query: FindAllOrdersQuery,
  ): Promise<OrdersResponse> {
    const { page, limit, order, status } = query;

    const [orders, count] = await this.orderRepo.findAndCount({
      where: { user: { id: user_id }, status },
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
      relations: ['items.variant.product', 'user'],
    });
    if (!order) throw new NotFoundException('not found order');
    return order;
  }

  async checkout(user_id: number, body: CreateOrderReq): Promise<Order> {
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
          note: body.note,
        };

        await this.stockService.createMovement(dto, tx);
      }

      return order;
    });

    return order;
  }

  async cancel(order_id: number): Promise<Order> {
    const saved_order = this.datasource.transaction(async (tx) => {
      const order = await tx.findOne(Order, {
        where: {
          id: order_id,
          status: Not(In([OrderStatus.CANCELLED, OrderStatus.RETURNED])),
        },
        relations: ['items.variant.product'],
      });

      if (!order) {
        throw new NotFoundException('Not Found Order');
      }

      // change status
      order.status = OrderStatus.CANCELLED;
      await tx.save(order);

      // create movement out case
      for (const item of order.items) {
        const product = item.variant.product;

        const dto: CreateMovement = {
          order_id,
          change_type: StockChangeType.RETURN,
          quantity: item.quantity,
          variant_id: item.variant.id,
        };

        // create movement
        await this.stockService.createMovement(dto, tx);

        // new return rate
        const newReturnRate =
          product.return_count / (product.sales_count + product.return_count);

        console.log('new return rate', newReturnRate);

        // update return_count & return_rate
        const saved_product = await tx.save(Product, {
          id: product.id,
          return_count: product.return_count + 1,
          return_rate: newReturnRate,
        });

        console.log('saved_product', saved_product);

        console.log(
          'end of create movement & update return_count & return_rate',
        );
      }

      return order;
    });

    return saved_order;
  }

  async delete(order_id: number): Promise<Order> {
    const order = await this.findOne(order_id);
    // await this.userService.findOne(order.user.id);
    await this.orderRepo.remove(order);
    return order;
  }

  async paid(order_id: number): Promise<Order> {
    const order = await this.findOne(order_id);

    if (
      order.status === OrderStatus.PAID ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new ConflictException(
        `order "${order_id}" is ${order.status}. can not PAID again`,
      );
    }

    return await this.datasource.transaction(async (tx) => {
      order.status = OrderStatus.PAID;

      for (const item of order.items) {
        const user_id = order.user.id;
        const product = await this.productService.findOne(
          item.variant.product.id,
        );

        const saved_user_purchase_history = {
          is_repeat: false,
          product: { id: product.id },
          user: { id: user_id },
          order: { id: order.id },
          total_purchases: +1,
          last_purchased_at: new Date(),
        };

        const hasPurchased = await tx.findOne(OrderItem, {
          where: {
            order: {
              user: { id: user_id },
              status: OrderStatus.PAID,
            },
            variant: {
              product: { id: product.id },
            },
          },
        });

        console.log(hasPurchased);

        if (hasPurchased) {
          // insert is_repeat history
          await tx.insert(UserPurchaseHistory, {
            ...saved_user_purchase_history,
            is_repeat: true,
          });
          // increment repeat_count
          await tx.increment(Product, { id: product.id }, 'repeat_count', 1);
        }

        // create first user purchase history
        await tx.insert(UserPurchaseHistory, saved_user_purchase_history);

        // update sales_coun
        await tx.increment(
          Product,
          { id: product.id },
          'sales_count',
          item.quantity,
        );

        if (product.sales_count > 0) {
          const newRate = (product.repeat_count / product.sales_count).toFixed(
            2,
          );
          console.log('newRate', newRate);
          await tx.increment(
            Product,
            { id: product.id },
            'repeat_purchase_rate',
            Number(newRate),
          );
        }
      }

      return await tx.save(Order, order);
    });
  }
}

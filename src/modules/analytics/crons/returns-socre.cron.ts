import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductStats } from '../entities/product-stats.entity';
import { Order, OrderItem } from 'src/modules/order/entities/order.entity';
import { Between, Repository } from 'typeorm';
import { getDate } from 'src/utils/get-date';
import { OrderStatus } from 'src/modules/order/enums/order-status.enum';
import { AnalyticsService } from '../analytics.service';
import { aggregateByProduct } from 'src/utils/aggrerate-by-product';

@Injectable()
export class ReturnsScoreCron {
  constructor(
    @InjectRepository(ProductStats)
    private readonly productStatsRepo: Repository<ProductStats>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  @Cron('0 */2 * * *') // ทุก 2 ชม
  async handleIncrementReturnScore(): Promise<void> {
    const { start, end } = getDate();

    const items = await this.orderItemRepo.find({
      where: {
        order: {
          status: OrderStatus.CANCELLED,
          order_date: Between(start, end),
        },
      },
      relations: ['order', 'variant.product'],
    });

    if (items.length === 0) return;

    const grouped = aggregateByProduct(
      items,
      (i) => i.variant.product.id,
      (acc, item) => {
        acc.total++;
        acc.qty += item.quantity;
        acc.amount += item.total_price;
      },
      () => ({
        total: 0,
        qty: 0,
        amount: 0.0,
      }),
    );

    console.log('cron.return', grouped);

    for (const [product_id, data] of grouped.entries()) {
      const paidCount = await this.orderRepo.countBy({
        status: OrderStatus.PAID,
      });

      await this.productStatsRepo.update(
        { product: { id: product_id } },
        {
          total_returns: data.total,
          quantity_returned: data.qty,
          refund_amount: data.amount,
          return_rate: (data.total / paidCount) * 100,
        },
      );
    }
  }
}

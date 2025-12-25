import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductStats } from '../entities/product-stats.entity';
import { Between, Repository } from 'typeorm';
import { getDate } from 'src/utils/get-date';
import { OrderStatus } from 'src/modules/order/enums/order-status.enum';
import { AnalyticsService } from '../analytics.service';
import { OrderItem } from 'src/modules/order/entities/order.entity';

@Injectable()
export class SalesScoreCron {
  constructor(
    @InjectRepository(ProductStats)
    private readonly productStatsRepo: Repository<ProductStats>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    private readonly analyticService: AnalyticsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR) // ทุก 1 ชม
  async handleSales(): Promise<void> {
    const { end, start } = getDate();

    const items = await this.orderItemRepo.find({
      where: {
        order: {
          order_date: Between(start, end),
          status: OrderStatus.PAID,
        },
      },
      relations: ['variant.product'],
    });

    const grouped = this.analyticService.aggregateByProduct(
      items,
      (i) => i.variant.product.id,
      (acc, item) => {
        acc.total_orders += 1;
        acc.qty += item.quantity;
        acc.revenue += item.total_price;
      },
      () => ({
        qty: 0,
        revenue: 0,
        total_orders: 0,
      }),
    );

    for (const [productId, stat] of grouped.entries()) {
      await this.productStatsRepo.save({
        product: { id: productId },
        total_orders: stat.total_orders,
        total_quantity_sold: stat.qty,
        total_revenue: stat.revenue,
      });
    }
  }
}

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductStats } from '../entities/product-stats.entity';
import { Between, Repository } from 'typeorm';
import { OrderItem } from 'src/config/entities.config';
import { getDate } from 'src/utils/get-date';
import { OrderStatus } from 'src/modules/order/enums/order-status.enum';

@Injectable()
export class SalesScoreCron {
  constructor(
    @InjectRepository(ProductStats)
    private readonly productStatsRepo: Repository<ProductStats>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
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

    const grouped = new Map<
      number,
      { total_orders: number; qty: number; revenue: number }
    >();

    for (const item of items) {
      const product_id = item.variant.product.id;

      if (!grouped.has(product_id)) {
        grouped.set(product_id, {
          qty: 0,
          revenue: 0,
          total_orders: 0,
        });
      }

      const stat = grouped.get(product_id)!;
      stat.total_orders += 0;
      stat.qty += item.quantity;
      stat.revenue += item.total_price;
    }

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

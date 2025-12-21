import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductStats } from '../entities/product-stats.entity';
import { Order, OrderItem } from 'src/config/entities.config';
import { Between, Repository } from 'typeorm';
import { getDate } from 'src/utils/get-date';
import { OrderStatus } from 'src/modules/order/enums/order-status.enum';

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
  async handleReturn(): Promise<void> {
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

    const grouped = new Map<
      number,
      { total: number; qty: number; amount: number; rate: number }
    >();

    for (const item of items) {
      const product_id = item.variant.product.id;

      if (!grouped.has(product_id)) {
        grouped.set(product_id, {
          total: 0,
          qty: 0,
          amount: 0.0,
          rate: 0.0,
        });
      }

      const stat = grouped.get(product_id)!;
      stat.total++;
      stat.qty += item.quantity;
      stat.amount += item.total_price;
    }

    for (const [product_id, data] of grouped.entries()) {
      const paidCount = await this.orderRepo.countBy({
        status: OrderStatus.PAID,
      });

      await this.productStatsRepo.save({
        product: { id: product_id },
        total_returns: data.total,
        quantity_returned: data.qty,
        refund_amount: data.amount,
        return_rate: (data.total / paidCount) * 100,
      });
    }
  }
}

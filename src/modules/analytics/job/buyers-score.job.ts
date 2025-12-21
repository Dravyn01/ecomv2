import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Between, Repository } from 'typeorm';
import { ProductStats, UserPurchaseHistory } from 'src/config/entities.config';
import { OrderStatus } from 'src/modules/order/enums/order-status.enum';
import { getDate } from 'src/utils/get-date';

@Injectable()
export class BuyersScoreCron {
  constructor(
    @InjectRepository(UserPurchaseHistory)
    private readonly userPurchaseRepo: Repository<UserPurchaseHistory>,
    @InjectRepository(ProductStats)
    private readonly productStatsRepo: Repository<ProductStats>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // เที่ยงคืน
  async handleCron() {
    const { start, end } = getDate();

    const historyOrderPaidToday = await this.userPurchaseRepo.find({
      where: {
        order: {
          status: OrderStatus.PAID,
          order_date: Between(start, end),
        },
      },
      relations: ['user', 'product'],
    });

    const grouped = new Map<number, { unique: Set<number>; repeat: number }>();

    for (const history of historyOrderPaidToday) {
      const product_id = history.product.id;
      const user_id = history.user.id;

      //
      if (!grouped.has(product_id)) {
        grouped.set(product_id, {
          unique: new Set(),
          repeat: 0,
        });
      }

      //
      const entry = grouped.get(product_id)!;
      //
      entry.unique.add(user_id);

      //
      if (history.total_purchases > 1) {
        entry.unique.add(user_id);
      }

      for (const [product_id, data] of grouped.entries()) {
        const unique_buyers = data.unique.size;
        const repeat_buyers = data.repeat;

        //
        const repeat_rate =
          unique_buyers === 0
            ? 0
            : Number(((repeat_buyers / unique_buyers) * 100).toFixed(2));

        await this.productStatsRepo.save({
          product: { id: product_id },
          unique_buyers,
          repeat_buyers,
          repeat_rate,
        });
      }
    }
  }
}

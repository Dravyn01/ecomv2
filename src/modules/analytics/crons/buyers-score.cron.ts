import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Between, Repository } from 'typeorm';
import { OrderStatus } from 'src/modules/order/enums/order-status.enum';
import { getDate } from 'src/utils/get-date';
import { ProductStats } from '../entities/product-stats.entity';
import { UserPurchaseHistory } from '../entities/user-purchase-history.entity';
import { aggregateByProduct } from 'src/utils/aggrerate-by-product';

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

    const orderPaidHistorysToday = await this.userPurchaseRepo.find({
      where: {
        order: {
          status: OrderStatus.PAID,
          order_date: Between(start, end),
        },
      },
      relations: ['user', 'product'],
    });

    const grouped = aggregateByProduct(
      orderPaidHistorysToday,
      (h) => h.product.id,
      (acc, item) => {
        acc.unique.add(item.user.id);
        if (item.total_purchases > 1) acc.repeat++;
      },
      () => ({ unique: new Set(), repeat: 0 }),
    );

    console.log('cron.buyer', grouped);

    for (const [product_id, data] of grouped.entries()) {
      const unique_buyers = data.unique.size;
      const repeat_buyers = data.repeat;

      // new repeat rate
      const repeat_rate =
        unique_buyers === 0
          ? 0
          : Number(((repeat_buyers / unique_buyers) * 100).toFixed(2));

      await this.productStatsRepo.update(
        { product: { id: product_id } },
        {
          unique_buyers,
          repeat_buyers,
          repeat_rate,
        },
      );
    }
  }
}

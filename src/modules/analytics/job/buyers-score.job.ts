import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Between, Repository } from 'typeorm';
import { OrderStatus } from 'src/modules/order/enums/order-status.enum';
import { getDate } from 'src/utils/get-date';
import { AnalyticsService } from '../analytics.service';
import { ProductStats } from '../entities/product-stats.entity';
import { UserPurchaseHistory } from '../entities/user-purchase-history.entity';

@Injectable()
export class BuyersScoreCron {
  constructor(
    @InjectRepository(UserPurchaseHistory)
    private readonly userPurchaseRepo: Repository<UserPurchaseHistory>,
    @InjectRepository(ProductStats)
    private readonly productStatsRepo: Repository<ProductStats>,
    private readonly analyticService: AnalyticsService,
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

    const grouped = this.analyticService.aggregateByProduct<
      UserPurchaseHistory,
      { unique: Set<number>; repeat: 0 }
    >(
      historyOrderPaidToday,
      (h) => h.product.id,
      (acc, item) => {
        acc.unique.add(item.user.id);
        if (item.total_purchases > 1) acc.repeat++;
      },
      () => ({ unique: new Set(), repeat: 0 }),
    );

    console.log('cron.buyer', grouped);

    // คำนวนโดยใช้ข้อมูลจาก  map ทีละตัว
    for (const [product_id, data] of grouped.entries()) {
      const unique_buyers = data.unique.size; // แปลงเป็นจำนวน เพราะ ไม่ได้ต้องการ user_id
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

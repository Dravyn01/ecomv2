import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Between, MoreThan, Repository } from 'typeorm';
import {
  Order,
  ProductRepeatSummary,
  UserPurchaseHistory,
} from 'src/config/entities.config';
import { endOfDay, startOfDay } from 'date-fns';
import { OrderStatus } from 'src/modules/order/enums/order-status.enum';

@Injectable()
export class RepeatRateCron {
  private readonly logger = new Logger(RepeatRateCron.name);

  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(UserPurchaseHistory)
    private readonly userPurchaseRepo: Repository<UserPurchaseHistory>,
    @InjectRepository(ProductRepeatSummary)
    private readonly productRepeatSummaryRepo: Repository<ProductRepeatSummary>,
  ) {}

  // ทุก ๆ 10 วินาที
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    const historyOrderPaidToday = await this.userPurchaseRepo.find({
      where: {
        order: {
          status: OrderStatus.PAID,
          order_date: Between(start, end),
        },
      },
      relations: ['user', 'product'],
    });

    for (const history of historyOrderPaidToday) {
      const product_id = history.product.id;

      const unique_buyers = await this.userPurchaseRepo.countBy({
        product: { id: product_id },
      });
      const repeat_buyers = await this.userPurchaseRepo.count({
        where: {
          total_purchases: MoreThan(1),
        },
      });

      const newRepeatRate = ((repeat_buyers / unique_buyers) * 100).toFixed(2);

      console.log('unique_buyers', unique_buyers);
      console.log('repeat_buyers', repeat_buyers);

      await this.productRepeatSummaryRepo.save({
        product: { id: product_id, repeat_rate: newRepeatRate },
        unique_buyers,
        repeat_buyers,
        repeat_rate: Number(newRepeatRate),
        total_orders: historyOrderPaidToday.length,
        last_calculated_at: today,
      });
    }
  }
}

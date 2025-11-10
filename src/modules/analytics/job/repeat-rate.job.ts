import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OrderService } from 'src/modules/order/order.service';

@Injectable()
export class RepeatRateCron {
  private readonly logger = new Logger(RepeatRateCron.name);

  constructor(private readonly orderService: OrderService) {}

  // ทุก ๆ 10 วินาที
  @Cron('*/10 * * * * *')
  async handleCron() {
    this.logger.log('Calculating repeat rate...');
    //    await this.orderService.calculateRepeatRate();
  }
}

import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPurchaseHistory } from './entities/user-purchase-history.entity';
import {
  Order,
  OrderItem,
  Product,
  ProductRepeatSummary,
} from 'src/config/entities.config';
import { PopularProductJob } from './job/popular-product.job';
import { RepeatRateCron } from './job/repeat-rate.job';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPurchaseHistory,
      Order,
      OrderItem,
      ProductRepeatSummary,
      Product,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, PopularProductJob, RepeatRateCron],
})
export class AnalyticsModule {}

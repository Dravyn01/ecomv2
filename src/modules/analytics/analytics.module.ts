import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPurchaseHistory } from './entities/user-purchase-history.entity';
import {
  Order,
  OrderItem,
  ProductStats,
  ProductView,
} from 'src/config/entities.config';
import { ProductsScoreCron } from './job/products-score.job';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPurchaseHistory,
      Order,
      OrderItem,
      ProductStats,
      ProductView,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, ProductsScoreCron],
})
export class AnalyticsModule {}

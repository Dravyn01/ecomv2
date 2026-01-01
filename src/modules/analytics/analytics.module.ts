import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPurchaseHistory } from './entities/user-purchase-history.entity';
import { Order, OrderItem } from 'src/modules/order/entities/order.entity';
import { ProductStats } from './entities/product-stats.entity';
import { ProductView } from './entities/product-view.entity';

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
  providers: [AnalyticsService],
})
export class AnalyticsModule {}

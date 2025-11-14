import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPurchaseHistory } from './entities/user-purchase-history.entity';
import { Order, OrderItem, Product } from 'src/config/entities.config';
import { PopularProductJob } from './job/popular-product.job';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPurchaseHistory, Order, OrderItem, Product]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, PopularProductJob],
})
export class AnalyticsModule {}

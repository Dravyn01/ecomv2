import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { ColorModule } from './modules/color/color.module';
import { SizeModule } from './modules/size/size.module';
import { CategoryModule } from './modules/category/category.module';
import { CartModule } from './modules/cart/cart.module';
import { TypeOrmConfig } from './config/typeorm.config';
import { OrderModule } from './modules/order/order.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { StockModule } from './modules/stock/stock.module';
import { ReviewModule } from './modules/review/review.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    // .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // cron job
    ScheduleModule.forRoot(),

    // typeorm config
    TypeOrmModule.forRoot(TypeOrmConfig),

    // modules
    AuthModule,
    UserModule,
    ProductModule,
    ColorModule,
    SizeModule,
    CategoryModule,
    CartModule,
    OrderModule,
    ShipmentsModule,
    StockModule,
    ReviewModule,
    WishlistModule,
    AnalyticsModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}

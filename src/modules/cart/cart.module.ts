import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart, CartItem } from 'src/modules/cart/entities/cart.entity';
import { UserModule } from '../user/user.module';
import { ProductVariantModule } from '../product-variant/product-variant.module';
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    UserModule,
    ProductVariantModule,
    StockModule,
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}

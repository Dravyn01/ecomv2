import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart, CartItem } from 'src/config/entities.config';
import { UserModule } from '../user/user.module';
import { ProductVariantModule } from '../product-variant/product-variant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    UserModule,
    ProductVariantModule,
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}

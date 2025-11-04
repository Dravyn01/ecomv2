import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist]), ProductModule],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}

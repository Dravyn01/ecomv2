import { Module } from '@nestjs/common';
import { ProductVariantService } from './product-variant.service';
import { ProductVariantController } from './product-variant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { SizeModule } from '../size/size.module';
import { ProductModule } from '../product/product.module';
import { ColorModule } from '../color/color.module';
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductVariant]),
    ProductModule,
    ColorModule,
    SizeModule,
    StockModule,
  ],
  controllers: [ProductVariantController],
  providers: [ProductVariantService],
  exports: [ProductVariantService],
})
export class ProductVariantModule {
  constructor() {
    console.log('stockModule', StockModule);
  }
}

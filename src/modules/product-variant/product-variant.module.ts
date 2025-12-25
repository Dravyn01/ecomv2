import { Module } from '@nestjs/common';
import { ProductVariantService } from './product-variant.service';
import { ProductVariantController } from './product-variant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { SizeModule } from '../size/size.module';
import { ProductModule } from '../product/product.module';
import { ColorModule } from '../color/color.module';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductVariant]),
    ProductModule,
    ColorModule,
    SizeModule,
    ImageModule,
  ],
  controllers: [ProductVariantController],
  providers: [ProductVariantService],
  exports: [ProductVariantService],
})
export class ProductVariantModule {}

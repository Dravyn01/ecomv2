import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from '../category/category.module';
import { ProductView } from '../analytics/entities/product-view.entity';
import { Image } from '../image/entities/image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductView, Image]),
    CategoryModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}

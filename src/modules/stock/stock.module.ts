import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariantModule } from '../product-variant/product-variant.module';
import { Stock, StockMovement } from './entities/stock.entity';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock, StockMovement]),
    forwardRef(() => ProductVariantModule),
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {
  constructor() {
    console.log('ProductVaraintModule', ProductVariantModule);
  }
}

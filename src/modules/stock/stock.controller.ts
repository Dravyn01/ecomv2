import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { Stock } from './entities/stock.entity';
import { StockService } from './stock.service';

@Controller('/admin/stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  async test(): Promise<ApiResponse<Stock[]>> {
    const stock = await this.stockService.findAll();
    return {
      message: '',
      data: stock,
    };
  }

  @Get(':variant_id')
  async findByVariant(
    @Param('variant_id') variant_id: string,
  ): Promise<ApiResponse<Stock>> {
    const stock = await this.stockService.findByVariant(+variant_id);
    return {
      message: '',
      data: stock,
    };
  }

  // @Delete(':id')
  // async deleteStock(@Param('id') id: string) {
  //   await this.stockService.deleteStock(+id);
  //   return {
  //     message: '',
  //     data: null,
  //   };
  // }
}

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { Stock } from './entities/stock.entity';
import { StockService } from './stock.service';
import { AddQuantityDTO } from './dto/add-quantity.dto';

@Controller('/admin/stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  async debug(): Promise<ApiResponse<Stock[]>> {
    const stock = await this.stockService.findAll();
    return {
      message: `พบสต๊อกทั้งหมด ${stock.length} รายการ`,
      data: stock,
    };
  }

  @Get(':variant_id')
  async findByVariant(
    @Param('variant_id') variant_id: string,
  ): Promise<ApiResponse<Stock>> {
    const stock = await this.stockService.findByVariant(+variant_id);
    return {
      message: `ข้อมูลสต๊อกของสินค้าหมายเลข ${variant_id}`,
      data: stock,
    };
  }

  @Post()
  async addQuantityToStock(
    @Body() dto: AddQuantityDTO,
  ): Promise<ApiResponse<null>> {
    await this.stockService.addQuantity(dto);
    return {
      message: `เพิ่มจำนวนสินค้าเข้าสต็อกเรียบร้อย`,
      data: null,
    };
  }
}

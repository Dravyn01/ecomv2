import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { ProductVariant } from './entities/product-variant.entity';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';
import { ProductVariantService } from './product-variant.service';
import { CreateVariantDTO } from './dto/create-variant.dto';
import { UpdateVariantDTO } from './dto/update-variant.dto';

@Controller('/admin/product-variants')
export class ProductVariantController {
  constructor(private readonly variantService: ProductVariantService) {}

  // TODO: add logger

  // *DEBUG MODE*
  @Get()
  async variants(): Promise<ApiResponse<any>> {
    const variants = await this.variantService.listDevmode();
    return {
      message: '',
      data: variants,
    };
  }

  // หา variant ด้วย product_id
  @Get(':product_id')
  async findByVariant(
    @Param('product_id') product_id: string,
    @Query() query: FindAllQuery,
  ): Promise<ApiResponse<DatasResponse<ProductVariant[]>>> {
    const variants = await this.variantService.findAllByProduct(
      +product_id,
      query,
    );

    return {
      message: `พบ variant ทั้งหมด ${variants.data.length} รายการของสินค้า ${product_id}`,
      data: variants,
    };
  }

  @Post()
  async create(
    @Body() body: CreateVariantDTO,
  ): Promise<ApiResponse<ProductVariant>> {
    const variant = await this.variantService.create(body);
    return {
      message: `สร้าง variant ของสินค้ารายการ ${body.product_id} สำเร็จ`,
      data: variant,
    };
  }

  @Put(':variant_id')
  async upate(
    @Param('variant_id') variant_id: string,
    @Body() body: UpdateVariantDTO,
  ): Promise<ApiResponse<ProductVariant>> {
    const variant = await this.variantService.update(+variant_id, body);
    return {
      message: `อัพเดท variant หมายเลข ${variant_id} สำเร็จ`,
      data: variant,
    };
  }

  @Delete(':variant_id')
  async delete(
    @Param('variant_id') variant_id: string,
  ): Promise<ApiResponse<null>> {
    await this.variantService.delete(+variant_id);
    return {
      message: `ลบ variant หมายเลข ${variant_id} สำเร็จ`,
      data: null,
    };
  }
}

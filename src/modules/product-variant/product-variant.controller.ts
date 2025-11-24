import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  Put,
  Delete,
  Logger,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { ProductVariant } from './entities/product-variant.entity';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';
import { ProductVariantService } from './product-variant.service';
import { CreateVariantDTO } from './dto/create-variant.dto';
import { UpdateVariantDTO } from './dto/update-variant.dto';
import { DatasResponse } from 'src/common/dto/res/datas.response';

@Controller('/admin/product-variants')
export class ProductVariantController {
  private readonly logger = new Logger(ProductVariantController.name);

  constructor(private readonly variantService: ProductVariantService) {}

  // # DEBUG
  @Get()
  async findAll(): Promise<ApiResponse<any>> {
    this.logger.log(`[product-variant.controller::findAll]`);
    const variants = await this.variantService.findAll();
    return {
      message: '',
      data: variants,
    };
  }

  // หา variant ด้วย product_id
  @Get(':product_id')
  async findOne(
    @Param('product_id') product_id: string,
    @Query() query: FindAllQuery,
  ): Promise<ApiResponse<DatasResponse<ProductVariant[]>>> {
    this.logger.log(
      `[product-variant.controller::findOne] find product with product_id=${product_id} query=${JSON.stringify(query)}`,
    );
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
    this.logger.log(
      `[product-variant.controller::create] create product with data=${JSON.stringify(body)}`,
    );
    const variant = await this.variantService.create(body);
    return {
      message: `สร้าง variant ของสินค้ารายการ ${body.product_id} สำเร็จ`,
      data: variant,
    };
  }

  @Put(':variant_id')
  async update(
    @Param('variant_id') variant_id: string,
    @Body() body: UpdateVariantDTO,
  ): Promise<ApiResponse<ProductVariant>> {
    this.logger.log(
      `[product-variant.controller::update] update product with data=${JSON.stringify(body)} variant_id=${variant_id}`,
    );
    const variant = await this.variantService.update(+variant_id, body);
    return {
      message: `อัพเดท variant หมายเลข ${variant_id} สำเร็จ`,
      data: variant,
    };
  }

  @Delete(':variant_id')
  async delete(
    @Param('variant_id') variant_id: string,
  ): Promise<ApiResponse<ProductVariant>> {
    this.logger.log(
      `[product-variant.controller::delete] delete product with product_id=${variant_id}`,
    );
    const variant = await this.variantService.delete(+variant_id);
    return {
      message: `ลบ variant หมายเลข ${variant_id} สำเร็จ`,
      data: variant,
    };
  }
}

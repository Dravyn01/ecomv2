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
import { CreateVariantReq } from './dto/req/create-variant.req';
import { UpdateVariantReq } from './dto/req/update-variant.req';
import { ProductVariantsResponse } from './dto/res/product-variants.res';

@Controller('/admin/product-variants')
export class ProductVariantController {
  constructor(private readonly variantService: ProductVariantService) {}

  // *DEBUG MODE*
  @Get()
  async test(): Promise<ApiResponse<any>> {
    const variants = await this.variantService.listDevmode();
    return {
      message: '',
      data: variants,
    };
  }

  /*
   * หา variant ตาม product_id เพื่อดูว่า product นี้มีกี่ variant
   * */
  @Get(':id')
  async listVariant(
    @Param('id') product_variant_id: string,
    @Query() req: FindAllQuery, // ในอนาตคอาจมีการแยกเป็น FindAllVariants
  ): Promise<ApiResponse<ProductVariantsResponse>> {
    const variants = await this.variantService.findAllByProduct(
      +product_variant_id,
      req,
    );

    return {
      message: '',
      data: variants,
    };
  }

  @Post()
  async createVariant(
    @Body() req: CreateVariantReq,
  ): Promise<ApiResponse<ProductVariant>> {
    const variant = await this.variantService.create(req);
    return {
      message: '',
      data: variant,
    };
  }

  @Put(':id')
  async updateVariant(
    @Param('id') variant_id: string,
    @Body() req: UpdateVariantReq,
  ): Promise<ApiResponse<ProductVariant>> {
    const variant = await this.variantService.update(+variant_id, req);
    return {
      message: '',
      data: variant,
    };
  }

  @Delete(':id')
  async deleteVariant(
    @Param('id') variant_id: number,
  ): Promise<ApiResponse<null>> {
    await this.variantService.delete(variant_id);
    return {
      message: '',
      data: null,
    };
  }
}

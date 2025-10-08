import {
  Controller,
  Get,
  Param,
  Logger,
  Query,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { Product } from './entities/product.entity';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { ProductService } from './product.service';
import { ProductsRes } from './dto/res/products.res';
import { CreateProductReq } from './dto/req/create-product.req';
import { DeleteResult } from 'typeorm';
import { UpdateProductReq } from './dto/req/update-product.req';
import { FindAllProducts } from './dto/req/find-all-products.query';

@Controller('/admin/products')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(private readonly productService: ProductService) {}

  @Get()
  async AllProducts(
    @Query() req: FindAllProducts,
  ): Promise<ApiResponse<ProductsRes>> {
    this.logger.log(
      `[product.controller.ts]: LOG paramter {q: ${req.query}, page: ${req.page}, limit: ${req.limit}, order: ${req.order}}`,
    );
    const products = await this.productService.findAll(req);
    return { message: 'สินค้าทั้งหมด', data: products };
  }

  @Get(':id')
  async ProductDetails(
    @Param('id') product_id: number,
  ): Promise<ApiResponse<Product>> {
    const product = await this.productService.findById(product_id);
    return {
      message: `ข้อมูลสินค้าหมายเลข ${product_id}`,
      data: product,
    };
  }

  @Post()
  async CreateProduct(
    @Body() req: CreateProductReq,
  ): Promise<ApiResponse<Product>> {
    return {
      message: 'สร้างสินค้าเสร็จสิ้น',
      data: await this.productService.createProduct(req),
    };
  }

  @Put(':id')
  async UpdateProduct(
    @Body() req: UpdateProductReq,
    @Param('id') product_id: string,
  ): Promise<ApiResponse<Product>> {
    this.logger.log(
      `[UpdateProduct]: product_id=${product_id}, req=${JSON.stringify(req)}`,
    );

    return {
      message: 'อัพเดทสินค้าเรียบร้อย',
      data: await this.productService.updateProduct(+product_id, req),
    };
  }

  @Delete(':id')
  async DeleteProduct(
    @Param('id') product_id: string,
  ): Promise<ApiResponse<DeleteResult>> {
    return {
      message: `ลบสินค้าหมายเลข ${product_id} เสร็จสิ้น`,
      data: await this.productService.deleteProduct(+product_id),
    };
  }
}

@Controller('/api/products')
export class ProductVariantController {}

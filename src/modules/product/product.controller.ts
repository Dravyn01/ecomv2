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
import { ProductsResponse } from './dto/res/products.res';
import { CreateProductReq } from './dto/req/create-product.req';
import { UpdateProductReq } from './dto/req/update-product.req';
import { FindAllProducts } from './dto/req/find-all-products.query';

@Controller('/admin/products')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(
    @Query() query: FindAllProducts,
  ): Promise<ApiResponse<ProductsResponse>> {
    this.logger.log(
      `[product.controller.ts]: LOG paramter {q: ${query.search}, page: ${query.page}, limit: ${query.limit}, order: ${query.order}}`,
    );
    const products = await this.productService.findAll(query);
    return { message: 'สินค้าทั้งหมด', data: products };
  }

  @Get(':product_id')
  async findById(
    @Param('product_id') product_id: number,
  ): Promise<ApiResponse<Product>> {
    const product = await this.productService.findOne(product_id);
    return {
      message: `ข้อมูลสินค้าหมายเลข ${product_id}`,
      data: product,
    };
  }

  @Post()
  async createProduct(
    @Body() body: CreateProductReq,
  ): Promise<ApiResponse<Product>> {
    const product = await this.productService.create(body);
    return {
      message: 'สร้างสินค้าเสร็จสิ้น',
      data: product,
    };
  }

  @Put(':product_id')
  async updateProduct(
    @Body() req: UpdateProductReq,
    @Param('product_id') product_id: string,
  ): Promise<ApiResponse<Product>> {
    const product = await this.productService.update(+product_id, req);
    return {
      message: 'อัพเดทสินค้าเรียบร้อย',
      data: product,
    };
  }

  @Delete(':product_id')
  async deleteProduct(
    @Param('product_id') product_id: string,
  ): Promise<ApiResponse<null>> {
    await this.productService.delete(+product_id);
    return {
      message: `ลบสินค้าหมายเลข ${product_id} เสร็จสิ้น`,
      data: null,
    };
  }
}

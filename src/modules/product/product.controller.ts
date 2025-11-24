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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Product } from './entities/product.entity';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { ProductService } from './product.service';
import { FindAllProductsQuery } from './dto/find-all-products.query';
import { DatasResponse } from 'src/common/dto/res/datas.response';
import { CreateProductDTO } from './dto/create-product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';

@Controller('/admin/products')
export class ProductController {
  private readonly className = ProductController.name;
  private readonly logger = new Logger(ProductController.name);

  // TODO: edit and add logger

  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(
    @Query() query: FindAllProductsQuery,
  ): Promise<ApiResponse<DatasResponse<Product[]>>> {
    this.logger.log(
      `[${this.className}::findAll]: LOG paramter {q: ${query.search}, page: ${query.page}, limit: ${query.limit}, order: ${query.order}}`,
    );
    const products = await this.productService.findAll(query);
    return {
      message: `พบสินค้าทั้งหมด ${products.count} รายการ`,
      data: products,
    };
  }

  @Get(':product_id')
  async findOne(
    @Param('product_id') product_id: number,
  ): Promise<ApiResponse<Product>> {
    this.logger.log(
      `[${this.className}::findById] search product with product_id=${product_id}`,
    );
    const product = await this.productService.findOne(product_id);
    return {
      message: `ข้อมูลสินค้าหมายเลข ${product_id}`,
      data: product,
    };
  }

  @Post()
  async create(@Body() body: CreateProductDTO): Promise<ApiResponse<Product>> {
    this.logger.log(
      `[${this.className}::create] create a new product with object=${JSON.stringify(body)}`,
    );
    const product = await this.productService.create(body);
    return {
      message: 'สร้างสินค้าเสร็จสิ้น',
      data: product,
    };
  }

  @Put(':product_id')
  async update(
    @Param('product_id') product_id: string,
    @Body() body: UpdateProductDTO,
  ): Promise<ApiResponse<Product>> {
    this.logger.log(
      `[${this.className}::update] update a exists product with object=${JSON.stringify(body)}`,
    );
    const product = await this.productService.update(+product_id, body);
    return {
      message: 'อัพเดทสินค้าเสร็จสิ้น',
      data: product,
    };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':product_id')
  async delete(
    @Param('product_id') product_id: string,
  ): Promise<ApiResponse<null>> {
    this.logger.log(
      `[${this.className}::delete] delete product with product_id=${product_id}`,
    );
    await this.productService.delete(+product_id);
    return {
      message: `ลบสินค้าหมายเลข "${product_id}" เสร็จสิ้น`,
      data: null,
    };
  }
}

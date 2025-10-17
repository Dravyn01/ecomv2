import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ProductsResponse } from './dto/res/products.res';
import { FindAllProducts } from './dto/req/find-all-products.query';
import { CreateProductReq } from './dto/req/create-product.req';
import { UpdateProductReq } from './dto/req/update-product.req';
import { DeleteResult } from 'typeorm/browser';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // find all
  async findAll(req: FindAllProducts): Promise<ProductsResponse> {
    const { query, page, limit, order } = req;

    let search = query ? { name: ILike(`%${query}%`) } : {};
    const skip = (page - 1) * limit;

    this.logger.debug(`skip: ${skip}`);

    const [products, count] = await this.productRepo.findAndCount({
      where: search,
      skip,
      take: limit,
      order: { created_at: order },
    });

    return { data: products, count } as ProductsResponse;
  }

  // find by id
  async findOne(product_id: number): Promise<Product> {
    const product = await this.productRepo.findOneBy({ id: product_id });
    if (!product) {
      throw new NotFoundException(`ไม่พบสินค้าหมายเลขนี้: ${product_id}`);
    }
    return product;
  }

  // create product
  async create(req: CreateProductReq): Promise<Product> {
    const saved_product = this.productRepo.create({
      name: req.name,
      description: req.description,
      base_price: req.base_price,
      discount_price: req.discount_price,
    });

    this.logger.debug(`[createProduct]: req=${JSON.stringify(req)}`);

    return await this.productRepo.save(saved_product);
  }

  // update product
  async update(
    product_id: number,
    updateProductDto: UpdateProductReq,
  ): Promise<Product> {
    const existing = await this.findOne(product_id);

    const saved_product = this.productRepo.merge(existing, updateProductDto);

    return await this.productRepo.save(saved_product);
  }

  // delete product
  async delete(product_id: number): Promise<DeleteResult> {
    return await this.productRepo.delete(product_id);
  }
}

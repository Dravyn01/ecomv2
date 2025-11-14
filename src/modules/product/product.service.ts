import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { FindAllProductsQuery } from './dto/find-all-products.query';
import { CreateProductDTO } from './dto/create-product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';
import { DeleteResult } from 'typeorm/browser';
import { DatasResponse } from 'src/common/dto/res/datas.response';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  // TODO: add logger

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // find all
  async findAll(
    query: FindAllProductsQuery,
  ): Promise<DatasResponse<Product[]>> {
    const { search, page, limit, order } = query;

    const [products, count] = await this.productRepo.findAndCount({
      where: search ? { name: ILike(`%${query}%`) } : {},
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: order },
    });

    return { data: products, count } as DatasResponse<Product[]>;
  }

  // find by id
  async findOne(product_id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: {
        id: product_id,
      },
      relations: {
        variants: true,
      },
    });
    if (!product)
      throw new NotFoundException(`ไม่พบสินค้าหมายเลขนี้: ${product_id}`);
    return product;
  }

  // create product
  async create(body: CreateProductDTO): Promise<Product> {
    const saved_product = this.productRepo.create({
      name: body.name,
      description: body.description,
      base_price: body.base_price,
      discount_price: body.discount_price,
    });

    // save category

    this.logger.debug(`[${this.create.name}]: body=${JSON.stringify(body)}`);
    return await this.productRepo.save(saved_product);
  }

  // update product
  async update(product_id: number, body: UpdateProductDTO): Promise<Product> {
    const existing = await this.findOne(product_id);
    const saved_product = this.productRepo.merge(existing, body);
    return await this.productRepo.save(saved_product);
  }

  // delete product
  async delete(product_id: number): Promise<DeleteResult> {
    return await this.productRepo.delete(product_id);
  }

  // top 5 popular product
  async getPopularProduct(): Promise<Product[]> {
    return await this.productRepo.find({
      order: {
        popularity_score: 'DESC',
      },
      take: 5,
    });
  }
}

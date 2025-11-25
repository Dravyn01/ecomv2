import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColorService } from '../color/color.service';
import { SizeService } from '../size/size.service';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductService } from '../product/product.service';
import { DatasResponse } from 'src/common/dto/res/datas.response';
import { CreateVariantDTO } from './dto/create-variant.dto';
import { UpdateVariantDTO } from './dto/update-variant.dto';

@Injectable()
export class ProductVariantService {
  private readonly className = 'product-variant.service';
  private readonly logger = new Logger(ProductVariantService.name);

  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,

    private readonly sizeService: SizeService,
    private readonly productService: ProductService,
    private readonly colorService: ColorService,
  ) {}

  // # DEBUG
  async findAll() {
    return await this.variantRepo.find({
      relations: {
        product: true,
      },
    });
  }

  async findAllByProduct(
    product_id: number,
    body: FindAllQuery,
  ): Promise<DatasResponse<ProductVariant[]>> {
    this.logger.log(`[${this.className}::findAllByProduct] service called!`);

    const { page, limit, order } = body;

    const [variants, count] = await this.variantRepo.findAndCount({
      where: { product: { id: product_id } },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: order },
    });

    this.logger.log(
      `[${this.className}::findAllByProduct] total variants "${count}"`,
    );

    return { data: variants, count };
  }

  async findOne(variant_id: number): Promise<ProductVariant> {
    this.logger.log(`[${this.className}::findOne] service called!`);

    const product = await this.variantRepo.findOne({
      where: { id: variant_id },
      relations: ['product', 'color', 'size'],
    });

    if (!product) {
      this.logger.log(
        `[${this.className}::findOne] not found variant with variant_id=${variant_id}`,
      );
      throw new NotFoundException(`ไม่พบสินค้าหมายเลขนี้: ${variant_id}`);
    }

    this.logger.log(
      `[${this.className}::findOne] found variant with variant_id=${variant_id}`,
    );

    return product;
  }

  /*
   *
   * create variant
   *
   * TODO: add flow logic
   *
   *
   * */
  async create(body: CreateVariantDTO): Promise<ProductVariant> {
    this.logger.log(`[${this.className}::create] service called!`);

    const product = await this.productService.findOne(body.product_id);
    const color = await this.colorService.findOne(body.color_id);
    const size = await this.sizeService.findOne(body.size_id);

    const newVariant = await this.variantRepo.save({
      size: { id: size.id },
      product: { id: product.id },
      color: { id: color.id },
      price: body.price,
      sku: body.sku,
      image_url: body.image_url,
      stock: {
        quantity: 0,
      },
    });

    this.logger.log(
      `[${this.className}::create] created variant success`,
    );

    return newVariant;
  }

  /*
   *
   * update variant
   *
   * TODO: add flow logic
   *
   *
   * */
  async update(
    variant_id: number,
    body: UpdateVariantDTO,
  ): Promise<ProductVariant> {
    this.logger.log(`[${this.className}::update] service called!`);

    const existing_variant = await this.findOne(variant_id);

    const updated_variant = await this.variantRepo.save({
      id: existing_variant.id,
      ...body,
      ...(body.product_id && { product: { id: body.product_id } }),
      ...(body.size_id && {
        size: { id: (await this.sizeService.findOne(body.size_id)).id },
      }),
      ...(body.color_id && {
        color: { id: (await this.colorService.findOne(body.color_id)).id },
      }),
    });

    this.logger.log(
      `[${this.className}::update] variant_id=${variant_id} has updated!`,
    );

    return updated_variant;
  }

  async delete(variant_id: number): Promise<ProductVariant> {
    this.logger.log(`[${this.className}::delete] service called!`);

    const variant = await this.findOne(variant_id);

    await this.variantRepo.remove(variant);

    this.logger.log(
      `[${this.className}::delete] variant_id=${variant_id} has deleted`,
    );

    return variant;
  }
}
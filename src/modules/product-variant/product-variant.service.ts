import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColorService } from '../color/color.service';
import { SizeService } from '../size/size.service';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateVariantReq } from './dto/req/create-variant.req';
import { ProductService } from '../product/product.service';
import { UpdateVariantReq } from './dto/req/update-variant.req';
import { ProductVariantsResponse } from './dto/res/product-variants.res';

@Injectable()
export class ProductVariantService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    private readonly productService: ProductService,
    private readonly colorService: ColorService,
    private readonly sizeService: SizeService,
  ) {}

  // *DEBUG MODE*
  async listDevmode() {
    return await this.variantRepo.find();
  }

  // list product variants by product
  async findAllByProduct(
    product_id: number,
    req: FindAllQuery,
  ): Promise<ProductVariantsResponse> {
    const { page, limit, order } = req;

    const [variants, count] = await this.variantRepo.findAndCount({
      where: { product: { id: product_id } },
      skip: (page - 1) * limit,
      take: limit,
      order: { added_at: order },
    });

    return { data: variants, count };
  }

  // find by id
  async findOne(variant_id: number): Promise<ProductVariant> {
    const product = await this.variantRepo.findOne({
      where: { id: variant_id },
      relations: ['product', 'color', 'size'],
    });
    if (!product) {
      throw new NotFoundException(`ไม่พบสินค้าหมายเลขนี้: ${variant_id}`);
    }
    return product;
  }

  // create variant
  async create(req: CreateVariantReq): Promise<ProductVariant> {
    const existing_product = await this.productService.findOne(req.product_id);
    const existing_color = await this.colorService.findOne(req.color_id);
    const existing_size = await this.sizeService.findOne(req.size_id);

    return await this.variantRepo.save({
      product: { id: existing_product.id },
      color: { id: existing_color.id },
      size: { id: existing_size.id },
      price: req.price,
      sku: req.sku,
      image_url: req.image_url,
    });
  }

  // update variant
  async update(
    variant_id: number,
    req: UpdateVariantReq,
  ): Promise<ProductVariant> {
    const existing = await this.findOne(variant_id);

    const instant_update = {
      ...(req.product_id && {
        product: await this.productService.findOne(req.product_id),
      }),
      ...(req.color_id && {
        color: await this.colorService.findOne(req.color_id),
      }),
      ...(req.size_id && { size: await this.sizeService.findOne(req.size_id) }),
      ...(req.price && { price: req.price }),
      ...(req.sku && { sku: req.sku }),
      ...(req.image_url && { image_url: req.image_url }),
    };

    const updated = this.variantRepo.merge(existing, instant_update);
    return await this.variantRepo.save(updated);
  }

  // delete variant
  async delete(variant_id: number): Promise<void> {
    const existing = await this.findOne(variant_id);
    await this.variantRepo.remove(existing);
  }
}

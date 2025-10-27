import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ColorService } from '../color/color.service';
import { SizeService } from '../size/size.service';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateVariantReq } from './dto/req/create-variant.req';
import { ProductService } from '../product/product.service';
import { UpdateVariantReq } from './dto/req/update-variant.req';
import { ProductVariantsResponse } from './dto/res/product-variants.res';
import { CreateMovement } from '../stock/dto/create-movement.stock';
import { StockService } from '../stock/stock.service';
import { StockChangeType } from '../stock/enums/stock-change.enum';

@Injectable()
export class ProductVariantService {
  constructor(
    // ProductVariantRepository
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,

    // Stock Service
    private readonly stockService: StockService,
    private readonly sizeService: SizeService,
    private readonly productService: ProductService,
    private readonly colorService: ColorService,
    private readonly datasource: EntityManager,
  ) {}

  // *DEBUG MODE*
  async listDevmode() {
    return await this.variantRepo.find({
      relations: {
        product: true,
      },
    });
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
      order: { created_at: order },
    });

    return { data: variants, count };
  }

  // find by id
  async findOne(variant_id: number): Promise<ProductVariant> {
    const product = await this.variantRepo.findOne({
      where: { id: variant_id },
      relations: ['product', 'color', 'size'],
    });
    if (!product)
      throw new NotFoundException(`ไม่พบสินค้าหมายเลขนี้: ${variant_id}`);
    return product;
  }

  // create variant
  async create(req: CreateVariantReq): Promise<ProductVariant> {
    const product = await this.productService.findOne(req.product_id);
    const color = await this.colorService.findOne(req.color_id);
    const size = await this.sizeService.findOne(req.size_id);

    const product_variant = await this.datasource.transaction(async (tx) => {
      const saved_variant = await tx.save(ProductVariant, {
        size: { id: size.id },
        product: { id: product.id },
        color: { id: color.id },
        price: req.price,
        sku: req.sku,
        image_url: req.image_url,
      });

      const dto: CreateMovement = {
        variant_id: saved_variant.id,
        change_type: StockChangeType.IN,
        quantity: req.quantity,
      };

      console.log(saved_variant);
      console.log(dto);

      await tx.save(ProductVariant, saved_variant);
      await this.stockService.createMovement(dto, tx);
      return saved_variant;
    });

    return product_variant;
  }

  // update variant
  async update(
    variant_id: number,
    req: UpdateVariantReq,
  ): Promise<ProductVariant> {
    const existing_variant = await this.findOne(variant_id);

    const product_variant = await this.datasource.transaction(async (tx) => {
      const saved_variant = await tx.save(ProductVariant, {
        id: existing_variant.id,
        ...req,
        ...(req.product_id && { product: { id: req.product_id } }),
        ...(req.size_id && {
          size: { id: (await this.sizeService.findOne(req.size_id)).id },
        }),
        ...(req.color_id && {
          color: { id: (await this.colorService.findOne(req.color_id)).id },
        }),
      });

      console.log('[VariantServivce] saved_variant:', saved_variant);
      await tx.save(ProductVariant, saved_variant);

      if (req.quantity) {
        const dto: CreateMovement = {
          variant_id,
          change_type: StockChangeType.ADJUST,
          quantity: req.quantity,
          note: req.note,
        };
        await this.stockService.createMovement(dto, tx);
      }

      return saved_variant;
    });

    return product_variant;
  }

  // delete variant
  async delete(variant_id: number): Promise<void> {
    const existing = await this.findOne(variant_id);
    await this.variantRepo.remove(existing);
  }
}

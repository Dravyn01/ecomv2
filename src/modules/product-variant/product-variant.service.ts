import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ColorService } from '../color/color.service';
import { SizeService } from '../size/size.service';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductService } from '../product/product.service';
import { CreateMovement } from '../stock/dto/create-movement.stock';
import { StockService } from '../stock/stock.service';
import { StockChangeType } from '../stock/enums/stock-change.enum';
import { DatasResponse } from 'src/common/dto/res/datas.response';
import { CreateVariantDTO } from './dto/create-variant.dto';
import { UpdateVariantDTO } from './dto/update-variant.dto';

@Injectable()
export class ProductVariantService {
  // TODO: add logger

  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,

    // services
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
    body: FindAllQuery,
  ): Promise<DatasResponse<ProductVariant[]>> {
    const { page, limit, order } = body;

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

  /*
   *
   * create variant
   *
   * TODO: add flow logic
   *
   *
   * */
  async create(body: CreateVariantDTO): Promise<ProductVariant> {
    const product = await this.productService.findOne(body.product_id);
    const color = await this.colorService.findOne(body.color_id);
    const size = await this.sizeService.findOne(body.size_id);

    const product_variant = await this.datasource.transaction(async (tx) => {
      const saved_variant = await tx.save(ProductVariant, {
        size: { id: size.id },
        product: { id: product.id },
        color: { id: color.id },
        price: body.price,
        sku: body.sku,
        image_url: body.image_url,
      });

      const dto: CreateMovement = {
        variant_id: saved_variant.id,
        change_type: StockChangeType.IN,
        quantity: body.quantity,
      };

      console.log(saved_variant);
      console.log(dto);

      await tx.save(ProductVariant, saved_variant);
      await this.stockService.createMovement(dto, tx);
      return saved_variant;
    });

    return product_variant;
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
    const existing_variant = await this.findOne(variant_id);

    const product_variant = await this.datasource.transaction(async (tx) => {
      const saved_variant = await tx.save(ProductVariant, {
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

      console.log('[VariantServivce] saved_variant:', saved_variant);
      await tx.save(ProductVariant, saved_variant);

      if (body.quantity) {
        const dto: CreateMovement = {
          variant_id,
          change_type: StockChangeType.ADJUST,
          quantity: body.quantity,
          note: body.note,
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

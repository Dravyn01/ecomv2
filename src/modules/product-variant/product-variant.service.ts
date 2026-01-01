import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ColorService } from '../color/color.service';
import { SizeService } from '../size/size.service';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductService } from '../product/product.service';
import { DatasResponse } from 'src/common/dto/res/datas.response';
import { CreateVariantDTO } from './dto/create-variant.dto';
import { UpdateVariantDTO } from './dto/update-variant.dto';
import { ImageOwnerType } from 'src/modules/image/entities/image.entity';
import { ImageService } from '../image/image.service';

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
    private readonly imageService: ImageService,
    private readonly manager: EntityManager,
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
    product_id: string,
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

  async findOne(variant_id: string): Promise<ProductVariant> {
    const product = await this.variantRepo.findOne({
      where: { id: variant_id },
      relations: ['product', 'color', 'size'],
    });

    if (!product) {
      this.logger.warn(
        `[${this.className}::findOne] not found variant with variant_id=${variant_id}`,
      );
      throw new NotFoundException(`ไม่พบสินค้าหมายเลขนี้: ${variant_id}`);
    }

    return product;
  }

  async create(body: CreateVariantDTO): Promise<ProductVariant> {
    this.logger.log(`[${this.className}::create] service called!`);

    const product = await this.productService.findOne(body.product_id);
    const color = await this.colorService.findOne(body.color_id);
    const size = await this.sizeService.findOne(body.size_id);

    const savedVariant = await this.manager.transaction(async (tx) => {
      const newVariant = await tx.save(ProductVariant, {
        size: { id: size.id },
        product: { id: product.id },
        color: { id: color.id },
        price: body.price,
        stock: {
          quantity: 0,
        },
      });

      for (const image of body.images) {
        await this.imageService.createImage({
          image,
          owner_id: newVariant.id,
          owner_type: ImageOwnerType.VARIANT,
          tx,
        });
      }

      return newVariant;
    });

    return savedVariant;
  }

  async update(
    variant_id: string,
    body: UpdateVariantDTO,
  ): Promise<ProductVariant> {
    const existing_variant = await this.findOne(variant_id);

    const savedVariant = await this.manager.transaction(async (tx) => {
      const updatedVariant = await this.variantRepo.save({
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

      if (body.images?.length) {
        for (const image of body.images) {
          await this.imageService.updateImage(image, tx);
        }
      }

      return updatedVariant;
    });

    return savedVariant;
  }

  async delete(variant_id: string): Promise<ProductVariant> {
    const variant = await this.findOne(variant_id);
    await this.variantRepo.remove(variant);
    return variant;
  }
}

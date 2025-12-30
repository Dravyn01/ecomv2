import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Product, ProductStatus } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, ILike, Repository } from 'typeorm';
import { FindAllProductsQuery } from './dto/find-all-products.query';
import { CreateProductDTO } from './dto/create-product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';
import { DeleteResult } from 'typeorm/browser';
import { DatasResponse } from 'src/common/dto/res/datas.response';
import { CategoryService } from '../category/category.service';
import { ProductView } from '../analytics/entities/product-view.entity';
import { type Request } from 'express';
import { ImageOwnerType } from '../image/entities/image.entity';
import { User } from '../user/entities/user.entity';
import { ImageService } from '../image/image.service';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductView)
    private readonly viewRepo: Repository<ProductView>,
    private readonly imageService: ImageService,
    private readonly categoryService: CategoryService,
    private readonly manager: EntityManager,
  ) {}

  // find all
  async findAll(
    query: FindAllProductsQuery,
  ): Promise<DatasResponse<Product[]>> {
    const { search, page, limit, order } = query;

    const [products, count] = await this.productRepo.findAndCount({
      select: {
        categories: {
          id: true,
          name: true,
        },
      },
      where: search ? { name: ILike(`%${query}%`) } : {},
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: order },
      relations: ['categories'],
    });

    return { data: products, count } as DatasResponse<Product[]>;
  }

  // find by id
  async findOne(product_id: string): Promise<Product> {
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

  async create(body: CreateProductDTO): Promise<Product> {
    return this.manager.transaction(async (tx: EntityManager) => {
      await this.categoryService.validateIds(body.category_ids, tx);

      // save product
      const product = await tx.save(Product, {
        name: body.name,
        description: body.description,
        base_price: body.base_price,
        status: ProductStatus.INACTIVE,
        discount_price: body.discount_price,
        categories: body.category_ids.map((id) => ({ id })),
      });

      if (body.images?.length) {
        for (const image of body.images) {
          await this.imageService.createImage({
            owner_id: product.id,
            owner_type: ImageOwnerType.PRODUCT,
            image,
            tx,
          });
        }
      }

      return product;
    });
  }

  // update product
  async update(product_id: string, body: UpdateProductDTO): Promise<Product> {
    let product = await this.findOne(product_id);

    const updatedProduct = await this.manager.transaction(async (tx) => {
      // validate and set category
      if (body.category_ids?.length) {
        const categories = await this.categoryService.validateIds(
          body.category_ids,
          tx,
        );
        product.categories = categories;
      }

      const savedProduct = tx.merge(Product, product, body);
      await this.productRepo.save(savedProduct);

      if (body.images?.length) {
        for (const image of body.images) {
          await this.imageService.createImage({
            owner_id: product_id,
            owner_type: ImageOwnerType.PRODUCT,
            image,
            tx,
          });
        }
      }

      return savedProduct;
    });

    return updatedProduct;
  }

  // delete product
  async delete(product_id: number): Promise<DeleteResult> {
    return await this.productRepo.delete(product_id);
  }

  // view product
  async view(product_id: string, req: Request): Promise<Product> {
    this.logger.log(
      `[product.service::view] called! (product_id=${product_id}, user=${JSON.stringify(req.user)})`,
    );
    const product = await this.findOne(product_id);
    const user = (req.user as User | null) || null;
    const now = new Date();
    let newData;

    const item = await this.viewRepo.findOne({
      where: user
        ? {
            user: { id: user.id },
            product: { id: product.id },
          }
        : {
            ip_address: req.ip,
            user_agent: req.headers['user-agent'],
            product: { id: product.id },
          },
    });

    if (item) {
      // update
      newData = {
        id: item.id,
        last_view_at: now,
        total_view: item.total_view + 1,
      };
    } else {
      // insert
      newData = {
        product: { id: product_id },
        user: user ? { id: user.id } : {},
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        last_view_at: now,
        total_view: 1,
      };
    }

    // ระบุก่อนว่าเป็น user || ip เดิมไหม ถ้าไม่ใช่ก็เพิ่มไป ถ้าใช่ก็ไม่
    // if (isBefore(now, addMinutes(new Date(saved_view.last_view_at), 1)))
    //   return product;

    console.log('item', item);
    await this.viewRepo.save(newData);
    return product;
  }
}

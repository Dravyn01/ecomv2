import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ILike, In, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindAllCategory } from './dto/req/find-all-category.query';
import { CategorysRes } from './dto/res/categorys.res';
import { CreateCategoryReq } from './dto/req/create-category.req';
import { UpdateCategoryReq } from './dto/req/update-category.req';

@Injectable()
export class CategoryService {
  private readonly className = this.constructor.name;
  private readonly logger = new Logger(this.className);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(req: FindAllCategory): Promise<CategorysRes> {
    this.logger.log(
      `[${this.className}::findAll] called (query=${req.query}, page=${req.page}, limit=${req.limit})`,
    );

    const { query, page, limit, order } = req;
    const whereCondition = query ? { name: ILike(`%${query}%`) } : {};
    const skip = (page - 1) * limit;

    const [categories, count] = await this.categoryRepo.findAndCount({
      where: whereCondition,
      skip,
      take: limit,
      order: { created_at: order },
      relations: {
        children: true,
        products: true,
      },
    });

    this.logger.debug(`[${this.className}:findAll] found ${count} categories`);
    return { categorys: categories, count };
  }

  async findOne(category_id: number): Promise<Category> {
    this.logger.log(`[${this.className}::findOne] called (id=${category_id})`);

    const category = await this.categoryRepo.findOne({
      where: { id: category_id },
      relations: ['children'],
    });

    if (!category) {
      this.logger.warn(
        `[${this.className}::findOne] not found (id=${category_id})`,
      );
      throw new NotFoundException(`ไม่พบหมวดหมู่หมายเลขนี้: ${category_id}`);
    }

    this.logger.debug(
      `[${this.className}::findOne] found category id=${category_id}`,
    );
    return category;
  }

  async createCategory(req: CreateCategoryReq): Promise<Category> {
    this.logger.log(
      `[${this.className}::createCategory] creating category name="${req.name}"`,
    );

    const saved_category = this.categoryRepo.create({ name: req.name });

    if (req.category_ids?.length) {
      this.logger.debug(
        `[${this.className}::createCategory] has children ids=[${req.category_ids.join(', ')}]`,
      );
      const categories = await this.categoryRepo.findBy({
        id: In(req.category_ids),
      });
      saved_category.children = categories;
    }

    const result = await this.categoryRepo.save(saved_category);
    this.logger.log(
      `[${this.className}::createCategory] created successfully id=${result.id}`,
    );
    return result;
  }

  async updateCategory(category_id: number, req: UpdateCategoryReq) {
    this.logger.log(
      `[${this.className}::updateCategory] updating id=${category_id}`,
    );
    this.logger.log(
      `[${this.className}::updateCategory] req=${JSON.stringify(req)}`,
    );

    const existing = await this.findOne(category_id);

    this.logger.debug(
      `[${this.className}::updateCategory] existing data=${JSON.stringify(existing)}`,
    );

    const category_instant = this.categoryRepo.create({ name: req.name });

    if (req.category_ids?.length) {
      const existing_category = await this.categoryRepo.find({
        where: { id: In(req.category_ids) },
      });
      category_instant.children = existing_category;

      this.logger.debug(
        `[${this.className}::updateCategory] found sub category ${existing_category.length}`,
      );
    }

    this.logger.debug(
      `[${this.className}::updateCategory] instant data=${JSON.stringify(category_instant)}`,
    );

    // merge data
    const merge_category = this.categoryRepo.merge(existing, category_instant);

    this.logger.debug(
      `[${this.className}::updateCategory] merge data=${JSON.stringify(merge_category)}`,
    );

    const result = await this.categoryRepo.save(merge_category);

    this.logger.log(
      `[${this.className}::updateCategory] updated successfully id=${result.id}`,
    );
    return result;
  }
}

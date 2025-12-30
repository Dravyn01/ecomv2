import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager, ILike, In, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindAllCategory } from './dto/find-all-category.query';
import { DatasResponse } from 'src/common/dto/res/datas.response';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { UpdateCategoryDTO } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  private readonly className = 'category.service';
  private readonly logger = new Logger(this.className);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(req: FindAllCategory): Promise<DatasResponse<Category[]>> {
    this.logger.log(`[${this.className}::findAll] service called!`);

    const { search, page, limit, order } = req;

    const [categories, count] = await this.categoryRepo.findAndCount({
      where: search ? { name: ILike(`%${search}%`) } : {},
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: order },
      relations: {
        parent: true,
        children: true,
      },
    });

    this.logger.debug(`[${this.className}:findAll] found "${count}"`);
    return { data: categories, count };
  }

  async findOne(category_id: number): Promise<Category> {
    this.logger.log(
      `[${this.className}::findOne] service called! (category_id=${category_id})`,
    );

    const category = await this.categoryRepo.findOne({
      where: { id: category_id },
      relations: ['children', 'parent'],
    });

    if (!category) {
      this.logger.warn(
        `[${this.className}::findOne] not found (id=${category_id})`,
      );
      throw new NotFoundException(`ไม่พบหมวดหมู่หมายเลขนี้: ${category_id}`);
    }

    this.logger.log(
      `[${this.className}::findOne] category_id=${category_id} exists`,
    );

    return category;
  }

  async create(req: CreateCategoryDTO): Promise<Category> {
    this.logger.log(`[${this.className}::create] service called!`);

    const saved_category = this.categoryRepo.create({ name: req.name });

    if (req.category_ids?.length) {
      this.logger.debug(
        `[${this.className}::create] has children ids=[${req.category_ids.join(', ')}]`,
      );
      const categories = await this.categoryRepo.findBy({
        id: In(req.category_ids),
      });
      saved_category.children = categories;
    }

    const result = await this.categoryRepo.save(saved_category);
    this.logger.log(
      `[${this.className}::create] created successfully id=${result.id}`,
    );
    return result;
  }

  async update(category_id: number, req: UpdateCategoryDTO): Promise<Category> {
    this.logger.log(
      `[${this.className}::update] service called (category_id=${category_id})`,
    );

    const existing = await this.findOne(category_id);
    this.logger.debug(
      `[${this.className}::update] existing data=${JSON.stringify(existing)}`,
    );

    let saved_category: any = { name: req.name };

    if (req.category_ids?.length) {
      const existing_category = await this.categoryRepo.find({
        where: { id: In(req.category_ids) },
      });
      saved_category.children = existing_category;

      this.logger.log(
        `[${this.className}::update] found sub category "${existing_category.length}"`,
      );
    }

    const result = await this.categoryRepo.save(saved_category);

    this.logger.log(
      `[${this.className}::update] updated successfully id=${result.id}`,
    );
    return result;
  }

  async delete(category_id: number): Promise<void> {
    this.logger.log(
      `[${this.className}::delete] service called! (category_id=${category_id})`,
    );
    await this.categoryRepo.remove(await this.findOne(category_id));
  }

  async validateIds(
    category_ids: number[],
    tx: EntityManager,
  ): Promise<Category[]> {
    this.logger.log(
      `[${this.className}::validateIds] service called! (category_ids=${category_ids.join(', ')})`,
    );
    const categories = await tx.findBy(Category, {
      id: In(category_ids),
    });

    if (categories.length !== category_ids.length) {
      this.logger.warn(
        `[${this.className}::validateIds] some category_ids do not exist`,
      );
      throw new BadRequestException('Some category IDs do not exist');
    }

    return categories;
  }
}

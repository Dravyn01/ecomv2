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
  private readonly logger = new Logger(CategoryService.name); // ✅ สร้าง Logger instance

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(req: FindAllCategory): Promise<CategorysRes> {
    this.logger.log(
      `📦 เรียก findAll (query=${req.query}, page=${req.page}, limit=${req.limit})`,
    );
    const { query, page, limit, order } = req;

    let whereCondtion = query ? { name: ILike(`%${query}%`) } : {};
    const skip: number = (page - 1) * limit;

    const [categorys, count] = await this.categoryRepo.findAndCount({
      where: whereCondtion,
      skip,
      take: limit,
      order: { created_at: order },
      relations: {
        parent: true,
        children: true,
        products: true,
      },
    });

    this.logger.debug(`📊 พบ category ${count} รายการ`);
    return { categorys, count } as CategorysRes;
  }

  async findOne(category_id: number): Promise<Category> {
    this.logger.log(`🔍 กำลังค้นหา category_id=${category_id}`);
    const category = await this.categoryRepo.findOneBy({ id: category_id });
    if (!category) {
      this.logger.warn(`⚠️ ไม่พบ category id=${category_id}`);
      throw new NotFoundException(`ไม่พบ category หมายเลขนี้: ${category_id}`);
    }
    this.logger.debug(`✅ พบ category id=${category_id}`);
    return category;
  }

  async createCategory(req: CreateCategoryReq): Promise<Category> {
    this.logger.log(`🆕 กำลังสร้าง category ชื่อ "${req.name}"`);
    const saved_category = this.categoryRepo.create({ name: req.name });

    if (req.category_ids?.length) {
      this.logger.debug(
        `📂 มี children category ids=${req.category_ids.join(', ')}`,
      );
      const category = await this.categoryRepo.findBy({
        id: In(req.category_ids),
      });
      saved_category.children = category;
    }

    const result = await this.categoryRepo.save(saved_category);
    this.logger.log(`✅ สร้าง category สำเร็จ id=${result.id}`);
    return result;
  }

  async updateCategory(category_id: number, req: UpdateCategoryReq) {
    this.logger.log(`✏️ อัปเดต category id=${category_id}`);
    const existing = await this.findOne(category_id);
    const saved_category = this.categoryRepo.merge(existing, req);
    const result = await this.categoryRepo.save(saved_category);
    this.logger.log(`✅ อัปเดตสำเร็จ id=${result.id}`);
    return result;
  }
}

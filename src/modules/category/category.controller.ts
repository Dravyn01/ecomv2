import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { FindAllCategory } from './dto/find-all-category.query';
import { DatasResponse } from 'src/common/dto/res/datas.response';
import { UpdateCategoryDTO } from './dto/update-category.dto';
import { CreateCategoryDTO } from './dto/create-category.dto';

@Controller('/admin/categorys')
export class CategoryController {
  private readonly className = 'category.controller';
  private readonly logger = new Logger();

  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(
    @Query() query: FindAllCategory,
  ): Promise<ApiResponse<DatasResponse<Category[]>>> {
    this.logger.log(
      `[${this.className}::findAll] find categorys with query=${JSON.stringify(query)}`,
    );
    const result = await this.categoryService.findAll(query);
    return { message: `พบ "${result.count}" หมวดหมู่`, data: result };
  }

  @Get(':category_id')
  async findById(
    @Param('category_id') category_id: string,
  ): Promise<ApiResponse<Category>> {
    this.logger.log(
      `[${this.className}::findById] find by category_id=${category_id}`,
    );
    const category = await this.categoryService.findOne(+category_id);
    return {
      message: `หมวดหมู่หมายเลข: ${category_id}`,
      data: category,
    };
  }

  @Post()
  async create(@Body() req: CreateCategoryDTO): Promise<ApiResponse<Category>> {
    this.logger.log(
      `[${this.className}::create] create new category with name=${req.name}`,
    );
    const newCategory = await this.categoryService.create(req);
    return {
      message: 'สร้างหมวดหมู่เรีบลร้อย',
      data: newCategory,
    };
  }

  @Put(':category_id')
  async update(
    @Param('category_id') category_id: string,
    @Body() req: UpdateCategoryDTO,
  ): Promise<ApiResponse<Category>> {
    this.logger.log(
      `[${this.className}::update] find by category_id=${category_id}`,
    );
    const updatedCategory = await this.categoryService.update(
      +category_id,
      req,
    );
    return {
      message: 'อัพเดทหมวดหมู่เรีบลร้อย',
      data: updatedCategory,
    };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':category_id')
  async delete(
    @Param('category_id') category_id: string,
  ): Promise<ApiResponse<null>> {
    this.logger.log(
      `[${this.className}::delete] delete category with category_id=${category_id}`,
    );
    await this.categoryService.delete(+category_id);
    return {
      message: '',
      data: null,
    };
  }
}

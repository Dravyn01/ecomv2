import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { FindAllCategory } from './dto/req/find-all-category.query';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { CategoryService } from './category.service';
import { CategorysRes } from './dto/res/categorys.res';
import { Category } from './entities/category.entity';
import { CreateCategoryReq } from './dto/req/create-category.req';
import { UpdateCategoryReq } from './dto/req/update-category.req';

@Controller('/admin/categorys')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(
    @Query() query: FindAllCategory,
  ): Promise<ApiResponse<CategorysRes>> {
    const result = await this.categoryService.findAll(query);
    return { message: `พบ "${result.count}" หมวดหมู่`, data: result };
  }

  @Get(':category_id')
  async findById(
    @Param('category_id') category_id: string,
  ): Promise<ApiResponse<Category>> {
    return {
      message: `หมวดหมู่หมายเลข: ${category_id}`,
      data: await this.categoryService.findOne(+category_id),
    };
  }

  @Post()
  async create(@Body() req: CreateCategoryReq): Promise<ApiResponse<Category>> {
    return {
      message: 'สร้างหมวดหมู่เรีบลร้อย',
      data: await this.categoryService.createCategory(req),
    };
  }

  @Put(':category_id')
  async update(
    @Param('category_id') category_id: string,
    @Body() req: UpdateCategoryReq,
  ): Promise<ApiResponse<Category>> {
    return {
      message: 'อัพเดทหมวดหมู่เรีบลร้อย',
      data: await this.categoryService.updateCategory(+category_id, req),
    };
  }

  @Delete(':category_id')
  async delete(
    @Param('category_id') category_id: string,
  ): Promise<ApiResponse<void>> {
    return {
      message: 'delete category successfully!',
      data: await this.categoryService.deleteCategory(+category_id),
    };
  }
}

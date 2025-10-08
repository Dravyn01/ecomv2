import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { FindAllCategory } from './dto/req/find-all-category.query';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { CategoryService } from './category.service';
import { CategorysRes } from './dto/res/categorys.res';
import { Category } from './entities/category.entity';
import { CreateCategoryReq } from './dto/req/create-category.req';
import { UpdateCategoryReq } from './dto/req/update-category.req';

@Controller('/admin/categorys/')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async all(@Query() req: FindAllCategory): Promise<ApiResponse<CategorysRes>> {
    return { message: '', data: await this.categoryService.findAll(req) };
  }

  @Get(':id')
  async categoryDetails(
    @Param('id') category_id: string,
  ): Promise<ApiResponse<Category>> {
    return {
      message: '',
      data: await this.categoryService.findOne(+category_id),
    };
  }

  @Post()
  async createCategory(
    @Body() req: CreateCategoryReq,
  ): Promise<ApiResponse<Category>> {
    return {
      message: '',
      data: await this.categoryService.createCategory(req),
    };
  }

  @Put(':id')
  async updateCategory(
    @Param('id') category_id: number,
    @Body() req: UpdateCategoryReq,
  ): Promise<ApiResponse<Category>> {
    return {
      message: '',
      data: await this.categoryService.updateCategory(category_id, req),
    };
  }
}

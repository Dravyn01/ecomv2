import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CreateColorReq } from './dto/req/create-color.req';
import { UpdateColorReq } from './dto/req/update-color.req';
import { ColorService } from './color.service';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { Color } from './entities/color.entity';

@Controller('/admin/colors')
export class ColorController {
  constructor(private readonly colorsService: ColorService) {}

  @Post()
  async create(@Body() dto: CreateColorReq): Promise<ApiResponse<Color>> {
    const color = await this.colorsService.create(dto);
    return {
      message: 'สร้าง Color สำเร็จ',
      data: color,
    };
  }

  @Get()
  async findAll(): Promise<ApiResponse<Color[]>> {
    const colors = await this.colorsService.findAll();
    return {
      message: 'ดึงข้อมูล Color ทั้งหมดสำเร็จ',
      data: colors,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Color>> {
    const color = await this.colorsService.findOne(+id);
    return {
      message: `ดึงข้อมูล Color id=${id} สำเร็จ`,
      data: color,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateColorReq,
  ): Promise<ApiResponse<Color>> {
    const updatedColor = await this.colorsService.update(+id, dto);
    return {
      message: `อัปเดต Color id=${id} สำเร็จ`,
      data: updatedColor,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.colorsService.remove(+id);
    return {
      message: `ลบ Color id=${id} สำเร็จ`,
      data: null,
    };
  }
}

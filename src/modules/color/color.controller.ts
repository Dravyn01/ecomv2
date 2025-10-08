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

@Controller('colors')
export class ColorController {
  constructor(private readonly colorsService: ColorService) {}

  @Post()
  create(@Body() dto: CreateColorReq): ApiResponse<Promise<Color>> {
    return {
      message: 'สร้าง Color สำเร็จ',
      data: this.colorsService.create(dto),
    };
  }

  @Get()
  findAll(): ApiResponse<Promise<Color[]>> {
    return {
      message: 'ดึงข้อมูล Color ทั้งหมดสำเร็จ',
      data: this.colorsService.findAll(),
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string): ApiResponse<Promise<Color>> {
    return {
      message: `ดึงข้อมูล Color id=${id} สำเร็จ`,
      data: this.colorsService.findOne(+id),
    };
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateColorReq,
  ): ApiResponse<Promise<Color>> {
    return {
      message: `อัปเดต Color id=${id} สำเร็จ`,
      data: this.colorsService.update(+id, dto),
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string): ApiResponse<Promise<void>> {
    return {
      message: `ลบ Color id=${id} สำเร็จ`,
      data: this.colorsService.remove(+id),
    };
  }
}

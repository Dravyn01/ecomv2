import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { SizeService } from './size.service';
import { CreateSizeReq } from './dto/req/create-size.req';
import { UpdateSizeReq } from './dto/req/update-size.req';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { Size } from './entities/size.entity';

@Controller('/admin/sizes')
export class SizeController {
  constructor(private readonly sizesService: SizeService) {}

  @Post()
  async create(@Body() dto: CreateSizeReq): Promise<ApiResponse<Size>> {
    const size = await this.sizesService.create(dto);
    return {
      message: 'สร้าง Size สำเร็จ',
      data: size,
    };
  }

  @Get()
  async findAll(): Promise<ApiResponse<Size[]>> {
    const sizes = await this.sizesService.findAll();
    return {
      message: 'ดึงข้อมูล Size ทั้งหมดสำเร็จ',
      data: sizes,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Size>> {
    const size = await this.sizesService.findOne(+id);
    return {
      message: `ดึงข้อมูล Size id=${id} สำเร็จ`,
      data: size,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSizeReq,
  ): Promise<ApiResponse<Size>> {
    const updated = await this.sizesService.update(+id, dto);
    return {
      message: `อัปเดต Size id=${id} สำเร็จ`,
      data: updated,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    await this.sizesService.remove(+id);
    return {
      message: `ลบ Size id=${id} สำเร็จ`,
      data: undefined,
    };
  }
}

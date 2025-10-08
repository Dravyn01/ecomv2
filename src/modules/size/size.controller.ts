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

@Controller('sizes')
export class SizeController {
  constructor(private readonly sizesService: SizeService) {}

  @Post()
  create(@Body() dto: CreateSizeReq): ApiResponse<Promise<Size>> {
    return {
      message: 'สร้าง Size สำเร็จ',
      data: this.sizesService.create(dto),
    };
  }

  @Get()
  findAll(): ApiResponse<Promise<Size[]>> {
    return {
      message: 'ดึงข้อมูล Size ทั้งหมดสำเร็จ',
      data: this.sizesService.findAll(),
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string): ApiResponse<Promise<Size>> {
    return {
      message: `ดึงข้อมูล Size id=${id} สำเร็จ`,
      data: this.sizesService.findOne(+id),
    };
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSizeReq,
  ): ApiResponse<Promise<Size>> {
    return {
      message: `อัปเดต Size id=${id} สำเร็จ`,
      data: this.sizesService.update(+id, dto),
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string): ApiResponse<Promise<void>> {
    return {
      message: `ลบ Size id=${id} สำเร็จ`,
      data: this.sizesService.remove(+id),
    };
  }
}

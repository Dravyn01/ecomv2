import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { MoveImageDTO } from './dto/move-image.dto';
import { ImageService } from './image.service';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { ImageOwnerType } from './entities/image.entity';

@Controller('/api/images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Put('/move-order')
  async moveOrder(@Body() dto: MoveImageDTO): Promise<ApiResponse<null>> {
    await this.imageService.moveOrder(dto);
    return {
      message: 'ย้ายภาพสำเร็จ',
      data: null,
    };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':image_id/:owner_type')
  async deleteImage(
    @Param('image_id') image_id: string,
    @Param('owner_type') owner_type: ImageOwnerType,
  ): Promise<void> {
    await this.imageService.deleteImage(image_id, owner_type);
  }
}

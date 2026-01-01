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
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('/api/images')
export class ImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly emitter: EventEmitter2,
  ) {}

  @Put('/move-order')
  async moveOrder(@Body() dto: MoveImageDTO): Promise<ApiResponse<null>> {
    await this.imageService.moveOrder(dto);
    return {
      message: 'ย้ายภาพสำเร็จ',
      data: null,
    };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':image_id')
  async deleteImage(@Param('image_id') image_id: string): Promise<void> {
    const deletedImage = await this.imageService.deleteImage(image_id);

    if (deletedImage.owner_type === ImageOwnerType.MESSAGE) {
      this.emitter.emit('IMAGE_DELETED', { image_id });
    }
  }
}

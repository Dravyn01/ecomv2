import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { UpdateImageDTO } from './update-image.dto';
import { PickType } from '@nestjs/mapped-types';
import { IMAGE_DTO_MESSAGE } from 'src/common/enums/dto/image.enum';

export class MoveImageDTO extends PickType(UpdateImageDTO, [
  'image_id',
] as const) {
  /* ตำแหน่งที่ต้องการย้ายไป */
  @IsNotEmpty({ message: IMAGE_DTO_MESSAGE.TARGET_ORDER_IS_NOT_EMPTY })
  @IsInt({ message: IMAGE_DTO_MESSAGE.TARGET_ORDER_IS_INTTEGERE })
  @IsPositive({ message: IMAGE_DTO_MESSAGE.TARGET_ORDER_MUST_BE_POSITIVE })
  target: number;
}

import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { UpdateImageDTO } from './update-image.dto';
import { PickType } from '@nestjs/mapped-types';

export class MoveImageDTO extends PickType(UpdateImageDTO, [
  'image_id',
] as const) {
  /* ตำแหน่งที่ต้องการย้ายไป */
  @IsNotEmpty({ message: '' })
  @IsInt()
  @IsPositive()
  target: number;
}

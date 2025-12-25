import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateImageDTO } from './create-image.dto';

export class UpdateImageDTO extends PartialType(CreateImageDTO) {
  @IsNotEmpty({ message: '' })
  @IsUUID()
  image_id: string;
}

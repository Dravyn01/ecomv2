import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProductDTO } from './create-product.dto';
import { UpdateImageDTO } from 'src/modules/image/dto/update-image.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class UpdateProductDTO extends PartialType(
  OmitType(CreateProductDTO, ['images'] as const),
) {
  @ValidateNested({ each: true })
  @Type(() => UpdateImageDTO)
  images?: UpdateImageDTO[];
}

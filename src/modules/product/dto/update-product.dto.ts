import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProductDTO } from './create-product.dto';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { CreateImageDTO } from 'src/modules/image/dto/create-image.dto';

export class UpdateProductDTO extends PartialType(
  OmitType(CreateProductDTO, ['images'] as const),
) {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateImageDTO)
  images?: CreateImageDTO[];
}

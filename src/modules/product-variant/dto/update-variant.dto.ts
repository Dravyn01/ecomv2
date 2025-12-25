import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateVariantDTO } from './create-variant.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { UpdateImageDTO } from 'src/modules/image/dto/update-image.dto';
import { Type } from 'class-transformer';

export class UpdateVariantDTO extends PartialType(
  OmitType(CreateVariantDTO, ['images'] as const),
) {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateImageDTO)
  images?: UpdateImageDTO[];
}

import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional, IsString, Length } from 'class-validator';
import { CreateVariantDTO } from './create-variant.dto';

export class UpdateVariantDTO extends PartialType(CreateVariantDTO) {
  @IsOptional()
  @IsInt({ message: '' })
  quantity?: number;

  @IsOptional()
  @Length(1, 255, { message: '' })
  @IsString({ message: '' })
  note?: string;
}

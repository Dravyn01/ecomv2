import { PartialType } from '@nestjs/mapped-types';
import { CreateVariantReq } from './create-variant.req';
import { IsInt, IsOptional, IsString, Length } from 'class-validator';

export class UpdateVariantReq extends PartialType(CreateVariantReq) {
  @IsOptional()
  @IsInt({ message: '' })
  quantity?: number;

  @IsOptional()
  @Length(1, 255, { message: '' })
  @IsString({ message: '' })
  note?: string;
}

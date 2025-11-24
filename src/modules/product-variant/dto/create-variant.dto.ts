import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';
import { ProductVariantStatus } from '../entities/product-variant.entity';

// TODO add message
export class CreateVariantDTO {
  @IsNotEmpty({ message: '' })
  @IsPositive({ message: '' })
  product_id: number;

  @IsNotEmpty({ message: '' })
  @IsPositive({ message: '' })
  color_id: number;

  @IsNotEmpty({ message: '' })
  @IsPositive({ message: '' })
  size_id: number;

  @IsNotEmpty({ message: '' })
  @IsNumber({}, { message: 'ราคาต้องเป็นตัวเลข' })
  @Min(1, { message: 'หมายเลขไซส์ไม่ถูกต้อง' })
  price: number;

  @IsNotEmpty({ message: '' })
  @IsString({ message: '' })
  @Length(1, 100, { message: '' })
  sku: string;

  @IsNotEmpty({ message: '' })
  @IsUrl({ require_protocol: true }, { message: '' })
  image_url: string;

  @IsNotEmpty({ message: '' })
  @IsPositive({ message: '' })
  quantity: number;

  @IsOptional()
  @IsEnum(ProductVariantStatus, { message: '' })
  status?: ProductVariantStatus = ProductVariantStatus.INACTIVE;
}

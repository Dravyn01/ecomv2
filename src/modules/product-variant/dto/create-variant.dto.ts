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

export class CreateVariantDTO {
  @IsNotEmpty({ message: 'กรุณาเลือกสินค้า' })
  @IsPositive({ message: 'รหัสสินค้าต้องเป็นตัวเลขที่มากกว่า 0' })
  product_id: number;

  @IsNotEmpty({ message: 'กรุณาเลือกสี' })
  @IsPositive({ message: 'รหัสสีต้องเป็นตัวเลขที่มากกว่า 0' })
  color_id: number;

  @IsNotEmpty({ message: 'กรุณาเลือกไชส์' })
  @IsPositive({ message: 'รหัสไชส์ต้องเป็นตัวเลขที่มากกว่า 0' })
  size_id: number;

  @IsNotEmpty({ message: 'กรุณากรอกราคาสินค้า' })
  @IsNumber({}, { message: 'ราคาต้องเป็นตัวเลข' })
  @Min(1, { message: 'ราคาสินค้าต้องมากกว่า 1 บาท' })
  price: number;

  @IsNotEmpty({ message: 'กรุณาเลือกรูปภาพ' })
  image_url: string;

  @IsOptional()
  @IsEnum(ProductVariantStatus, { message: 'สถานะสินค้าต้องเป็นหนึ่งใน ProductVariantStatus' })
  status?: ProductVariantStatus = ProductVariantStatus.INACTIVE;
}

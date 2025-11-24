import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { ProductVariantStatus } from 'src/config/entities.config';

export class CreateProductDTO {
  @IsNotEmpty({ message: 'กรุณากรอกชื่อสินค้า' })
  @IsString({ message: 'ชื่อสินค้าต้องเป็นข้อความเท่านั้น' })
  @Length(1, 100, {
    message: 'ชื่อสินค้าต้องมีความยาวระหว่าง 1 ถึง 100 ตัวอักษร',
  })
  name: string;

  @IsNotEmpty({ message: 'กรุณากรอกคำอธิบายสินค้า' })
  @IsString({ message: 'คำอธิบายสินค้าต้องเป็นข้อความเท่านั้น' })
  @Length(1, 255, {
    message: 'คำอธิบายสินค้าต้องมีความยาวระหว่าง 1 ถึง 255 ตัวอักษร',
  })
  description: string;

  @IsNotEmpty({ message: 'กรุณากรอกราคาพื้นฐานของสินค้า' })
  @IsNumber({}, { message: 'ราคาพื้นฐานต้องเป็นตัวเลขเท่านั้น' })
  @Min(1, { message: 'ราคาพื้นฐานต้องมากกว่า 0 บาท' })
  base_price: number;

  @IsOptional()
  @IsNumber({}, { message: 'ราคาหลังลดต้องเป็นตัวเลขเท่านั้น' })
  @Min(1, { message: 'ราคาหลังลดต้องมากกว่า 0 บาท' })
  discount_price?: number;

  @IsOptional()
  @IsEnum(ProductVariantStatus, { message: '' })
  status: ProductVariantStatus = ProductVariantStatus.ACTIVE;

  @IsOptional()
  @IsArray({ message: 'หมวดหมู่สินค้าต้องเป็นอาเรย์ของตัวเลข' })
  @IsInt({ each: true, message: 'หมวดหมู่สินค้าต้องเป็นจำนวนเต็มเท่านั้น' })
  @IsPositive({
    each: true,
    message: 'หมวดหมู่แต่ละรายการต้องเป็นตัวเลขที่มากกว่า 0',
  })
  category_ids: number[] = [];
}

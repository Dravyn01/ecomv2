import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Length,
  Min,
} from 'class-validator';

// TODO: add message for field category_ids

export class CreateProductDTO {
  @IsNotEmpty({ message: 'กรุนากรอกชื่อสินค้า' })
  @Length(1, 100, {
    message: 'ชื่อสินค้าต้องไม่เกิน 100 ตัว และ ต้องไม่น้อยกว่า 1',
  })
  name: string;

  @IsNotEmpty({ message: 'กรุนากรอกชื่อสินค้า' })
  @Length(1, 255, {
    message: 'คำอธีบายสินค้าต้องไม่วยาวเกินไปและไม่สั้นเกินไป',
  })
  description: string;

  @IsNotEmpty({ message: 'กรุนากรอกราคาพื้นฐานของสินค้า' })
  @IsNumber({}, { message: 'ราคาพื้นฐานต้องเป็นตัวเลขเท่านั้น' })
  @Min(1, { message: 'ราคาพื้นฐานต้องมากว่า 0 บาท' })
  base_price: number;

  @IsOptional()
  @IsNumber({}, { message: 'ราคาหลังลดต้องเป็นตัวเลขเท่านั้น' })
  @Min(1, { message: 'ราคาหลังลดต้องมากกว่า 0 บาท' })
  discount_price?: number;

  @IsOptional()
  @IsArray({ message: '' })
  @IsInt({ each: true, message: '' })
  @IsPositive({ each: true, message: '' })
  category_ids: number[] = [];
}

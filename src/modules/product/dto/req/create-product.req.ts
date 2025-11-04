import { IsNotEmpty, IsNumber, IsOptional, Length, Min } from 'class-validator';

export class CreateProductReq {
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
  // discount_price?: number;
}

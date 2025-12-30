import { IsNotEmpty, IsPositive, IsInt, IsUUID } from 'class-validator';

export class AddToCartDTO {
  @IsPositive()
  user_id: string; // can use jwtGuard and @Role()

  @IsNotEmpty({ message: 'กรุณาเลือกสินค้า' })
  @IsUUID('4', { message: 'รหัสสินค้าต้องอยู่ในรูปแบบ UUID v4' })
  variant_id: string;

  @IsNotEmpty({ message: 'กรุณากรอกจำนวน' })
  @IsInt({ message: 'จำนวนต้องเป็นตัวเลขเท่านั้น' })
  @IsPositive({ message: 'จำนวนต้องเป็นตัวเลขที่มากกว่า 0' })
  quantity: number;
}

import { IsNotEmpty, IsPositive } from 'class-validator';

export class AddToCartDTO {
  @IsPositive()
  user_id: number; // can use jwtGuard and @Role()

  @IsNotEmpty({ message: 'กรุณาเลือกสินค้า' })
  @IsPositive({ message: 'รหัสสินค้าต้องเป็นตัวเลขที่มากกว่า 0' })
  variant_id: number;

  @IsNotEmpty({ message: 'กรุณากรอกจำนวน' })
  @IsPositive({ message: 'จำนวนต้องเป็นตัวเลขที่มากกว่า 0' })
  quantity: number;
}

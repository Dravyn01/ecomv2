import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddToWishlistDto {
  @IsNotEmpty({ message: 'กรุณาเลือกสินค้า' })
  @IsUUID('4', { message: 'รหัสสินค้าต้องอยู่ในรูปแบบ UUID v4' })
  product_id: string;
}

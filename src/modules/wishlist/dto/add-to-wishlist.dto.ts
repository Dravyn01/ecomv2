import { IsInt } from 'class-validator';

export class AddToWishlistDto {
  @IsInt({message:'กรุณาเลือกสินค้าที่ต้องการเพิ่มลงรายการโปรด'})
@IsPosative({ message: 'รหัสสินค้าต้องเป็นจำนวนเต็มและมากกว่า 0' })
  product_id: number;
}

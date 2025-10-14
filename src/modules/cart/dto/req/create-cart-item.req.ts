import { IsInt, Min } from 'class-validator';

export class CreateCartItemReq {
  @IsInt({ message: '' })
  @Min(1)
  user_id: number;

  @IsInt({ message: '' })
  @Min(1)
  variant_id: number;

  @IsInt({ message: 'จำนวนต้องเป็นตัวเลขเท่าานั้น' })
  @Min(1, { message: 'จำนวนสินค้าต้องไม่น้อยกว่า  0' })
  quantity: number;
}

import { IsInt, IsNotEmpty, IsPositive, IsUUID } from 'class-validator';

export class AddQuantityDTO {
  @IsNotEmpty({ message: 'กรุณาเลือกสินค้าที่ต้องการเพิ่มจำนวน' })
  @IsUUID('4', { message: 'รูปแบบหมายเลขสินค้าไม่ถูกต้อง' })
  variant_id: string;

  @IsNotEmpty({ message: 'กรุณากรอกจำนวนที่ต้องการเพิ่ม' })
  @IsInt({ message: 'จำนวนต้องเป็นตัวเลขเท่านั้น' })
  @IsPositive({ message: 'จำนวนต้องเป็นตัวเลขที่มากกว่า 0' })
  quantity: number;
}

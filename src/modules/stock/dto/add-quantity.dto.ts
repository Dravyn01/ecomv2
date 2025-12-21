import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class AddQuantityDTO {
  @IsNotEmpty({ message: 'กรุณาเลือกสินค้าที่ต้องการเพิ่มจำนวน' })
  @IsInt({ message: 'หมายเลขรายการสินค้าต้องเป็นตัวเลข' })
  @IsPositive({ message: 'หมายเลขรายการสินค้าต้องเป็นตัวเลขที่มากว่า 0' })
  variant_id: number;

  @IsNotEmpty({ message: 'กรุณากรอกจำนวนที่ต้องการเพิ่ม' })
  @IsInt({ message: 'จำนวนต้องเป็นตัวเลขเท่านั้น' })
  @IsPositive({ message: 'จำนวนต้องเป็นตัวเลขที่มากกว่า 0' })
  quantity: number;
}

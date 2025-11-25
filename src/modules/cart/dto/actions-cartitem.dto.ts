import { IsIn, IsNotEmpty, IsPositive } from 'class-validator';

export class ActionsCartItemDTO {
  @IsNotEmpty({ message: '' })
  @IsPositive({ message: '' })
  user_id: number;

  @IsNotEmpty({ message: 'กรุณาเลือกสินค้าที่ต้องการแก้ไข' })
  @IsPositive({ message: 'รหัสสินค้าต้องเป็นตัวเลขที่มากกว่า 0' })
  variant_id: number;

  @IsNotEmpty({ message: 'กรุณาระบุ action' })
  @IsIn(['DECREASE', 'REMOVE'], { message: 'action type สามารถเป็นได้แค่ DECREASE หรือ REMOVE' })
  action: 'DECREASE' | 'REMOVE';
}

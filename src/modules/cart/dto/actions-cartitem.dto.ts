import { IsIn, IsNotEmpty, IsUUID } from 'class-validator';

export class ActionsCartItemDTO {
  @IsNotEmpty({ message: '' })
  user_id: string;

  @IsNotEmpty({ message: 'กรุณาเลือกสินค้าที่ต้องการแก้ไข' })
  @IsUUID('4', { message: 'รหัสสินค้าต้องอยู่ในรูปแบบ UUID v4' })
  variant_id: string;

  @IsNotEmpty({ message: 'กรุณาระบุ action' })
  @IsIn(['DECREASE', 'REMOVE'], {
    message: 'action type สามารถเป็นได้แค่ DECREASE หรือ REMOVE',
  })
  action: 'DECREASE' | 'REMOVE';
}

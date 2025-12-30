import {
  IsNotEmpty,
  IsPositive,
  IsEnum,
  IsOptional,
  Length,
  IsString,
  IsInt,
  IsUUID,
} from 'class-validator';
import { StockChangeType } from '../enums/stock-change.enum';

export class CreateMovementDTO {
  @IsNotEmpty({ message: 'กรุณาเลือกตัวเลือกสินค้า' })
  @IsUUID('4', { message: 'รูปแบบหมายเลขสินค้าไม่ถูกต้อง' })
  variant_id: string;

  @IsNotEmpty({ message: 'กรุณากรอกจำนวน' })
  @IsInt({ message: 'จำนวนต้องเป็นจำนวนเต็ม' })
  @IsPositive({ message: 'จำนวนต้องมากกว่า 0' })
  quantity: number;

  @IsNotEmpty({ message: 'กรุณาเลือกประเภทการเปลี่ยนแปลง (change_type)' })
  @IsEnum(StockChangeType, {
    message: `change_type ต้องเป็นหนึ่งในค่า ${StockChangeType}`,
  })
  change_type: StockChangeType;

  @IsOptional()
  @Length(1, 255, { message: 'โน้ตต้องมีความยาวระหว่าง 1 ถึง 255 ตัวอักษร' })
  @IsString({ message: 'โน้ตต้องเป็นข้อความ (string)' })
  note?: string;

  @IsOptional()
  @IsInt({ message: 'รหัส order ต้องเป็นตัวเลขจำนวนเต็ม' })
  @IsPositive({ message: 'รหัส order ต้องเป็นจำนวนเต็มบวก' })
  order_id?: number;
}

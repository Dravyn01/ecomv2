import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { StockChangeType } from '../enums/stock-change.enum';

export class CreateMovementDTO {
  @IsNotEmpty({ message: 'ต้องระบุ variant_id' })
  @Min(1, { message: 'variant_id ต้องมีค่ามากกว่า 0' })
  @IsInt({ message: 'variant_id ต้องเป็นตัวเลขจำนวนเต็ม' })
  variant_id: number;

  @IsNotEmpty({ message: 'ต้องระบุ quantity' })
  @IsInt({ message: 'quantity ต้องเป็นตัวเลขจำนวนเต็ม' })
  quantity: number;

  @IsNotEmpty({ message: 'ต้องระบุ change_type' })
  @Min(1, { message: 'change_type ต้องเป็นค่าที่ถูกต้อง' })
  @IsEnum(StockChangeType, {
    message: `change_type ต้องเป็นหนึ่งในค่า: ${StockChangeType}`,
  })
  change_type: StockChangeType;

  @IsOptional()
  @Length(1, 255, { message: 'note ต้องมีความยาว 1 ถึง 255 ตัวอักษร' })
  @IsString({ message: 'note ต้องเป็น string' })
  note?: string;

  @IsOptional()
  @IsInt({ message: 'order_id ต้องเป็นตัวเลขจำนวนเต็ม' })
  @Min(1, { message: 'order_id ต้องมีค่ามากกว่า 0' })
  order_id?: number;
}
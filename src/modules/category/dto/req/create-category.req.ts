import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateCategoryReq {
  @IsString()
  @IsNotEmpty({ message: 'ชื่อหมวดหมู่ต้องไม่เป็นค่าว่าง' })
  @Length(1, 30, { message: 'ชื่อหมวดหมู่ต้องไม่เกิน 30 ตัว' })
  name: string;

  @IsOptional()
  @IsArray() // ดูว่าเป็ฯ array ไหม(ไม่ได้ดู elm)
  @Type(() => Number) // แปลงค่า "1" -> 1
  @IsInt({ each: true, message: 'หมายเลขหมวดหมู่ต้องเป็นตัวเลขเท่านั้น' }) // each: true ดู elm ทุกตัวว่าเป็น int ไหม
  category_ids?: number[];
}

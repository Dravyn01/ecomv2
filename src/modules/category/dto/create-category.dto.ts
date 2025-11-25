import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsPositive,
} from 'class-validator';

export class CreateCategoryDTO {
  @IsString({ message: '' })
  @IsNotEmpty({ message: 'ชื่อหมวดหมู่ต้องไม่เป็นค่าว่าง' })
  @Length(1, 30, { message: 'ชื่อหมวดหมู่ต้องไม่เกิน 30 ตัว' })
  name: string;

  @IsOptional()
  @IsArray({ message: '' }) // ดูว่าเป็ฯ array ไหม(ไม่ได้ดู elm)
  @IsInt({ each: true, message: 'หมายเลขหมวดหมู่ต้องเป็นตัวเลขเท่านั้น' }) // each: true ดู elm ทุกตัวว่าเป็น int ไหม
  @IsPositive({ message: '' })
  category_ids?: number[];
}

import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateColorReq {
  @IsString({ message: 'ชื่อสีต้องเป็นข้อความเท่านั้น' })
  @IsOptional()
  name?: string;

  @Matches(/^#([0-9A-Fa-f]{6})$/, {
    message: 'รหัสสีต้องอยู่ในรูปแบบ Hex เช่น #FFFFFF หรือ #000000',
  })
  @IsOptional()
  hex_code?: string;
}

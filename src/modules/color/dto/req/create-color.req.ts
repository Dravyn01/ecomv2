import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateColorReq {
  @IsString({ message: 'ชื่อสีต้องเป็นข้อความเท่านั้น' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อสี' })
  name: string;

  @Matches(/^#([0-9A-Fa-f]{6})$/, {
    message: 'รหัสสีต้องอยู่ในรูปแบบ Hex เช่น #FFFFFF',
  })
  hex_code: string;
}

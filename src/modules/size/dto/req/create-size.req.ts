import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateSizeReq {
  @IsString({ message: 'ชื่อไซส์ต้องเป็นตัวอักษรเท่านั้น' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อไซส์' })
  @Length(1, 20, { message: 'ชื่อไซส์ต้องมีความยาวระหว่าง 1 ถึง 20 ตัวอักษร' })
  name: string;

  @IsString({ message: 'คำอธิบายต้องเป็นตัวอักษรเท่านั้น' })
  @IsNotEmpty({ message: 'กรุณากรอกคำอธิบาย' })
  @Length(1, 100, {
    message: 'คำอธิบายต้องมีความยาวระหว่าง 1 ถึง 100 ตัวอักษร',
  })
  description: string;
}

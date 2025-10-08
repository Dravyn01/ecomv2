import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateSizeReq {
  @IsOptional()
  @IsString({ message: 'ชื่อไซส์ต้องเป็นตัวอักษรเท่านั้น' })
  @Length(1, 20, { message: 'ชื่อไซส์ต้องมีความยาวระหว่าง 1 ถึง 20 ตัวอักษร' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'คำอธิบายต้องเป็นตัวอักษรเท่านั้น' })
  @Length(1, 100, {
    message: 'คำอธิบายต้องมีความยาวระหว่าง 1 ถึง 100 ตัวอักษร',
  })
  description?: string;
}

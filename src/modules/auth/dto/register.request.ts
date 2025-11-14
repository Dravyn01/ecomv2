import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterRequest {
  @IsNotEmpty({ message: 'ชื่อผู้ใช้ต้องไม่เป็นค่าว่าง' })
  @IsString()
  @MaxLength(30, { message: 'ชื่อผู้ใช้ต้องไม่เกิน 30 ตัวอักษร' })
  username: string;

  @IsNotEmpty({ message: 'อีเมลต้องไม่เป็นค่าว่าง' })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'รหัสผ่านต้องยาวกว่าหรือเท่ากับ 6 ตัวอักษร' })
  password: string;
}

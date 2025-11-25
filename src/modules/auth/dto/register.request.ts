import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class RegisterRequest {
  @IsNotEmpty({ message: 'ชื่อผู้ใช้ต้องไม่เป็นค่าว่าง' })
  @IsString({ message: '' })
  @Length(1, 30, { message: 'ชื่อผู้ใช้ต้องไม่เกิน 30 ตัวอักษร' })
  username: string;

  @IsNotEmpty({ message: 'อีเมลต้องไม่เป็นค่าว่าง' })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email: string;

  @IsString({ message: '' })
  @MinLength(6, { message: 'รหัสผ่านต้องยาวกว่าหรือเท่ากับ 6 ตัวอักษร' })
  password: string;
}

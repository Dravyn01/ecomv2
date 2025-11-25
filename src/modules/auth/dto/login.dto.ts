import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginRequest {
  @IsNotEmpty({ message: 'อีเมลต้องไม่เป็นค่าว่าง' })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'รหัสผ่านต้องยาวกว่าหรือเท่ากับ 6 ตัวอักษร' })
  password: string;
}

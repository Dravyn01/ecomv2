import { IsEmail, IsNotEmpty, Length, MinLength } from 'class-validator';
import { Role } from 'src/modules/user/entities/user.entity';

export class RegisterDTO {
  @IsNotEmpty({ message: 'ชื่อผู้ใช้ต้องไม่เป็นค่าว่าง' })
  @Length(1, 30, { message: 'ชื่อผู้ใช้ต้องไม่เกิน 30 ตัวอักษร' })
  username: string;

  @IsNotEmpty({ message: 'อีเมลต้องไม่เป็นค่าว่าง' })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email: string;

  @IsNotEmpty({ message: 'รหัสผ่านต้องไม่เป็นค่าว่าง' })
  @MinLength(6, { message: 'รหัสผ่านต้องยาวกว่าหรือเท่ากับ 6 ตัวอักษร' })
  password: string;

  @IsNotEmpty()
  role: Role;
}

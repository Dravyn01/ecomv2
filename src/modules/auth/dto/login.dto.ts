import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { AUTH_DTO_MESSAGE } from 'src/common/enums/dto/auth.enum';

export class LoginRequest {
  @IsNotEmpty({ message: AUTH_DTO_MESSAGE.EMAIL_IS_NOT_EMPTY })
  @IsEmail({}, { message: AUTH_DTO_MESSAGE.EMAIL_INVALID_FORMAT })
  email: string;

  @IsNotEmpty({ message: AUTH_DTO_MESSAGE.PASSWORD_IS_NOT_EMPTY })
  @MinLength(6, {
    message: AUTH_DTO_MESSAGE.PASSWORD_MIN_LENGTH,
  })
  password: string;
}

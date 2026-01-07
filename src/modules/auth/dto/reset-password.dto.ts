import { IsNotEmpty, MinLength } from 'class-validator';
import { AUTH_DTO_MESSAGE } from 'src/common/enums/dto/auth.enum';

export class ResetPasswordDTO {
  @IsNotEmpty({ message: AUTH_DTO_MESSAGE.PASSWORD_IS_NOT_EMPTY })
  @MinLength(6, {
    message: AUTH_DTO_MESSAGE.PASSWORD_MIN_LENGTH,
  })
  old_password: string;

  @IsNotEmpty({ message: AUTH_DTO_MESSAGE.NEW_PASSWORD_IS_NOT_EMPTY })
  @MinLength(6, {
    message: AUTH_DTO_MESSAGE.NEW_PASSWORD_MIN_LENGTH,
  })
  new_password: string;
}

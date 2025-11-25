import { IsNotEmpty, IsPositive } from 'class-validator';

export class AddToCartDTO {
  @IsPositive()
  user_id: number; // can use jwtGuard and @Role()

  @IsNotEmpty({ message: '' })
  @IsPositive({ message: '' })
  variant_id: number;

  @IsNotEmpty({ message: '' })
  @IsPositive({ message: '' })
  quantity: number;
}

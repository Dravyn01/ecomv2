import { IsIn, IsNotEmpty, IsPositive } from 'class-validator';

export class ActionsCartItemDTO {
  @IsNotEmpty({ message: '' })
  @IsPositive({ message: '' })
  user_id: number;

  @IsNotEmpty({ message: '' })
  @IsPositive({ message: '' })
  variant_id: number;

  @IsNotEmpty({ message: '' })
  @IsIn(['DECREASE', 'REMOVE'], { message: '' })
  action: 'DECREASE' | 'REMOVE';
}

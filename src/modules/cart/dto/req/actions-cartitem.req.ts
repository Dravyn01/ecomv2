import { IsIn, IsInt, IsNotEmpty } from 'class-validator';

// TODO: add message

export class ActionsCartItemReq {
  @IsNotEmpty({ message: '' })
  @IsInt({ message: '' })
  user_id: number;

  @IsNotEmpty({ message: '' })
  @IsInt({ message: '' })
  variant_id: number;

  @IsNotEmpty({ message: '' })
  @IsIn(['DECREASE', 'REMOVE'], { message: '' })
  action: 'DECREASE' | 'REMOVE';
}

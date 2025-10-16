import { IsIn, IsInt, IsNotEmpty } from 'class-validator';

export class DeleteCartItemRequest {
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsNotEmpty()
  @IsInt()
  variant_id: number;

  @IsNotEmpty()
  @IsIn(['DECREASE', 'REMOVE'])
  action: 'DECREASE' | 'REMOVE';
}

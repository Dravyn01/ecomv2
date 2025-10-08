import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class FindAllQuery {
  @IsOptional()
  query?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'page ต้องมีค่ามากกว่า 0' })
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'limit ต้องมีค่ามากกว่า 0' })
  limit: number = 10;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC' = 'ASC';
}

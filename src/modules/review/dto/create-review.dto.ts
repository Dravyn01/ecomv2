import { IsInt, IsNotEmpty, IsString, Length, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty({ message: '' })
  @IsInt({ message: '' })
  user_id: number;

  @IsNotEmpty({ message: '' })
  @IsInt({ message: '' })
  variant_id: number;

  @IsNotEmpty({ message: '' })
  @IsInt({ message: '' })
  @Min(1, { message: '' })
  @Max(5, { message: '' })
  rating: number;

  @IsNotEmpty({ message: '' })
  @Length(1, 255)
  @IsString()
  comment: string;
}

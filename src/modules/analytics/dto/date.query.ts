import { IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { DATE_DTO_MESSAGE, DATE_FORMAT } from 'src/common/enums/dto/date.enum';

export class DateQueryDTO {
  @IsNotEmpty({ message: DATE_DTO_MESSAGE.DATE_IS_NOT_EMPTY })
  @Matches(DATE_FORMAT, {
    message: DATE_DTO_MESSAGE.INVALID_DATE_FORMAT,
  })
  from: string;

  @IsOptional()
  @Matches(DATE_FORMAT, {
    message: DATE_DTO_MESSAGE.INVALID_DATE_FORMAT,
  })
  to?: string;
}


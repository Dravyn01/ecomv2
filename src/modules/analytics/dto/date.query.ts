import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Matches,
} from 'class-validator';

export class DateQueryDTO {
  @IsNotEmpty({ message: 'กรุณาระบุวันที่เริ่มต้น (from)' })
  @IsString({ message: 'วันที่เริ่มต้น (from) ต้องเป็นข้อความ (string)' }) @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'รูปแบบวันที่เริ่มต้น (from) ต้องเป็น YYYY-MM-DD',
  })
  from: string;

  @IsOptional()
  @IsString({ message: 'วันที่สิ้นสุด (to) ต้องเป็นข้อความ (string)' }) @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'รูปแบบวันที่สิ้นสุด (to) ต้องเป็น YYYY-MM-DD',
  })
  to?: string;
}
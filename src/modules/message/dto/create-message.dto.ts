import { Type } from 'class-transformer';
import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreateImageDTO } from 'src/modules/image/dto/create-image.dto';

export class CreateMessageDTO {
  @IsNotEmpty({ message: 'หมายเลขห้องสนทนาต้องไม่เป็นค่าว่าง' })
  @IsUUID()
  conversation_id: string;

  /* อาจต้องเป็น IsOptional บางเคสผู้ใช้อาจส่งแค่รูป */
  @IsNotEmpty({ message: 'ข้อความต้องไม่เป็นค่าว่าง' })
  text: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateImageDTO)
  images?: CreateImageDTO[];
}

import { IsInt, IsNotEmpty } from 'class-validator';
import { CreateMessageDTO } from './create-message.dto';

export class CreateReplyDTO extends CreateMessageDTO {
  @IsNotEmpty({ message: 'กรุณาเลือกข้อความที่จะแก้ไข' })
  @IsInt()
  message_id: number;
}

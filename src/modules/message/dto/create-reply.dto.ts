import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateMessageDTO } from './create-message.dto';

export class CreateReplyDTO extends CreateMessageDTO {
  @IsNotEmpty({ message: 'กรุณาเลือกข้อความที่จะแก้ไข' })
  @IsUUID('4', { message: 'รูปแบบของหมายเลขข้อความไม่ถูกต้อง' })
  message_id: string;
}

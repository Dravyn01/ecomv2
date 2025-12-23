import { IsInt, IsNotEmpty, IsUUID } from 'class-validator';
import { CreateMessageDTO } from './create-message.dto';

export class CreateReplyDTO extends CreateMessageDTO {
  @IsNotEmpty()
  @IsInt({ message: '' })
  message_id: number;
}

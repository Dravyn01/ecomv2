import { IsNotEmpty, IsUUID } from 'class-validator';
import { DeleteMessageDTO } from './delete-message.dto';

export class DeleteImageDTO extends DeleteMessageDTO {
  @IsNotEmpty({ message: '' })
  @IsUUID('4', { message: '' })
  image_id: string;
}

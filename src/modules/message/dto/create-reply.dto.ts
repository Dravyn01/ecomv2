import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateMessageDTO } from './create-message.dto';
import { MESSAGE_DTO_MESSAGE } from 'src/common/enums/dto/message.enum';
import { APP_CONFIG } from 'src/common/enums/common/common.enum';

export class CreateReplyDTO extends CreateMessageDTO {
  @IsNotEmpty({ message: MESSAGE_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(APP_CONFIG.UUID_VERSION, {
    message: MESSAGE_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  message_id: string;
}

import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateMessageDTO } from './create-message.dto';
import { MESSAGE_DTO_MESSAGE } from 'src/common/enums/dto/message.enum';
import { CONFIG_ENUM } from 'src/common/enums/common/common.enum';

export class CreateReplyDTO extends CreateMessageDTO {
  @IsNotEmpty({ message: MESSAGE_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(CONFIG_ENUM.UUID_VERSION, {
    message: MESSAGE_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  message_id: string;
}

import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { CONFIG_ENUM } from 'src/common/enums/common/common.enum';
import { CONVERSATION_DTO_MESSAGE } from 'src/common/enums/dto/conversation.enum';
import { MESSAGE_DTO_MESSAGE } from 'src/common/enums/dto/message.enum';

export class LoadMessagesDTO {
  @IsNotEmpty({ message: CONVERSATION_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(CONFIG_ENUM.UUID_VERSION, {
    message: CONVERSATION_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  conversation_id: string;

  @IsOptional()
  @IsUUID(CONFIG_ENUM.UUID_VERSION, {
    message: MESSAGE_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  before_message_id?: string;
}

import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';
import { CONFIG_ENUM } from 'src/common/enums/common/common.enum';
import { CONVERSATION_DTO_MESSAGE } from 'src/common/enums/dto/conversation.enum';
import { MESSAGE_DTO_MESSAGE } from 'src/common/enums/dto/message.enum';

export class ReadMessageDTO {
  @IsNotEmpty({ message: MESSAGE_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsArray({ message: MESSAGE_DTO_MESSAGE.INVALID_MESSAGE_IDS_MUST_BE_ARRAY })
  @IsUUID(CONFIG_ENUM.UUID_VERSION, {
    each: true,
    message: MESSAGE_DTO_MESSAGE.INVALID_MESSAGE_IDS_MUST_BE_ARRAY,
  })
  message_ids: string[];

  @IsNotEmpty({ message: CONVERSATION_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(CONFIG_ENUM.UUID_VERSION, {
    message: CONVERSATION_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  conversation_id: string;
}

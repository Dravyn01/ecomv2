import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';
import { COMMON_DTO } from 'src/common/enums/dto/common.enum';
import { CONVERSATION_DTO_MESSAGE } from 'src/common/enums/dto/conversation.enum';
import { MESSAGE_DTO_MESSAGE } from 'src/common/enums/dto/message.enum';

export class ReadMessageDTO {
  @IsNotEmpty({ message: MESSAGE_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsArray({ message: MESSAGE_DTO_MESSAGE.INVALID_MESSAGE_IDS_MUST_BE_ARRAY })
  @IsUUID(COMMON_DTO.UUID_VERSION, {
    each: true,
    message: MESSAGE_DTO_MESSAGE.INVALID_MESSAGE_IDS_MUST_BE_ARRAY,
  })
  message_ids: string[];

  @IsNotEmpty({ message: CONVERSATION_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(COMMON_DTO.UUID_VERSION, {
    message: CONVERSATION_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  conversation_id: string;
}

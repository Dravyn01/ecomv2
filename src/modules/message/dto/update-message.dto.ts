import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { CONFIG_ENUM } from 'src/common/enums/common/common.enum';
import { CONVERSATION_DTO_MESSAGE } from 'src/common/enums/dto/conversation.enum';
import { MESSAGE_DTO_MESSAGE } from 'src/common/enums/dto/message.enum';

export class UpdateMessageDTO {
  @IsNotEmpty({ message: MESSAGE_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(CONFIG_ENUM.UUID_VERSION, {
    message: MESSAGE_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  message_id: string;

  @IsNotEmpty({ message: CONVERSATION_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(CONFIG_ENUM.UUID_VERSION, {
    message: CONVERSATION_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  conversation_id: string;

  @IsOptional()
  @IsString({ message: MESSAGE_DTO_MESSAGE.TEXT_MUST_BE_STRING })
  text?: string;
}

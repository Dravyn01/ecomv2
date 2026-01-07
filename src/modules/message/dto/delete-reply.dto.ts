import { IsNotEmpty, IsUUID } from 'class-validator';
import { COMMON_DTO } from 'src/common/enums/dto/common.enum';
import { CONVERSATION_DTO_MESSAGE } from 'src/common/enums/dto/conversation.enum';
import { REPLY_DTO_MESSAGE } from 'src/common/enums/dto/reply.enum';

export class DeleteReplyDTO {
  @IsNotEmpty({ message: REPLY_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(COMMON_DTO.UUID_VERSION, {
    message: REPLY_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  reply_id: string;

  @IsNotEmpty({ message: CONVERSATION_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(COMMON_DTO.UUID_VERSION, {
    message: CONVERSATION_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  conversation_id: string;
}

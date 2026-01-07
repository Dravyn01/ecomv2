import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateMessageDTO } from './create-message.dto';
import { COMMON_DTO } from 'src/common/enums/dto/common.enum';
import { MESSAGE_DTO_MESSAGE } from 'src/common/enums/dto/message.enum';

export class CreateReplyDTO extends CreateMessageDTO {
  @IsNotEmpty({ message: MESSAGE_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(COMMON_DTO.UUID_VERSION, {
    message: MESSAGE_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  message_id: string;
}

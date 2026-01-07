import { Type } from 'class-transformer';
import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsString,
} from 'class-validator';
import { CONFIG_ENUM } from 'src/common/enums/common/common.enum';
import { CONVERSATION_DTO_MESSAGE } from 'src/common/enums/dto/conversation.enum';
import { MESSAGE_DTO_MESSAGE } from 'src/common/enums/dto/message.enum';
import { CreateImageDTO } from 'src/modules/image/dto/create-image.dto';

export class CreateMessageDTO {
  @IsNotEmpty({ message: CONVERSATION_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(CONFIG_ENUM.UUID_VERSION, {
    message: CONVERSATION_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  conversation_id: string;

  @IsOptional()
  @IsString({ message: MESSAGE_DTO_MESSAGE.TEXT_MUST_BE_STRING })
  text: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateImageDTO)
  images?: CreateImageDTO[];
}

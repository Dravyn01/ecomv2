import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { IMAGE_DTO_MESSAGE } from 'src/common/enums/dto/image.enum';
import { CreateImageDTO } from './create-image.dto';
import { CONFIG_ENUM } from 'src/common/enums/common/common.enum';

export class UpdateImageDTO extends PartialType(CreateImageDTO) {
  @IsNotEmpty({ message: IMAGE_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(CONFIG_ENUM.UUID_VERSION, {
    message: IMAGE_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  image_id: string;
}

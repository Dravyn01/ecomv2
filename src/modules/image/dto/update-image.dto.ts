import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateImageDTO } from './create-image.dto';
import { IMAGE_DTO_MESSAGE } from 'src/common/enums/dto/image.enum';
import { COMMON_DTO } from 'src/common/enums/dto/common.enum';

export class UpdateImageDTO extends PartialType(CreateImageDTO) {
  @IsNotEmpty({ message: IMAGE_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(COMMON_DTO.UUID_VERSION, {
    message: IMAGE_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  image_id: string;
}

import { IsOptional, IsUUID } from 'class-validator';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';
import { COMMON_DTO } from 'src/common/enums/dto/common.enum';

export class FindAllStockDTO extends FindAllQuery {
  @IsOptional()
  @IsUUID(COMMON_DTO.UUID_VERSION, { message: '' })
  product_id: string;
}

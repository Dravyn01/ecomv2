import { IsOptional, IsUUID } from 'class-validator';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';
import { CONFIG_ENUM } from 'src/common/enums/common/common.enum';

export class FindAllStockDTO extends FindAllQuery {
  @IsOptional()
  @IsUUID(CONFIG_ENUM.UUID_VERSION, { message: '' })
  product_id: string;
}

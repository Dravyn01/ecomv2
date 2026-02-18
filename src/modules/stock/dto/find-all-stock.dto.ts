import { IsOptional, IsUUID } from 'class-validator';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';
import { APP_CONFIG } from 'src/common/enums/common/common.enum';

export class FindAllStockDTO extends FindAllQuery {
  @IsOptional()
  @IsUUID(APP_CONFIG.UUID_VERSION, { message: '' })
  product_id: string;
}

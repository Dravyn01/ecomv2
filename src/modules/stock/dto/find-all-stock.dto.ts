import { IsOptional, IsUUID } from 'class-validator';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';

export class FindAllStockDTO extends FindAllQuery {
  @IsOptional()
  @IsUUID('4', { message: '' })
  product_id: string;
}

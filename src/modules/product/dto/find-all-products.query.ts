import { IsOptional } from 'class-validator';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';

export class FindAllProductsQuery extends FindAllQuery {
  @IsOptional()
  search?: string;
}

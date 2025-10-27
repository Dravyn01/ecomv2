import { IsOptional } from 'class-validator';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';

export class FindAllProducts extends FindAllQuery {
  @IsOptional()
  search?: string;
}

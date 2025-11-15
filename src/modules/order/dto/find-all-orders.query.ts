import { FindAllQuery } from 'src/common/dto/req/find-all.query';
import { OrderStatus } from '../enums/order-status.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class FindAllOrdersQuery extends FindAllQuery {
  @IsOptional()
  @IsEnum(OrderStatus, { message: `สถานะต้องเป็นหนี่งใน: ${OrderStatus}` })
  status?: OrderStatus = OrderStatus.PENDING;
}
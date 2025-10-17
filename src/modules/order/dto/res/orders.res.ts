import { Order } from 'src/config/entities.config';

export class OrdersResponse {
  orders: Order[];
  count: number;
}

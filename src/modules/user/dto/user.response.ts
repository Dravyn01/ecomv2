import { Cart } from 'src/modules/cart/entities/cart.entity';
import { Order } from 'src/modules/order/entities/order.entity';

export class UserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  orders: Order[];
  cart: Cart;
  created_at: Date;
  updated_at: Date;
}

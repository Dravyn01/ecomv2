import { Cart, Order } from 'src/config/entities.config';

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

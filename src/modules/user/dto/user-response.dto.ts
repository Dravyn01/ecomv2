import { Cart } from 'src/modules/cart/entities/cart.entity';
import { Order } from 'src/modules/order/entities/order.entity';
import { BaseUserDTO } from './base-user.dto';

export class UserResponseDTO extends BaseUserDTO {
  orders: Order[];
  cart: Cart;
}

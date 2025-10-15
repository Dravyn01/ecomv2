import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart, CartItem } from 'src/config/entities.config';
import { FindAllCartsDto } from './dto/req/find-all-carts.query';
import { CartsRes } from './dto/res/carts.res';
import { Repository } from 'typeorm';
import { CartResponse } from './dto/res/cart.res';
import { ProductVariantService } from '../product-variant/product-variant.service';
import { UserService } from '../user/user.service';
import { AddToCartReq } from './dto/req/add-to-cart.req';
import { async } from 'rxjs';

@Injectable()
export class CartService {
  private readonly className = this.constructor.name;
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    private readonly userService: UserService,
    private readonly variantService: ProductVariantService,
  ) {}

  async findAll(req: FindAllCartsDto): Promise<CartsRes> {
    const { page, limit, order } = req;

    const [carts, count] = await this.cartRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { added_at: order },
    });

    this.logger.log(`found carts "${count}"`);

    return { carts, count } as CartsRes;
  }

  async findOneCart(cart_id: number): Promise<CartResponse> {
    const existing = await this.cartRepo.findOneBy({ id: cart_id });
    if (!existing) throw new NotFoundException('not found cart');
    return existing;
  }

  async findOneCartItem(cart_item_id: number): Promise<CartItem> {
    const existing = await this.cartItemRepo.findOneBy({ id: cart_item_id });
    if (!existing) throw new NotFoundException('not found cartitem');
    return existing;
  }

  // async addToCart(req: CreateCartItemReq): Promise<void> {
  //   const user = await this.userService.findOne(req.user_id);
  //   const variant = await this.variantService.findOne(req.variant_id);
  //
  //   let cart = user.cart;
  //   if (!cart) {
  //     cart = await this.cartRepo.save({ user });
  //   }
  //
  //   const existing_variant = await this.cartItemRepo.findOneBy({
  //     variant: { id: req.variant_id },
  //   });
  //
  //   if (existing_variant) {
  //     await this.cartItemRepo.update({
  //       cart: { id: existing_variant }
  //     });
  //   }
  //
  //   await this.cartItemRepo.insert({
  //     cart,
  //     quantity: req.quantity,
  //     variant,
  //   });
  // }

  async addToCart(req: AddToCartReq): Promise<void> {
    const user = await this.userService.findOne(req.user_id);
    const variant = await this.variantService.findOne(req.variant_id);

    let cart = user.cart;
    if (!cart) {
      cart = await this.cartRepo.save({
        user: { id: user.id },
      });
    }

    await this.cartItemRepo.save({
      cart: { id: cart.id },
      variant: { id: variant.id },
      quantity: req.quantity,
    });
  }

  async delete(cart_id: number): Promise<void> {
    await this.cartRepo.delete(cart_id);
  }
}

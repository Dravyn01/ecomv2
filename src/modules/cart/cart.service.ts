import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart, CartItem } from 'src/config/entities.config';
import { FindAllCartsDto } from './dto/req/find-all-carts.query';
import { CartsResponse } from './dto/res/carts.res';
import { Repository, DataSource } from 'typeorm';
import { ProductVariantService } from '../product-variant/product-variant.service';
import { UserService } from '../user/user.service';
import { AddToCartReq } from './dto/req/add-to-cart.req';
import { ActionsCartItemReq } from './dto/req/actions-cartitem.req';
import { StockService } from '../stock/stock.service';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  // TODO: add comment

  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    private readonly userService: UserService,
    private readonly variantService: ProductVariantService,
    private readonly stockService: StockService,
    private readonly datasource: DataSource,
  ) {}

  // DEBUG MODE
  async findAll(body: FindAllCartsDto): Promise<CartsResponse> {
    const { page, limit, order } = body;

    const [carts, count] = await this.cartRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: order },
      relations: {
        items: {
          variant: true,
        },
        user: true,
      },
    });

    this.logger.log(`found carts "${count}"`);

    return { data: carts, count } as CartsResponse;
  }

  async findOneByUser(user_id: number): Promise<Cart> {
    const existing = await this.cartRepo.findOne({
      where: { user: { id: user_id } },
      relations: ['items'],
    });
    if (!existing) throw new NotFoundException('ไม่พบตะกร้า');
    return existing;
  }

  /*
   *
   *
   * TODO: add flow
   *
   *
   * */
  async addToCart(body: AddToCartReq): Promise<CartItem> {
    const user = await this.userService.findOne(body.user_id);
    const variant = await this.variantService.findOne(body.variant_id);

    const cart_item = await this.datasource.transaction(async (tx) => {
      // check stock
      await this.stockService.IsOutOfStock(body.variant_id, body.quantity);

      let cart = await tx.findOne(Cart, { where: { user: { id: user.id } } });

      //
      if (!cart) {
        cart = tx.create(Cart, { user: { id: user.id } });
        await tx.save(cart);
      }

      const existing_item = await tx.findOne(CartItem, {
        where: { cart: { id: cart.id }, variant: { id: variant.id } },
      });

      if (existing_item) {
        //
        existing_item.quantity += body.quantity;
        return await tx.save(CartItem, existing_item);
      } else {
        //
        return await tx.save(CartItem, {
          cart: { id: cart.id },
          variant: { id: variant.id },
          quantity: body.quantity,
        });
      }
    });

    return cart_item;
  }

  async delete(cart_id: number): Promise<void> {
    const cart = await this.cartRepo.findOneBy({ id: cart_id });
    if (!cart) throw new NotFoundException('ไม่พบตะกร้า');
    await this.cartRepo.delete(cart.id);
  }

  /*
   *
   *
   *
   *  TODO: add flow logic
   *
   *
   *
   * */
  async itemAction(body: ActionsCartItemReq): Promise<CartItem> {
    const cart = await this.findOneByUser(body.user_id);
    const cart_item = await this.cartItemRepo.findOneBy({
      cart: { id: cart.id },
      variant: { id: body.variant_id },
    });

    if (!cart_item) throw new NotFoundException('ไม่พบสินค้าที่ต้องการลบ');

    //
    if (
      (cart_item && body.action.toUpperCase() === 'REMOVE') ||
      (cart_item &&
        body.action.toUpperCase() === 'DECREASE' &&
        cart_item.quantity <= 1)
    ) {
      await this.cartItemRepo.delete(cart_item.id);
      return cart_item;
    }

    //
    cart_item.quantity -= 1;

    return await this.cartItemRepo.save(cart_item);
  }
}

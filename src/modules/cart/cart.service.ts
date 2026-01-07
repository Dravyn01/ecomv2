import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart, CartItem } from 'src/modules/cart/entities/cart.entity';
import { Repository, DataSource } from 'typeorm';
import { ProductVariantService } from '../product-variant/product-variant.service';
import { UserService } from '../user/user.service';
import { StockService } from '../stock/stock.service';
import { FindAllCartsDto } from './dto/find-all-carts.query';
import { DatasResponse } from 'src/common/dto/res/datas.response';
import { AddToCartDTO } from './dto/add-to-cart.dto';
import { ActionCartItemDTO } from './dto/action-cartitem.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    private readonly userService: UserService,
    private readonly variantService: ProductVariantService,
    private readonly stockService: StockService,
    private readonly datasource: DataSource,
  ) {}

  // # DEBUG METHOD
  async findAll(body: FindAllCartsDto): Promise<DatasResponse<Cart[]>> {
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

    this.logger.log(`[cart.service::findAll] found carts "${count}"`);

    return { data: carts, count } as DatasResponse<Cart[]>;
  }

  async findOneByUser(user_id: string): Promise<Cart> {
    const existing = await this.cartRepo.findOne({
      where: { user: { id: user_id } },
      relations: ['items'],
    });
    if (!existing) throw new NotFoundException('ไม่พบตะกร้า');
    return existing;
  }

  async addToCart(body: AddToCartDTO): Promise<CartItem> {
    this.logger.log(
      `[cart.service::addToCart] START addToCart user=${body.user_id}, variant=${body.variant_id}, qty=${body.quantity}`,
    );

    const user = await this.userService.findOne(body.user_id);
    const variant = await this.variantService.findOne(body.variant_id);

    const cart_item = await this.datasource.transaction(async (tx) => {
      await this.stockService.isOutOfStock(body.variant_id, body.quantity);

      let cart = await tx.findOne(Cart, { where: { user: { id: user.id } } });

      if (!cart) {
        this.logger.log(
          `[cart.service::addToCart] Creating new cart for user=${user.id}`,
        );
        cart = tx.create(Cart, { user: { id: user.id } });
        await tx.save(cart);
        this.logger.log(
          `[cart.service::addToCart] Cart created cartId=${cart.id}`,
        );
      }

      const existing_item = await tx.findOne(CartItem, {
        where: { cart: { id: cart.id }, variant: { id: variant.id } },
        relations: ['variant'],
      });

      if (existing_item) {
        this.logger.log(
          `[cart.service::addToCart] Existing cart_item found itemId=${existing_item.id}, oldQty=${existing_item.quantity}`,
        );

        // เพิ่มจำนวน
        existing_item.quantity += body.quantity;

        await this.stockService.isOutOfStock(
          existing_item.variant.id,
          existing_item.quantity,
        );

        this.logger.log(
          `[cart.service::addToCart] Updated quantity itemId=${existing_item.id}, newQty=${existing_item.quantity}`,
        );

        return await tx.save(CartItem, existing_item);
      } else {
        this.logger.log(
          `[cart.service::addToCart] No existing cart_item. Creating new item variant=${variant.id}, qty=${body.quantity}`,
        );

        const newItem = await tx.save(CartItem, {
          cart: { id: cart.id },
          variant: { id: variant.id },
          quantity: body.quantity,
        });

        this.logger.log(
          `[cart.service::addToCart] New cart_item created itemId=${newItem.id}, qty=${newItem.quantity}`,
        );

        return newItem;
      }
    });

    this.logger.log(
      `[cart.service::addToCart] END addToCart itemId=${cart_item.id}, finalQty=${cart_item.quantity}`,
    );

    return cart_item;
  }

  async delete(cart_id: number): Promise<void> {
    const cart = await this.cartRepo.findOneBy({ id: cart_id });
    if (!cart) throw new NotFoundException('ไม่พบตะกร้า');
    this.logger.log(`[cart.service::delete] deleted cart=${cart_id}`);
    await this.cartRepo.delete(cart.id);
  }

  async itemAction(
    body: ActionCartItemDTO,
  ): Promise<{ cart_item: CartItem; status: 'updated' | 'deleted' }> {
    this.logger.log(
      `[cart.service::itemAction] START user=${body.user_id}, variant=${body.variant_id}, action=${body.action}`,
    );

    // หา cart ของ user
    const cart = await this.findOneByUser(body.user_id);
    this.logger.log(`[cart.service::itemAction] Loaded cart cartId=${cart.id}`);

    // หา cart_item
    const cart_item = await this.cartItemRepo.findOneBy({
      cart: { id: cart.id },
      variant: { id: body.variant_id },
    });

    this.logger.log(
      `[cart.service::itemAction] CartItem lookup: ${cart_item ? `found itemId=${cart_item.id}, qty=${cart_item.quantity}` : 'not found'}`,
    );

    if (!cart_item) {
      this.logger.warn(
        `[cart.service::itemAction] CartItem not found for deletion`,
      );
      throw new NotFoundException('ไม่พบสินค้าที่ต้องการลบ');
    }

    // ตรวจสอบ action
    const act = body.action.toUpperCase();
    this.logger.log(`[cart.service::itemAction] Action resolved: ${act}`);

    const shouldDelete =
      act === 'REMOVE' || (act === 'DECREASE' && cart_item.quantity <= 1);

    if (shouldDelete) {
      this.logger.log(
        `[cart.service::itemAction] Deleting cart_item itemId=${cart_item.id}, qty=${cart_item.quantity}`,
      );

      await this.cartItemRepo.delete(cart_item.id);

      this.logger.log(
        `[cart.service::itemAction] Cart_item deleted itemId=${cart_item.id}`,
      );

      return { cart_item, status: 'deleted' };
    }

    // DECREASE quantity > 1
    cart_item.quantity -= 1;
    this.logger.log(
      `[cart.service::itemAction] Decreasing quantity itemId=${cart_item.id}, newQty=${cart_item.quantity}`,
    );

    // return status 'updated'
    const updated_cart_item = await this.cartItemRepo.save(cart_item);

    this.logger.log(
      `[cart.service::itemAction] Cart_item updated itemId=${updated_cart_item.id}, qty=${updated_cart_item.quantity}`,
    );

    this.logger.log(`[cart.service::itemAction] END`);
    return { cart_item: updated_cart_item, status: 'updated' };
  }
}

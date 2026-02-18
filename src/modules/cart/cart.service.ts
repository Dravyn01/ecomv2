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
import { PromotionService } from '../promotion/promotion.service';

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
    private readonly promotionService: PromotionService,
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
    const user = await this.userService.findOne(body.user_id);
    const variant = await this.variantService.findOne(body.variant_id);

    const cart_item = await this.datasource.transaction(async (tx) => {
      await this.stockService.isOutOfStock(body.variant_id, body.quantity);

      let cart = await tx.findOne(Cart, { where: { user: { id: user.id } } });

      if (!cart) {
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
        // เพิ่มจำนวน
        existing_item.quantity += body.quantity;

        await this.stockService.isOutOfStock(
          existing_item.variant.id,
          existing_item.quantity,
        );

        return await tx.save(CartItem, existing_item);
      } else {
        const newItem = await tx.save(CartItem, {
          cart: { id: cart.id },
          variant: { id: variant.id },
          quantity: body.quantity,
        });

        return newItem;
      }
    });

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
    // หา cart ของ user
    const cart = await this.findOneByUser(body.user_id);

    // หา cart_item
    const cart_item = await this.cartItemRepo.findOneBy({
      cart: { id: cart.id },
      variant: { id: body.variant_id },
    });

    if (!cart_item) {
      throw new NotFoundException('ไม่พบสินค้าที่ต้องการลบ');
    }

    // ตรวจสอบ action
    const act = body.action;

    const shouldDelete =
      act === 'REMOVE' || (act === 'DECREASE' && cart_item.quantity <= 1);

    if (shouldDelete) {
      await this.cartItemRepo.delete(cart_item.id);

      return { cart_item, status: 'deleted' };
    }

    // DECREASE quantity > 1
    cart_item.quantity -= 1;

    // return status 'updated'
    const updated_cart_item = await this.cartItemRepo.save(cart_item);
    return { cart_item: updated_cart_item, status: 'updated' };
  }

  async previewCartSummary(user_id: string, promoCode: string) {
    const items = await this.cartItemRepo.findBy({
      cart: { user: { id: user_id } },
    });
    if (!items || items.length === 0)
      throw new NotFoundException('ไม่พบตะกร้า');

    let promotionPreviewResult;

    if (promoCode) {
      promotionPreviewResult = await this.promotionService.previewPromotion(
        items,
        promoCode,
      );

      await this.cartRepo.update(
        { user: { id: user_id } },
        { code: promoCode },
      );
    }

    const total_price = items.reduce(
      (sum, item) => sum + item.variant.price * item.quantity,
      0,
    );

    return {
      total_price,
      ...(promotionPreviewResult && {
        discount_total: promotionPreviewResult.discount_total,
        final_total: promotionPreviewResult.final_total,
      }),
      // shipping_value: 45,
    };
  }
}

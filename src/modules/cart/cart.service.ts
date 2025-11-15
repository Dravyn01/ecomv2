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

    this.logger.log(`[cart.service::findAll] found carts "${count}"`);

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
 * --- Comment By GPT (ขก เขียนเอง) ---
 *
 * ฟังก์ชันนี้ทำหน้าที่เพิ่มสินค้าไปยัง cart ของ user
 * ตรวจสอบ stock และรวมรายการถ้ามีสินค้าอยู่แล้ว
 *
 * 1: หา user จาก body.user_id
 * 2: หา product variant จาก body.variant_id
 * 3: เปิด transaction เพื่อให้ทุกขั้นตอนเป็น atomic
 * 4: ตรวจสอบ stock ของสินค้าว่าพอหรือไม่ → throw ถ้า stock ไม่พอ
 * 5: โหลด cart ของ user ถ้าไม่มี → สร้าง cart ใหม่
 * 6: ตรวจสอบว่ามี cart_item เดิมใน cart หรือไม่
 *      6.1: ถ้ามี → บวกจำนวนเข้าไปใน cart_item เดิม และ save
 *      6.2: ถ้าไม่มี → สร้าง cart_item ใหม่ และ save
 * 7: return cart_item
 */
async addToCart(body: AddToCartReq): Promise<CartItem> {
  this.logger.log(`[cart.service::addToCart] START addToCart user=${body.user_id}, variant=${body.variant_id}, qty=${body.quantity}`);

  // 1: หา user
  const user = await this.userService.findOne(body.user_id);
  this.logger.log(`[cart.service::addToCart] Loaded user id=${user.id}`);

  // 2: หา variant
  const variant = await this.variantService.findOne(body.variant_id);
  this.logger.log(`[cart.service::addToCart] Loaded variant id=${variant.id}`);

  // 3: เปิด transaction
  const cart_item = await this.datasource.transaction(async (tx) => {

    this.logger.log('[cart.service::addToCart] Transaction started');

    // 4: ตรวจสอบ stock
    await this.stockService.IsOutOfStock(body.variant_id, body.quantity);
    this.logger.log(`[cart.service::addToCart] Stock validated variant=${body.variant_id}, qty=${body.quantity}`);

    // 5: โหลด cart ของ user
    let cart = await tx.findOne(Cart, { where: { user: { id: user.id } } });
    this.logger.log(
      `[cart.service::addToCart] Cart loaded: ${cart ? `cartId=${cart.id}` : 'none'}`
    );

    // สร้าง cart ใหม่ถ้าไม่มี
    if (!cart) {
      this.logger.log(`[cart.service::addToCart] Creating new cart for user=${user.id}`);
      cart = tx.create(Cart, { user: { id: user.id } });
      await tx.save(cart);
      this.logger.log(`[cart.service::addToCart] Cart created cartId=${cart.id}`);
    }

    // 6: ตรวจสอบ cart_item เดิม
    const existing_item = await tx.findOne(CartItem, {
      where: { cart: { id: cart.id }, variant: { id: variant.id } },
    });

    if (existing_item) {
      this.logger.log(
        `[cart.service::addToCart] Existing cart_item found itemId=${existing_item.id}, oldQty=${existing_item.quantity}`
      );

      // เพิ่มจำนวน
      existing_item.quantity += body.quantity;

      this.logger.log(
        `[cart.service::addToCart] Updated quantity itemId=${existing_item.id}, newQty=${existing_item.quantity}`
      );

      return await tx.save(CartItem, existing_item);
    } else {
      this.logger.log(
        `[cart.service::addToCart] No existing cart_item. Creating new item variant=${variant.id}, qty=${body.quantity}`
      );

      const newItem = await tx.save(CartItem, {
        cart: { id: cart.id },
        variant: { id: variant.id },
        quantity: body.quantity,
      });

      this.logger.log(
        `[cart.service::addToCart] New cart_item created itemId=${newItem.id}, qty=${newItem.quantity}`
      );

      return newItem;
    }
  });

  this.logger.log(`[cart.service::addToCart] END addToCart itemId=${cart_item.id}, finalQty=${cart_item.quantity}`);

  return cart_item;
}

  async delete(cart_id: number): Promise<void> {
    const cart = await this.cartRepo.findOneBy({ id: cart_id });
    if (!cart) throw new NotFoundException('ไม่พบตะกร้า');
this.logger.log(`[cart.service::delete] deleted cart=${cart_id}`);
    await this.cartRepo.delete(cart.id);
  }

  /*
 * --- Comment By GPT (ขก เขียนเอง) ---
 *
 * ฟังก์ชันนี้จัดการ action ของ cart_item ได้แก่:
 *  - REMOVE → ลบสินค้าออกจาก cart
 *  - DECREASE → ลดจำนวนสินค้า 1 ชิ้น
 *
 * 1: หา cart ของ user
 * 2: หา cart_item ที่ตรงกับ variant_id
 *      - ถ้าไม่เจอ → throw NotFoundException
 * 3: เช็ค action:
 *      3.1: ถ้า action === 'REMOVE' → ลบ cart_item และ return status 'deleted'
 *      3.2: ถ้า action === 'DECREASE' และ quantity <= 1 → ลบ cart_item และ return status 'deleted'
 * 4: ถ้า DECREASE แล้ว quantity > 1 → ลด quantity ลง 1 และ save
 * 5: return cart_item พร้อม status 'updated' หรือ 'deleted'
 */
async itemAction(
  body: ActionsCartItemReq,
): Promise<{ cart_item: CartItem; status: 'updated' | 'deleted' }> {

  this.logger.log(
    `[cart.service::itemAction] START user=${body.user_id}, variant=${body.variant_id}, action=${body.action}`
  );

  // 1: หา cart ของ user
  const cart = await this.findOneByUser(body.user_id);
  this.logger.log(`[cart.service::itemAction] Loaded cart cartId=${cart.id}`);

  // 2: หา cart_item
  const cart_item = await this.cartItemRepo.findOneBy({
    cart: { id: cart.id },
    variant: { id: body.variant_id },
  });

  this.logger.log(
    `[cart.service::itemAction] CartItem lookup: ${cart_item ? `found itemId=${cart_item.id}, qty=${cart_item.quantity}` : 'not found'}`
  );

  if (!cart_item) {
    this.logger.warn(`[cart.service::itemAction] CartItem not found for deletion`);
    throw new NotFoundException('ไม่พบสินค้าที่ต้องการลบ');
  }

  // 3: ตรวจสอบ action
  const act = body.action.toUpperCase();
  this.logger.log(`[cart.service::itemAction] Action resolved: ${act}`);

  const shouldDelete =
    act === 'REMOVE' ||
    (act === 'DECREASE' && cart_item.quantity <= 1);

  if (shouldDelete) {
    this.logger.log(
      `[cart.service::itemAction] Deleting cart_item itemId=${cart_item.id}, qty=${cart_item.quantity}`
    );

    await this.cartItemRepo.delete(cart_item.id);

    this.logger.log(
      `[cart.service::itemAction] Cart_item deleted itemId=${cart_item.id}`
    );

    return { cart_item, status: 'deleted' };
  }

  // 4: DECREASE quantity > 1
  cart_item.quantity -= 1;
  this.logger.log(
    `[cart.service::itemAction] Decreasing quantity itemId=${cart_item.id}, newQty=${cart_item.quantity}`
  );

  // 5: return status 'updated'
  const updated_cart_item = await this.cartItemRepo.save(cart_item);

  this.logger.log(
    `[cart.service::itemAction] Cart_item updated itemId=${updated_cart_item.id}, qty=${updated_cart_item.quantity}`
  );

  this.logger.log(`[cart.service::itemAction] END`);
  return { cart_item: updated_cart_item, status: 'updated' };
}
}

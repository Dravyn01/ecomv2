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
  // 1: หา user
  const user = await this.userService.findOne(body.user_id);

  // 2: หา variant
  const variant = await this.variantService.findOne(body.variant_id);

  // 3: เปิด transaction
  const cart_item = await this.datasource.transaction(async (tx) => {

    // 4: ตรวจสอบ stock
    await this.stockService.IsOutOfStock(body.variant_id, body.quantity);

    // 5: โหลด cart ของ user
    let cart = await tx.findOne(Cart, { where: { user: { id: user.id } } });

    // สร้าง cart ใหม่ถ้าไม่มี
    if (!cart) {
      cart = tx.create(Cart, { user: { id: user.id } });
      await tx.save(cart);
    }

    // 6: ตรวจสอบ cart_item เดิม
    const existing_item = await tx.findOne(CartItem, {
      where: { cart: { id: cart.id }, variant: { id: variant.id } },
    });

    if (existing_item) {
      // 6.1: ถ้ามี → เพิ่มจำนวน
      existing_item.quantity += body.quantity;
      return await tx.save(CartItem, existing_item);
    } else {
      // 6.2: ถ้าไม่มี → สร้าง cart_item ใหม่
      return await tx.save(CartItem, {
        cart: { id: cart.id },
        variant: { id: variant.id },
        quantity: body.quantity,
      });
    }
  });

  // 7: return cart_item
  return cart_item;
}

  async delete(cart_id: number): Promise<void> {
    const cart = await this.cartRepo.findOneBy({ id: cart_id });
    if (!cart) throw new NotFoundException('ไม่พบตะกร้า');
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
async itemAction(body: ActionsCartItemReq): Promise<{ cart_item: CartItem; status: 'updated' | 'deleted' }> {
  // 1: หา cart ของ user
  const cart = await this.findOneByUser(body.user_id);

  // 2: หา cart_item
  const cart_item = await this.cartItemRepo.findOneBy({
    cart: { id: cart.id },
    variant: { id: body.variant_id },
  });

  if (!cart_item) throw new NotFoundException('ไม่พบสินค้าที่ต้องการลบ');

  // 3: ตรวจสอบ action
  if (
    (cart_item && body.action.toUpperCase() === 'REMOVE') ||
    (cart_item &&
      body.action.toUpperCase() === 'DECREASE' &&
      cart_item.quantity <= 1)
  ) {
    await this.cartItemRepo.delete(cart_item.id);
    // 3.1-3.2: return status 'deleted'
    return { cart_item, status: 'deleted' };
  }

  // 4: DECREASE quantity > 1
  cart_item.quantity -= 1;

  // 5: return status 'updated'
  const updated_cart_item = await this.cartItemRepo.save(cart_item);
  return { cart_item: updated_cart_item, status: 'updated' };
}
}

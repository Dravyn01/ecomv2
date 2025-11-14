import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderItem } from './entities/order.entity';
import { Repository, DataSource, Not, In } from 'typeorm';
import { OrdersResponse } from './dto/res/orders.res';
import { FindAllOrdersQuery } from './dto/req/find-all-orders.query';
import { UserService } from '../user/user.service';
import { Cart, Product, UserPurchaseHistory } from 'src/config/entities.config';
import { StockService } from '../stock/stock.service';
import { CreateMovement } from '../stock/dto/create-movement.stock';
import { StockChangeType } from '../stock/enums/stock-change.enum';
import { OrderStatus } from './enums/order-status.enum';
import { CreateOrderReq } from './dto/req/create-order.req';
import { ProductService } from '../product/product.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly userService: UserService,
    private readonly stockService: StockService,
    private readonly datasource: DataSource,
    private readonly productService: ProductService,
  ) {}

  async findAll(): Promise<Order[]> {
    return await this.orderRepo.find({ relations: ['user', 'items'] });
  }

  async findByUser(
    user_id: number,
    query: FindAllOrdersQuery,
  ): Promise<OrdersResponse> {
    const { page, limit, order, status } = query;

    const [orders, count] = await this.orderRepo.findAndCount({
      where: { user: { id: user_id }, status },
      skip: (page - 1) * limit,
      take: limit,
      order: { order_date: order },
      relations: ['items'],
    });

    return { orders, count };
  }

  async findOne(order_id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: order_id },
      relations: ['items.variant.product', 'user'],
    });
    if (!order) throw new NotFoundException('ไม่พบ order');
    return order;
  }

  /*
 * --- Comment By GPT (ขก เขียนเอง แต่ก็ต้องเขียนเองอยู่ดี เพราะแม่งเอ๋อ) ---
 *
 * ฟังก์ชันนี้ทำหน้าที่สร้าง order จาก cart ของ user
 * และลด stock ของสินค้าทุกตัวใน cart
 *
 * 1: หา user จาก user_id
 * 2: เปิด transaction เพื่อให้ทุกขั้นตอนเป็น atomic
 * 3: โหลด cart ของ user พร้อม items + variant + user
 * 4: ถ้า cart ไม่มีสินค้า → throw NotFoundException
 * 5: คำนวณ total_price ของทุก item
 * 6: สร้าง order ใหม่ พร้อม copy ข้อมูลจาก cart.items
 * 7: ลบ cart หลังสร้าง order
 * 8: วนลูป items → create stock movement (OUT)
 * 9: return order
 */
  async checkout(user_id: number): Promise<Order> {
  // 1: หา user
  const user = await this.userService.findOne(user_id);

  // 2: เปิด transaction
  const order = await this.datasource.transaction(async (tx) => {

    // 3: โหลด cart ของ user พร้อม relations
    const cart = await tx.findOne(Cart, {
      where: { user: { id: user.id } },
      relations: ['items.variant', 'user'],
    });

    // 4: ตรวจสอบ cart ว่างหรือไม่
    if (!cart || cart.items.length === 0)
      throw new NotFoundException('ไม่พบสินค้าสำหรับชำระเงิน');

    // 5: คำนวณ total_price ของ cart
    const total_price = cart.items.reduce(
      (acc, item) => acc + item.variant.price * item.quantity,
      0,
    );

    // 6: สร้าง order ใหม่ พร้อมรายการสินค้า
    const order = await tx.save(Order, {
      user: { id: user_id },
      total_price: total_price,
      items: cart.items.map((item) => ({
        unit_price: item.variant.price,
        total_price: item.variant.price * item.quantity,
        quantity: item.quantity,
        variant: { id: item.variant.id },
      })),
    });

    // 7: ลบ cart หลังสร้าง order
    await tx.delete(Cart, cart.id);

    // 8: วนลูป items → ลด stock ของสินค้าแต่ละชิ้น
    for (const item of cart.items) {
      const dto: CreateMovement = {
        quantity: item.quantity,
        change_type: StockChangeType.OUT,
        variant_id: item.variant.id,
        order_id: order.id,
      };

      await this.stockService.createMovement(dto, tx);
    }

    // 9: return order หลังสร้างเสร็จ
    return order;
  });

  return order;
}

  /*
 * --- Comment By GPT (ขก เขียนเอง) ---
 *
 * ฟังก์ชันนี้ทำหน้าที่ยกเลิก order
 * คืน stock ของสินค้าทุกตัว และอัปเดต return_count + return_rate
 *
 * 1: หา order ที่ยังไม่ถูก cancel/return
 * 2: ถ้าไม่พบ → throw NotFoundException
 * 3: เปลี่ยน status เป็น CANCELLED
 * 4: วนลูป items → create stock movement (RETURN)
 * 5: คำนวณ return_rate ใหม่
 * 6: อัปเดต product.return_count + return_rate
 */
  async cancel(order_id: number): Promise<Order> {
    const saved_order = this.datasource.transaction(async (tx) => {
      // 1: หา order ตาม id ที่ส่งมา และ สถานะต้องไม่เป็น cancel || return
      const order = await tx.findOne(Order, {
        where: {
          id: order_id,
          status: Not(In([OrderStatus.CANCELLED, OrderStatus.RETURNED, OrderStatus.PAID])),
        },
        relations: ['items.variant.product'],
      });

      // 2: ถ้าไม่เจอ order ที่ตรงเงื่อนไข
      if (!order || order.status === OrderStatus.PAID) {
        throw new NotFoundException('ไม่สามารถยกเลิก order ได้ เนื่องจากไม่ตรงตามเงื่อนไข');
      }

      // 3: เปลี่ยนสถานะ order เป็น Cancel และเชฟ
      order.status = OrderStatus.CANCELLED;
      await tx.save(order);

      // วนลูป itemsเพื่อเตรียมเสร้าง movement
      for (const item of order.items) {
        const product = item.variant.product;

        const dto: CreateMovement = {
          order_id,
          change_type: StockChangeType.RETURN,
          quantity: item.quantity,
          variant_id: item.variant.id,
        };

        // สร้าง movement (RETURN) และส่ง  tx เพื่อให้อยู่ใน transaction เดียวกัน
        await this.stockService.createMovement(dto, tx);

        // 5: คำนวน rate การคืนสินค้าใหม่
        const newReturnRate =
          product.return_count / (product.sales_count + product.return_count);

        console.log('new return rate', newReturnRate);

        // 6: update return_count & return_rate
        const saved_product = await tx.save(Product, {
          id: product.id,
          return_count: product.return_count + 1,
          return_rate: newReturnRate,
        });

        console.log('saved_product', saved_product);

        console.log(
          'end of create movement & update return_count & return_rate',
        );
      }

      return order;
    });

    return saved_order;
  }

  async delete(order_id: number): Promise<Order> {
    const order = await this.findOne(order_id);
    // await this.userService.findOne(order.user.id);
    await this.orderRepo.remove(order);
    return order;
  }

  /*
   * --- Comment By GPT (ขก เขียนเอง แต่ก็ต้องมาแก้ภาษาใหม่อยู่ดี เพราะแม่งเอ๋อ) ---
   *
   * ฟังก์ชันนี้ทำหน้าที่เปลี่ยนสถานะออเดอร์เป็น "PAID"
   * และประมวลผลผลลัพธ์ทางธุรกิจทั้งหมดที่เกิดขึ้นหลังการชำระเงินสำเร็จ:
   *
   * 1: ตรวจสอบสถานะออเดอร์ก่อน:
   *        - ถ้าออเดอร์อยู่ในสถานะ PAID หรือ CANCELLED → ห้ามทำซ้ำ
   *
   * 2: เปิด transaction เพื่อให้ทุกกระบวนการเป็น atomic:
   *        - ถ้าขั้นตอนใดล้มเหลว ระบบจะ rollback อัตโนมัติ
   *
   * 3: ตั้งสถานะออเดอร์เป็น PAID
   *
   * 4: วนลูปสินค้าแต่ละรายการใน order.items:
   *
   *        4.1: โหลด product ที่อยู่ใน order นี้เพื่อเตรียมสร้างประวัติการซื้อสินค้า
   *
   *        4.2: สร้าง UserPurchaseHistory (ประวัติการซื้อ):
   *              - default คือการบันทึกว่า user เคยซื้อสินค้านี้ (is_repeat=false)
   *              - แต่ต้องเช็กก่อนว่า user เคยซื้อสินค้านี้แบบ PAID มาก่อนหรือไม่
   *
   *        4.3: ถ้าเคยซื้อแล้ว (repeat customer):
   *              - บันทึกประวัติแบบ is_repeat=true
   *              - เพิ่มค่า repeat_count ของสินค้า
   *
   *        4.4: บันทึกประวัติการซื้อครั้งนี้ (first-time history)
   *
   *        4.5: เพิ่มยอดขาย (sales_count) ของสินค้า
   *
   *        4.6: อัปเดตค่า repeat_purchase_rate:
   *              - สูตร: repeat_count / sales_count
   *              - เก็บทศนิยม 2 ตำแหน่ง
   *
   * 5: บันทึกสถานะออเดอร์ใหม่ลงฐานข้อมูล
   *
   * ผลลัพธ์ทั้งหมดนี้ช่วยให้ระบบเก็บสถิติการซื้อซ้ำ, อัตราซื้อซ้ำ,
   * ประวัติการซื้อของผู้ใช้ และยอดขายของสินค้าอย่างถูกต้องครบถ้วน
   */
  async paid(order_id: number): Promise<Order> {
    const order = await this.findOne(order_id);

    // 1: ป้องกันการทำรายการซ้ำหรือทำในสถานะที่ไม่ถูกต้อง
    if (
      order.status === OrderStatus.PAID ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new ConflictException(
        `ไม่สามารถทำรายการได้ เนื่องจากออเดอร์ "${order_id}" อยู่ในสถานะ ${order.status} แล้ว`,
      );
    }

    // 2: ใช้ transaction เพื่อความปลอดภัยของข้อมูล
    return await this.datasource.transaction(async (tx) => {
      // 3: เปลี่ยนสถานะ order เป็น PAID
      order.status = OrderStatus.PAID;

      // 4: วนลูป items
      for (const item of order.items) {
        const user_id = order.user.id;

        // 4.1: หาสินค้า
        const product = await this.productService.findOne(
          item.variant.product.id,
        );

        // 4.2: เตรียมประวัติการซื้อครั้งนี้
        const saved_user_purchase_history = {
          is_repeat: false,
          product: { id: product.id },
          user: { id: user_id },
          order: { id: order.id },
          total_purchases: +1,
          last_purchased_at: new Date(),
        };

        // 4.3: เช็คว่าผู้ใช้เคยซื้อสินค้านี้ และ order PAID มาก่อนหรือไม่
        const hasPurchased = await tx.findOne(OrderItem, {
          where: {
            order: {
              user: { id: user_id },
              status: OrderStatus.PAID,
            },
            variant: {
              product: { id: product.id },
            },
          },
        });

        console.log(hasPurchased);

        if (hasPurchased) {
          // บันทึกประวัติแบบ repeat purchase
          await tx.insert(UserPurchaseHistory, {
            ...saved_user_purchase_history,
            is_repeat: true, // แก้ไขค่าจาก false เป็น true
          });

          // เพิ่มจำนวน repeat ของสินค้า
          await tx.increment(Product, { id: product.id }, 'repeat_count', 1);
        }

        // 4.4: บันทึกประวัติการซื้อครั้งนี้ (first-time history)
        await tx.insert(UserPurchaseHistory, saved_user_purchase_history);

        // 4.5: อัปเดตยอดขายสินค้า
        await tx.increment(
          Product,
          { id: product.id },
          'sales_count',
          item.quantity,
        );

        // 4.6: อัปเดตอัตราซื้อซ้ำ
        if (product.sales_count > 0) {
          const newRate = (product.repeat_count / product.sales_count).toFixed(2);
          console.log('newRate', newRate);
          await tx.increment(
            Product,
            { id: product.id },
            'repeat_purchase_rate',
            Number(newRate),
          );
        }
      }

      // 5: เซฟออเดอร์พร้อมสถานะใหม่
      return await tx.save(Order, order);
    });
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderItem } from './entities/order.entity';
import { Repository, DataSource, Not, In } from 'typeorm';
import { UserService } from '../user/user.service';
import { Cart, UserPurchaseHistory } from 'src/config/entities.config';
import { StockService } from '../stock/stock.service';
import { StockChangeType } from '../stock/enums/stock-change.enum';
import { OrderStatus } from './enums/order-status.enum';
import { ProductService } from '../product/product.service';
import { FindAllOrdersQuery } from './dto/find-all-orders.query';
import { DatasResponse } from 'src/common/dto/res/datas.response';
import { CreateMovementDTO } from '../stock/dto/create-movement.dto';

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
  ): Promise<DatasResponse<Order[]>> {
    const { page, limit, order, status } = query;

    const [orders, count] = await this.orderRepo.findAndCount({
      where: { user: { id: user_id }, status },
      skip: (page - 1) * limit,
      take: limit,
      order: { order_date: order },
      relations: ['items'],
    });

    return { data: orders, count };
  }

  async findOne(order_id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: order_id },
      relations: ['items.variant.product', 'user'],
    });
    if (!order) throw new NotFoundException('ไม่พบ order');
    return order;
  }

  async checkout(user_id: number): Promise<Order> {
    const user = await this.userService.findOne(user_id);

    const order = await this.datasource.transaction(async (tx) => {
      const cart = await tx.findOne(Cart, {
        where: { user: { id: user.id } },
        relations: ['items.variant', 'user'],
      });

      // เช็คว่า cart ว่างไหม
      if (!cart || cart.items.length === 0)
        throw new NotFoundException('ไม่พบสินค้าสำหรับชำระเงิน');

      // คำนวนราคารวม
      const total_price = cart.items.reduce(
        (acc, item) => acc + item.variant.price * item.quantity,
        0,
      );

      // สร้าง order ใหม่
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

      // clear cart หลังสร้าง order
      await tx.delete(Cart, cart.id);

      // ลด stock ของสินค้าแต่ละชิ้น
      for (const item of cart.items) {
        const dto: CreateMovementDTO = {
          quantity: item.quantity,
          change_type: StockChangeType.OUT,
          variant_id: item.variant.id,
          order_id: order.id,
        };

        // check quantity
        await this.stockService.notifyStock(item.variant.id, item.quantity);

        // create movement
        await this.stockService.createMovement(dto, tx);
      }

      return order;
    });

    return order;
  }

  async cancel(order_id: number): Promise<Order> {
    const saved_order = this.datasource.transaction(async (tx) => {
      // หา order ตาม id และ status ต้องไม่เป็น cancel or return
      const order = await tx.findOne(Order, {
        where: {
          id: order_id,
          status: Not(
            In([OrderStatus.CANCELLED, OrderStatus.RETURNED, OrderStatus.PAID]),
          ),
        },
        relations: ['items.variant.product'],
      });

      // ถ้าไม่เจอ order ที่ตรงเงื่อนไข
      if (!order || order.status === OrderStatus.PAID) {
        throw new NotFoundException('ไม่สามารถยกเลิก order ได้');
      }

      // update สถานะ order เป็น Cancel
      order.status = OrderStatus.CANCELLED;
      await tx.save(order);

      // ลูป order_items เพื่อเตรียมเสร้าง movement
      for (const item of order.items) {
        const dto: CreateMovementDTO = {
          order_id,
          change_type: StockChangeType.RETURN,
          quantity: item.quantity,
          variant_id: item.variant.id,
        };

        // สร้าง movement (RETURN) และส่ง tx เพื่อให้อยู่ใน transaction เดียวกัน
        await this.stockService.createMovement(dto, tx);
      }

      return order;
    });

    return saved_order;
  }

  async paid(order_id: number): Promise<Order> {
    const order = await this.findOne(order_id);

    // ป้องกันการทำรายการซ้ำหรือทำในสถานะที่ไม่ถูกต้อง
    if (
      order.status === OrderStatus.PAID ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new ConflictException(
        `ไม่สามารถทำรายการได้ เนื่องจากออเดอร์ "${order_id}" อยู่ในสถานะ ${order.status} แล้ว`,
      );
    }

    // ใช้ transaction เพื่อความปลอดภัยของข้อมูล
    return await this.datasource.transaction(async (tx) => {
      order.status = OrderStatus.PAID;

      for (const item of order.items) {
        const user_id = order.user.id;
        const product = await this.productService.findOne(
          item.variant.product.id,
        );

        // จำนวนการสั่งซื้อสินค้าแต่ละชิ้นก่อนหน้า
        const previousPurchasesCount = await tx.countBy(OrderItem, {
          order: {
            user: { id: user_id },
            status: OrderStatus.PAID,
          },
          variant: {
            product: { id: product.id },
          },
        });

        // หาประวิติการสั่งซื้อสินค้าของแต่ละ item
        const existsHistory = await tx.findOne(UserPurchaseHistory, {
          where: { user: { id: user_id }, product: { id: product.id } },
          relations: ['user', 'product'],
        });

        if (existsHistory) {
          // update
          existsHistory.total_purchases = previousPurchasesCount + 1;
          existsHistory.last_purchased_at = new Date();
          await tx.save(UserPurchaseHistory, existsHistory);
        } else {
          // create
          const newHistory = tx.create(UserPurchaseHistory, {
            user: { id: user_id },
            product: { id: product.id },
            order: { id: order.id },
            total_purchases: previousPurchasesCount + 1,
            last_purchased_at: new Date(),
          });
          await tx.save(UserPurchaseHistory, newHistory);
        }
      }

      return await tx.save(Order, order);
    });
  }

  async delete(order_id: number): Promise<Order> {
    const order = await this.findOne(order_id);
    await this.orderRepo.remove(order);
    return order;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPurchaseHistory } from './entities/user-purchase-history.entity';
import { In, Repository } from 'typeorm';
import { Order, OrderItem } from 'src/modules/order/entities/order.entity';
import { OrderStatus } from 'src/modules/order/enums/order-status.enum';
import { Between } from 'typeorm';
import { differenceInDays, endOfDay, startOfDay } from 'date-fns';
import { DateQueryDTO } from './dto/date.query';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UserPurchaseHistory)
    private readonly userPurchaseRepo: Repository<UserPurchaseHistory>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async getHistory() {
    return await this.userPurchaseRepo.find({
      relations: ['product', 'user', 'order'],
    });
  }

  async getSalesSummary(query: DateQueryDTO): Promise<{
    range: { from: string; to: string };
    sales_summary: number;
    average_per_month: number;
    total_order: number;
    charts: Record<string, string | number>[];
  }> {
    const { from, to } = query;
    const start = startOfDay(new Date(query.from));
    const end = to ? endOfDay(new Date(to)) : endOfDay(new Date(from));

    const items = await this.orderItemRepo.find({
      select: {
        order: {
          order_date: true,
        },
      },
      where: {
        order: {
          status: OrderStatus.PAID,
          order_date: Between(start, end),
        },
      },
      relations: { variant: true, order: true },
    });

    const total_order = await this.orderRepo.count({
      where: {
        status: OrderStatus.PAID,
        order_date: Between(start, end),
      },
    });

    const summary = items.reduce(
      (acc, { total_price }) => {
        acc.sales_summary += Number(total_price);
        return acc;
      },
      { sales_summary: 0, average_per_month: 0 },
    );

    const diffDays = differenceInDays(end, start) || 1;
    summary.average_per_month = Number(
      (summary.sales_summary / diffDays).toFixed(2),
    );

    return {
      range: {
        from: start.toISOString(),
        to: end.toISOString(),
      },
      sales_summary: summary.sales_summary,
      average_per_month: summary.average_per_month,
      total_order,
      charts: items.map((item) => ({
        date: item.order.order_date.toISOString().split('t')[0],
        sales: Number(item.total_price),
      })),
    };
  }

  async getPaidOrderVsCancelOrder(query: DateQueryDTO): Promise<{
    range: {
      from: string;
      to: string;
    };
    total_orders_today: number;
    completed_orders_today: number;
    canceled_orders_today: number;
    returned_orders_today: number;
    total_revenue_today: number;
    average_order: number;
  }> {
    const { from, to } = query;
    const start = startOfDay(new Date(from));
    const end = to ? endOfDay(new Date(to)) : endOfDay(new Date(from));
    const dateRange = { order_date: Between(start, end) };

    const orders_today = await this.orderRepo.find({
      select: {
        items: {
          total_price: true,
        },
      },
      where: {
        ...dateRange,
        status: In([
          OrderStatus.PAID,
          OrderStatus.CANCELLED,
          OrderStatus.RETURNED,
        ]),
      },
      relations: ['items'],
    });

    let total_revenue_today = 0;
    const count = {
      completed: 0,
      canceled: 0,
      returned: 0,
    };

    for (const order of orders_today) {
      switch (order.status) {
        case OrderStatus.PAID:
          count.completed++;
          break;
        case OrderStatus.CANCELLED:
          count.canceled++;
          break;
        case OrderStatus.RETURNED:
          count.returned++;
          break;
      }

      for (const item of order.items) {
        total_revenue_today += item.total_price;
      }
    }

    const total_orders_today = orders_today.length;
    const average_order =
      total_orders_today > 0 ? total_revenue_today / total_orders_today : 0;

    return {
      range: {
        from: start.toISOString(),
        to: end.toISOString(),
      },
      total_orders_today,
      completed_orders_today: count.completed,
      canceled_orders_today: count.canceled,
      returned_orders_today: count.returned,
      total_revenue_today: Number(total_revenue_today.toFixed(2)),
      average_order: Number(average_order.toFixed(2)),
    };
  }

  async getNewUser(query: DateQueryDTO) {
    const { from, to } = query;
    const start = startOfDay(from);
    const end = to ? endOfDay(to) : endOfDay(from);

    const orderCondtion = {
      select: {
        id: true,
        user: { id: true },
      },
      where: {
        status: OrderStatus.PAID,
        order_date: Between(start, end),
      },
      relations: ['user'],
    };

    const orders = await this.orderRepo.find({ ...orderCondtion });
    const userIds = [...new Set(orders.map((order) => order.user.id))];

    const firstPaidOrders = await this.orderRepo.find({
      ...orderCondtion,
      where: {
        ...orderCondtion.where,
        user: { id: In(userIds) },
      },
    });

    const firstOrderMap = new Map();
    for (const o of firstPaidOrders) {
      if (!firstOrderMap.has(o.user.id)) {
        firstOrderMap.set(o.user.id, o.id);
      }
    }

    let newUser = 0;
    let repeatUser = 0;

    for (const order of orders) {
      const firstId = firstOrderMap.get(order.user.id);

      if (firstId === order.id) newUser++;
      else repeatUser++;
    }

    return {
      range: {
        from: start,
        to: end,
      },
      new_user: newUser,
      repeat_user: repeatUser,
    };
  }

  aggregateByProduct<T, R>(
    items: T[],
    getProductId: (item: T) => number,
    reducer: (acc: R, item: T) => void, // เพิ่มค่าให้กับข้อมูลยังไง
    initial: () => R, // หน้าตาข้อมูลว่าง เช่น { repeat: 0, unique: 0 }
  ): Map<number, R> {
    /*
     * T ข้อมูลที่เป็น array
     * R ข้อมูลว่าง เช่น { repeat: 0, unique: 0 }
     * reducer {
     *  acc = ข้อมูลว่างที่ set ไว้ใน initial
     *  item = list ข้อมูลที่ถูก loop ไว้เป็นแถวๆ จาก items ที่ส่งเข้ามา
     * }
     * initial = สร้างข้อมูลเริ่มต้น สำหรับไว้เพิ่มค่า
     * */

    const map = new Map<number, R>();

    for (const item of items) {
      const productId = getProductId(item);

      if (!map.has(productId)) {
        map.set(productId, initial());
      }

      reducer(map.get(productId)!, item);
    }

    return map;
  }
}

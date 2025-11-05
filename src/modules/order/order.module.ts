import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderItem } from './entities/order.entity';
import { UserModule } from '../user/user.module';
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    UserModule,
    StockModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
// // DEBUG MODE
// async changeStatus(order_id: number, status: OrderStatus): Promise<Order> {
//   const order = await this.findOne(order_id);
//
//   return await this.datasource.transaction(async (tx) => {
//     // 1️⃣ เปลี่ยนสถานะ order
//     order.status = status;
//
//     // 2️⃣ ถ้า order จ่ายเงินแล้ว → mark item.is_repeat
//     if (status === OrderStatus.PAID) {
//       for (const item of order.items) {
//         const user_id = order.user.id;
//         const product = item.variant.product;
//
//         // 3️⃣ เช็คว่าผู้ใช้เคยซื้อสินค้านี้มาก่อนหรือไม่
//         const  = await this.orderItemRepo.exists({
//           where: {
//             order: {
//               user: { id: user_id },
//               status: OrderStatus.PAID,
//             },
//             variant: { product: { id: product.id } },
//           },
//         });
//
//         // 4️⃣ ถ้าเคยซื้อแล้ว → mark is_repeat = true และเพิ่ม repeat_count ใน product
//         if (hasPreviousPurchase) {
//           item.is_repeat = true;
//
//           await tx.increment(Product, { id: product.id }, 'repeat_count', 1);
//         }
//
//         // 5️⃣ อัปเดตยอดขายตามสถานะ
//         const updateFieldMap = {
//           [OrderStatus.PAID]: {
//             sales_count: () => `sales_count + ${item.quantity}`,
//           },
//           [OrderStatus.CANCELLED]: {
//             return_count: () => `return_count + ${item.quantity}`,
//           },
//         };
//
//         const fieldsToUpdate = updateFieldMap[status];
//
//         if (fieldsToUpdate) {
//           await tx
//             .createQueryBuilder()
//             .update(Product)
//             .set(fieldsToUpdate)
//             .where('id = :id', { id: product.id })
//             .execute();
//         }
//
//         // 6️⃣ บันทึกการเปลี่ยนแปลงใน order item
//         await tx.save(item);
//       }
//     }
//
//     // 7️⃣ บันทึก order หลังอัปเดตทุกอย่าง
//     const saved_order = await tx.save(Order, order);
//
//     return saved_order;
//   });
// }

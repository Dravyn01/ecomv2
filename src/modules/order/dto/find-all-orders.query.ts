import { FindAllQuery } from 'src/common/dto/req/find-all.query';
import { OrderStatus } from '../enums/order-status.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class FindAllOrdersQuery extends FindAllQuery {
  @IsOptional()
  @IsEnum(OrderStatus, { message: '' })
  status?: OrderStatus = OrderStatus.PENDING;
}

// PENDING = 'PENDING', // ผู้ใช้สร้างคำสั่งซื้อแล้ว แต่ยังไม่ได้จ่ายเงิน
// PAID = 'PAID', // จ่ายเงินแล้ว (อาจรอการตรวจสอบการชำระเงิน)
// PROCESSING = 'PROCESSING', // ร้านค้ากำลังเตรียมสินค้า
// SHIPPED = 'SHIPPED', // ร้านค้าส่งสินค้าแล้ว (มี tracking number)
// DELIVERED = 'DELIVERED', // ผู้ใช้ได้รับสินค้าแล้ว
// CANCELLED = 'CANCELLED', // ออเดอร์ถูกยกเลิก (อาจเพราะลูกค้าหรือระบบ)
// REFUNDED = 'REFUNDED', // มีการคืนเงิน (หลังจาก Cancel หรือ Return)
// RETURN_REQUESTED = 'RETURN_REQUESTED', // ลูกค้าส่งคำขอคืนสินค้า
// RETURNED = 'RETURNED', // คืนสินค้าเสร็จสิ้น

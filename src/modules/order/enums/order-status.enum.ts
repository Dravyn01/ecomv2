export enum OrderStatus {
  /* ผู้ใช้สร้างคำสั่งซื้อแล้ว แต่ยังไม่ได้จ่ายเงิน */
  PENDING = 'PENDING',

  /* จ่ายเงินแล้ว (อาจรอการตรวจสอบการชำระเงิน) */
  PAID = 'PAID',

  /* ร้านค้ากำลังเตรียมสินค้า */
  PROCESSING = 'PROCESSING',

  /* ร้านค้าส่งสินค้าแล้ว (มี tracking number) */
  // SHIPPED = 'SHIPPED',

  /* ผู้ใช้ได้รับสินค้าแล้ว */
  DELIVERED = 'DELIVERED',

  /* ออเดอร์ถูกยกเลิก (อาจเพราะลูกค้าหรือระบบ) */
  CANCELLED = 'CANCELLED',

  /* มีการคืนเงิน (หลังจาก Cancel หรือ Return) */
  REFUNDED = 'REFUNDED',

  /* คืนสินค้าเสร็จสิ้น */
  RETURNED = 'RETURNED',
}

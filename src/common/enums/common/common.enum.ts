export enum APP_CONFIG {
  UUID_VERSION = 4,

  MIN_PASSWORD = 6,
  SALT = 10,

  /* จะเพิ่มเป็นความยาวของชื่อสินค้าหรือขั้นต่ำของชื่อผู้ใช้ก็เพิ่มไป */
}

export enum COMMON_EXCEPTION {
  NOT_FOUND_PRODUCT = 'ไม่พบสินค้านี้',
  NOT_FOUND_USER = 'ไม่พบผู้ใช้นี้',
  NOT_FOUND_ORDER = 'ไม่พบออลเดอร์',
  NOT_FOUND_STOCK = 'ไม่พบสต็อก',
  NOT_FOUND_CART = 'ไม่พบตะกร้า',
  NOT_FOUND_IMAGE = 'ไม่พบรูปภาพ',
  NOT_FOUND_VARIANT = 'ไม่พบรายการสินค้านี้',

  INVALID_PASSWORD = 'รห้สผ่านไม่ถูกต้อง',
}

export enum PRODUCT_DTO_MESSAGE {
  // primary id
  ID_IS_NOT_EMPTY = 'หมายเลขสินค้าต้องไม่เป็นค่าว่าง',
  ID_MUST_BE_UUID = 'หมายเลขสินค้าต้องอยู่ในรูปแบบ uuid',

  // product name
  PRODUCT_NAME_IS_NOT_EMPTY = 'กรุณากรอกชื่อสินค้า',
  PRODUCT_NAME_MUST_BE_STRING = 'ชื่อสินค้าต้องเป็นข้อความเท่านั้น',
  PRODUCT_NAME_INVALID_LENGTH = 'ชื่อสินค้าต้องมีความยาวระหว่าง 1 ถึง 100 ตัวอักษร',

  // description
  DESCRIPTION_IS_NOT_EMPTY = 'กรุณากรอกคำอธิบายสินค้า',
  DESCRIPTION_MUST_BE_STRING = 'คำอธิบายสินค้าต้องเป็นข้อความเท่านั้น',
  DESCRIPTION_INVALID_LENGTH = 'คำอธิบายสินค้าต้องมีความยาวระหว่าง 1 ถึง 255 ตัวอักษร',

  // base price
  BASE_PRICE_IS_NOT_EMPTY = 'กรุณากรอกราคาพื้นฐานของสินค้า',
  BASE_PRICE_MUST_BE_NUMBER = 'ราคาพื้นฐานต้องเป็นตัวเลขเท่านั้น',
  BASE_PRICE_MIN = 'ราคาพื้นฐานต้องมากกว่า 0 บาท',

  // discount price
  DISCOUNT_PRICE_MUST_BE_NUMBER = 'ราคาหลังลดต้องเป็นตัวเลขเท่านั้น',
  DISCOUNT_PRICE_MIN = 'ราคาหลังลดต้องมากกว่า 0 บาท',

  // status
  INVALID_PRODUCT_STATUS = 'สถานะสินค้าไม่ถูกต้อง',
}

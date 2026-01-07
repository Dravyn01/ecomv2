export enum VARIANT_DTO_MESSAGE {
  // primary id
  ID_IS_NOT_EMPTY = 'กรุณาเลือกรายการสินค้า',
  ID_MUST_BE_UUID = 'หมายเลขรายการสินค้าต้องอยู่ในรูปแบบ uuid',

  // color
  COLOR_ID_IS_NOT_EMPTY = 'กรุณาเลือกสี',
  COLOR_ID_MUST_BE_INTEGER = 'หมายเลขสีต้องเป็นตัวเลขเท่านั้น',
  COLOR_ID_MUST_BE_POSITIVE = 'หมายเลขสีต้องเป็นตัวเลขที่มากกว่า 0',

  // size
  SIZE_ID_IS_NOT_EMPTY = 'กรุณาเลือกไซส์',
  SIZE_ID_MUST_BE_INTEGER = 'หมายเลขไซส์ต้องเป็นตัวเลขเท่านั้น',
  SIZE_ID_MUST_BE_POSITIVE = 'หมายเลขไซส์ต้องเป็นตัวเลขที่มากกว่า 0',

  // price
  PRICE_IS_NOT_EMPTY = 'กรุณากรอกราคารายการสินค้า',
  PRICE_MUST_BE_NUMBER = 'ราคารายการสินค้าต้องเป็นตัวเลข',
  PRICE_MIN = 'ราคารายการสินค้าต้องมากกว่า 1 บาท',

  // status
  INVALID_VARIANT_STATUS = 'สถานะรายการสินค้าไม่ถูกต้อง',
}

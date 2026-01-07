export enum IMAGE_DTO_MESSAGE {
  // primary id
  ID_IS_NOT_EMPTY = 'กรุณาเลือกรูปภาพ',
  ID_MUST_BE_UUID = 'รูปแบบหมายเลขรูปภาพต้องอยู่ในรูปแบบ uuid',

  // image dto
  IMAGE_IS_NOT_EMPTY = 'กรุณาเพิ่มรูปภาพ',

  // url
  URL_IS_NOT_EMPTY = 'กรุณากรอก URL ของรูปภาพ',
  INVALID_URL = 'URL ไม่ถูกต้อง',

  // public id
  PUBLIC_ID_MUST_BE_STRING = 'public_id ต้องเป็นข้อความ',

  // alt
  ALT_MUST_BE_STRING = 'alt ต้องเป็นข้อความ',

  // primary
  IS_PRIMARY_IS_NOT_EMPTY = 'กรุณาระบุว่ารูปนี้เป็นรูปหลักหรือไม่',
  IS_PRIMARY_MUST_BE_BOOLEAN = 'is_primary ต้องเป็นค่า boolean',

  // width
  WIDTH_IS_NOT_EMPTY = 'กรุณากรอกความกว้างของรูปภาพ',
  WIDTH_MUST_BE_INTEGER = 'ความกว้างต้องเป็นตัวเลขจำนวนเต็ม',
  WIDTH_MUST_BE_POSITIVE = 'ความกว้างต้องเป็นตัวเลขที่มากกว่า 0',

  // height
  HEIGHT_IS_NOT_EMPTY = 'กรุณากรอกความสูงของรูปภาพ',
  HEIGHT_MUST_BE_INTEGER = 'ความสูงต้องเป็นตัวเลขจำนวนเต็ม',
  HEIGHT_MUST_BE_POSITIVE = 'ความสูงต้องเป็นตัวเลขที่มากกว่า 0',

  // order
  TARGET_ORDER_IS_NOT_EMPTY = 'กรุณาเลือกตำแหน่งที่ต้องการย้ายไป',
  TARGET_ORDER_IS_INTTEGERE = 'ตำแหน่งที่ต้องการย้ายต้องเป็นตัวเลข',
  TARGET_ORDER_MUST_BE_POSITIVE = 'ตำแหน่งที่ต้องการย้ายต้องเป็นตัวเลขที่มากกว่า 0',
}

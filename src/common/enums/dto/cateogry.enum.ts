export enum CATEGORY_DTO_MESSAGE {
  // primary id
  ID_MUST_BE_INTEGER = 'กรุณาเลือกหมวดหมู่',
  ID_IS_NOT_EMPTY = 'หมายเลขหมวดหมู่ต้องไม่เป็นค่าว่าง',

  // name
  NAME_IS_NOT_EMPTY = 'ชื่อหมวดหมู่ต้องไม่เป็นค่าว่าง',
  NAME_MUST_BE_STRING = 'ชื่อหมวดหมู่ต้องเป็นประเภพข้อความเท่านั้น',
  INVALID_NAME_LENGTH = 'ชื่อหมวดหมู่ต้องไม่เกิน 30 ตัว',

  // categorie ids
  CATEGORY_IDS_MUST_BE_ARRAY = 'หมวดหมู่สินค้าต้องเป็นอาเรย์ของตัวเลข',
  CATEGORY_ID_MUST_BE_POSITIVE = 'หมวดหมู่แต่ละรายการต้องเป็นตัวเลขที่มากกว่า 0',
  EACH_CATEOGRY_IDS_MUST_BE_INTEGER = 'หมายเลขหมวดหมู่แต่ละรายการต้องเป็นตัวเลขจำนวนเต็มเท่านั้น',
  EACH_CATEOGRY_IDS_MUST_BE_POSITIVE = 'หมายเลขหมวดหมู่แต่ละรายการต้องเป็นตัวเลขที่มากกว่า 0',
}

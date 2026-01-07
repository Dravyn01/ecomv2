export enum REVIEW_DTO_MESSAGE {
  // rating
  RATING_IS_NOT_EMPTY = 'กรุณาเลือกจำนวนดาว',
  RATING_MUST_BE_INTEGER = 'จำนวนดาวต้องเป็นตัวเลข',
  RATING_MIN = 'จำนวนดาวต้องไม่ต่ำกว่า 1 ดาว',
  RATING_MAX = 'จำนวนดาวต้องไม่เกิน 5 ดาว',

  // comment
  COMMENT_IS_NOT_EMPTY = 'กรุณากรอกความคิดเห็นต่อสินค้า',
  COMMENT_INVALID_LENGTH = 'ความคิดเห็นต้องไม่สั้นเกินไป และยาวเกิน 100 ตัวอักษร',
}

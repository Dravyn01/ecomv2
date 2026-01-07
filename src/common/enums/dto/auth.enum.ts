export enum AUTH_DTO_MESSAGE {
  // username
  USERNAME_IS_NOT_EMPTY = 'ชื่อผู้ใช้ต้องไม่เป็นค่าว่าง',
  USERNAME_INVALID_LENGTH = 'ชื่อผู้ใช้ต้องไม่เกิน 30 ตัวอักษร',

  // email
  EMAIL_IS_NOT_EMPTY = 'อีเมลต้องไม่เป็นค่าว่าง',
  EMAIL_INVALID_FORMAT = 'รูปแบบอีเมลไม่ถูกต้อง',

  // password
  PASSWORD_IS_NOT_EMPTY = 'รหัสผ่านต้องไม่เป็นค่าว่าง',
  PASSWORD_MIN_LENGTH = 'รหัสผ่านต้องยาวกว่าหรือเท่ากับ 6 ตัวอักษร',
}

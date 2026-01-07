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

  // new password
  NEW_PASSWORD_IS_NOT_EMPTY = 'รหัสใหม่ผ่านต้องไม่เป็นค่าว่าง',
  NEW_PASSWORD_MIN_LENGTH = 'รหัสผ่านใหม่ต้องยาวกว่าหรือเท่ากับ 6 ตัวอักษร',
}

export enum AUTH_FAILED_MESSAGE {
  INVALID_CREDENTIALS = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
}

// ใช้ตอนทำ log
export enum AUTH_FIALED_REASON {
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
}

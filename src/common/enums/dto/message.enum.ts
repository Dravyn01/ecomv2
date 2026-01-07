export enum MESSAGE_DTO_MESSAGE {
  // primary id
  ID_IS_NOT_EMPTY = 'กรุณาระบุรหัสข้อความ',
  ID_MUST_BE_UUID = 'หมายเลขข้อความต้องอยู่ในรูปแบบ uuid',

  // text
  TEXT_IS_NOT_EMPTY = 'กรุณากรอกข้อความ',
  TEXT_MUST_BE_STRING = 'ข้อความต้องเป็นประเภพข้อความเท่านั้น',
  TEXT_TOO_LONG = 'ข้อความยาวเกินกว่าที่กำหนด',

  // read_at
  READ_AT_MUST_BE_DATE = 'เวลาอ่านต้องอยู่ในรูปแบบวันที่',

  // message dto
  INVALID_MESSAGE_IDS_MUST_BE_ARRAY = 'ประเภพข้อมูลไม่ถูกต้อง',
}

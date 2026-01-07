export const DATE_FORMAT = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export enum DATE_DTO_MESSAGE {
  DATE_IS_NOT_EMPTY = 'กรุณาระบุวันที่เริ่มต้น',
  INVALID_DATE_FORMAT = 'รูปแบบวันที่ต้องเป็น YYYY-MM-DD',
}

export const aggregateByProduct = <T, R>(
  items: T[],
  getProductId: (item: T) => string,
  reducer: (acc: R, item: T) => void,
  initial: () => R,
): Map<string, R> => {
  /*
   * types:
   * T ข้อมูลที่เป็น array
   * R หน้าตาข้อมูลว่าง: { repeat: 0, unique: 0 }
   *
   * callback:
   * getProductId: (item: T) => ดึง produt_id จากไหน
   *
   * reducer: (acc: R, item: T) {
   *  - callback logic สำหรับเพิ่มค่าให้กับ property ใน  map
   *
   *  acc = ข้อมูลว่างที่ set ไว้ใน initial
   *  item = list ข้อมูลที่ถูก loop ไว้เป็นแถวๆ จาก items ที่ส่งเข้ามา
   * }
   *
   * initial = สร้างข้อมูลเริ่มต้น หรือ ข้อมูลว่าง
   * */

  const map = new Map<string, R>();

  for (const item of items) {
    const product_id = getProductId(item);

    if (!map.has(product_id)) {
      map.set(product_id, initial());
    }

    reducer(map.get(product_id)!, item);
  }

  return map;
};

import { CreateProductDTO } from './create-product.dto';
import { getValidationMessages } from 'src/utils/test/validate-helper';

describe('CreateProductDTO', () => {
  it('should pass validation when data is valid', async () => {
    const dto = new CreateProductDTO();
    dto.name = 'Nice Product';
    dto.description = 'Nice product description';
    dto.base_price = 1999;
    dto.discount_price = 159;
    dto.category_ids = [1, 2, 3];

    const messages = await getValidationMessages(dto);
    expect(messages).toHaveLength(0);
  });

  it('should error when required fields are missing', async () => {
    const dto = new CreateProductDTO();
    const messages = await getValidationMessages(dto);

    expect(messages).toContain('กรุณากรอกชื่อสินค้า');
    expect(messages).toContain('คำอธิบายสินค้าต้องเป็นข้อความเท่านั้น');
    expect(messages).toContain('กรุณากรอกราคาพื้นฐานของสินค้า');
  });

  it('should error when name and description are not string', async () => {
    const dto = new CreateProductDTO();
    dto.name = 123 as any;
    dto.description = false as any;

    const messages = await getValidationMessages(dto);

    expect(messages).toContain('ชื่อสินค้าต้องเป็นข้อความเท่านั้น');
    expect(messages).toContain('คำอธิบายสินค้าต้องเป็นข้อความเท่านั้น');
  });

  it('should error when base_price or discount_price are not numbers', async () => {
    const dto = new CreateProductDTO();
    dto.base_price = 'abc' as any;
    dto.discount_price = '12ff' as any;

    const messages = await getValidationMessages(dto);

    expect(messages).toContain('ราคาพื้นฐานต้องเป็นตัวเลขเท่านั้น');
    expect(messages).toContain('ราคาหลังลดต้องเป็นตัวเลขเท่านั้น');
  });

  it('should error when base_price or discount_price < 1', async () => {
    const dto = new CreateProductDTO();
    dto.base_price = 0;
    dto.discount_price = -10;

    const messages = await getValidationMessages(dto);

    expect(messages).toContain('ราคาพื้นฐานต้องมากกว่า 0 บาท');
    expect(messages).toContain('ราคาหลังลดต้องมากกว่า 0 บาท');
  });

  it('should error when category_ids invalid', async () => {
    const dto = new CreateProductDTO();
    dto.category_ids = [-1, 'abc', 0] as any;

    const messages = await getValidationMessages(dto);

    expect(messages).toContain('หมวดหมู่แต่ละรายการต้องเป็นตัวเลขที่มากกว่า 0');
  });
});

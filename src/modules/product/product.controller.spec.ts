import { Test } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { FindAllProductsQuery } from './dto/find-all-products.query';
import { ApiResponse } from 'src/common/dto/res/common-response';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProduct = {
    id: 1,
    name: 'Product 1',
    description: 'Desc 1',
    base_price: 100,
    discount_price: 90,
    created_at: new Date(),
    updated_at: new Date(),
  };

  // mock response แยกตาม action
  const mockCreateResponse = { ...mockProduct, id: 2, name: 'Product Created' };
  const mockUpdateResponse = { ...mockProduct, id: 1, name: 'Product Updated' };
  const mockFindAllResponse = { data: [mockProduct], count: 1 };
  const mockFindOneResponse = mockProduct;
  const mockDeleteResponse = null;

  const mockCreateProduct = {
    name: 'Product 1',
    description: 'Desc 1',
    base_price: 199,
    discount_price: 299,
    category_ids: [1, 2],
  };

  const mockUpdateProduct = {
    name: 'Product 2',
    description: 'Desc 2',
    base_price: 100,
    discount_price: 200,
    category_ids: [],
  };

  const mockService = {
    findAll: jest.fn().mockResolvedValue(mockFindAllResponse),
    findOne: jest.fn().mockResolvedValue(mockFindOneResponse),
    create: jest.fn().mockResolvedValue(mockCreateResponse),
    update: jest.fn().mockResolvedValue(mockUpdateResponse),
    delete: jest.fn().mockResolvedValue(mockDeleteResponse),
  };

  beforeEach(async () => {
    const modules = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = modules.get<ProductController>(ProductController);
    service = modules.get<ProductService>(ProductService);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  it('should return product[]', async () => {
    const query: FindAllProductsQuery = {
      search: '',
      page: 1,
      limit: 10,
      order: 'ASC',
    };
    const result = await controller.findAll(query);
    expect(service.findAll).toHaveBeenCalledWith(query);
    expect(result).toEqual({
      data: mockFindAllResponse,
      message: `พบสินค้าทั้งหมด ${mockFindAllResponse.count} รายการ`,
    } as ApiResponse);
  });

  it('should return product', async () => {
    const product_id = 1;
    const result = await controller.findById(product_id);
    expect(service.findOne).toHaveBeenCalledWith(product_id);
    expect(result).toEqual({
      data: mockFindOneResponse,
      message: `ข้อมูลสินค้าหมายเลข ${product_id}`,
    } as ApiResponse);
  });

  it('should create success and return new product', async () => {
    const result = await controller.create(mockCreateProduct);
    expect(service.create).toHaveBeenCalledWith(mockCreateProduct);
    expect(result).toEqual({
      data: mockCreateResponse,
      message: 'สร้างสินค้าเสร็จสิ้น',
    } as ApiResponse);
  });

  it('should update success and return updated product', async () => {
    const product_id = 1;
    const result = await controller.update(
      String(product_id),
      mockUpdateProduct,
    );
    expect(service.update).toHaveBeenCalledWith(product_id, mockUpdateProduct);
    expect(result).toEqual({
      data: mockUpdateResponse,
      message: 'อัพเดทสินค้าเสร็จสิ้น',
    } as ApiResponse);
  });

  it('should delete success and return null', async () => {
    const product_id = 1;
    const result = await controller.delete(String(product_id));
    expect(service.delete).toHaveBeenCalledWith(product_id);
    expect(result).toEqual({
      data: mockDeleteResponse,
      message: `ลบสินค้าหมายเลข "${product_id}" เสร็จสิ้น`,
    } as ApiResponse);
  });
});

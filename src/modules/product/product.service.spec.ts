import { Test } from '@nestjs/testing';
import { CategoryService } from '../category/category.service';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let productService: ProductService;
  let categoryService: CategoryService;

  beforeEach(async () => {
    const modules = await Test.createTestingModule({
      providers: [
        {
          provide: ProductService,
          useValue: mockService,
        },
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    });
  });
});

import { PartialType } from '@nestjs/mapped-types';
import { CreateProductReq } from './create-product.req';

export class UpdateProductReq extends PartialType(CreateProductReq) {}

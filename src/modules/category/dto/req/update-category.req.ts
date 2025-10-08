import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryReq } from './create-category.req';

export class UpdateCategoryReq extends PartialType(CreateCategoryReq) {}

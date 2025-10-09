import { PartialType } from '@nestjs/mapped-types';
import { CreateVariantReq } from './create-variant.req';

export class UpdateVariantReq extends PartialType(CreateVariantReq) {}

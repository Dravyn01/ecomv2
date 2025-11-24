import { PartialType } from '@nestjs/mapped-types';
import { CreateVariantDTO } from './create-variant.dto';

export class UpdateVariantDTO extends PartialType(CreateVariantDTO) {}

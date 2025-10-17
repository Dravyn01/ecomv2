import { DatasResponse } from 'src/common/dto/res/datas.response';
import { ProductVariant } from 'src/config/entities.config';

export class ProductVariantsResponse extends DatasResponse<ProductVariant[]> {}

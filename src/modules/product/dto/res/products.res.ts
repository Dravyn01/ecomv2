import { DatasResponse } from 'src/common/dto/res/datas.response';
import { Product } from 'src/config/entities.config';

export class ProductsResponse extends DatasResponse<Product[]> {}

import { ProductVariant } from 'src/config/entities.config';
import { ProductVariantResponse } from 'src/modules/product-variant/dto/res/product-variant.res';

export const toProductVariantResponse = (
  variant: ProductVariant,
): ProductVariantResponse => {
  return {
    id: variant.id,
    price: variant.price,
    sku: variant.sku,
    image_url: variant.image_url,
    added_at: variant.added_at,
  } as ProductVariantResponse;
};

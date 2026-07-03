import { Product } from "@/types/product";

export function getProductUrl(product: Pick<Product, "id" | "slug">) {
  return `/product/${encodeURIComponent(product.slug || String(product.id))}`;
}

export type ProductAttributeValue = {
  label: string;
  value: string;
  color?: string;
  image?: string;
};

export type ProductAttribute = {
  name: string;
  slug: string;
  type?: "select" | "swatch";
  values: ProductAttributeValue[];
};

export type ProductVariant = {
  sku?: string | null;
  price: number;
  discounted_price: number;
  stock?: number;
  image?: string | null;
  options: Record<string, string>;
  is_active?: boolean;
};

export type ProductInfoItem = {
  label: string;
  value: string;
};

export type ProductReview = {
  name: string;
  role?: string;
  avatar?: string;
  rating: number;
  comment: string;
};

export type Product = {
  slug?: string;
  sku?: string | null;
  title: string;
  reviews: number;
  stock?: number;
  price: number;
  discountedPrice: number;
  id: number;
  category?: {
    id: number;
    title: string;
    slug: string;
  };
  brand?: {
    id: number;
    title: string;
    slug: string;
    img?: string | null;
  };
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  description?: string;
  specifications?: string[];
  care_instructions?: string[];
  additional_information?: ProductInfoItem[];
  customer_reviews?: ProductReview[];
};

import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";
import { fetchProduct } from "@/services/api";

type ProductDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await fetchProduct(slug);

    return {
      title: product.title,
      description: product.description || `Shop ${product.title}.`,
      openGraph: {
        title: product.title,
        description: product.description || `Shop ${product.title}.`,
        images: product.imgs?.previews?.[0] ? [product.imgs.previews[0]] : undefined,
      },
    };
  } catch {
    return {
      title: "Product Details",
      description: "View product details, pricing, and availability.",
    };
  }
}

const ProductDetailsPage = async ({ params }: ProductDetailsPageProps) => {
  const { slug } = await params;

  return (
    <main>
      <ShopDetails slug={slug} />
    </main>
  );
};

export default ProductDetailsPage;

"use client";

import React from "react";
import Link from "next/link";
import ProductItem from "@/components/Common/ProductItem";
import { useProducts } from "@/hooks/useProducts";

const NewArrival = () => {
  const shopData = useProducts();

  return (
    <section className="overflow-hidden bg-[#F8FAFC] py-8 sm:py-10 xl:py-12">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
          <div>            
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              New Arrivals
            </h2>
          </div>

          <Link
            href="/shop"
            className="inline-flex shrink-0 text-custom-sm font-medium text-dark duration-200 hover:text-gray-7 underline"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-7 xl:grid-cols-4 xl:gap-x-7.5 xl:gap-y-9">
          {shopData.slice(0, 8).map((item, key) => (
            <ProductItem item={item} key={key} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrival;

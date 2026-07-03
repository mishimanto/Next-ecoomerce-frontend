"use client";

import React from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";

const BestSeller = () => {
  const shopData = useProducts();

  return (
    <section className="overflow-hidden bg-white py-8 sm:py-10 xl:py-12">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="mb-5 flex items-end justify-between sm:mb-6 xl:mb-7.5">
          <div>            
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Best Selling Products
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:gap-7.5">
          {shopData.slice(1, 7).map((item, key) => (
            <SingleItem item={item} key={key} />
          ))}
        </div>

        <div className="text-center mt-6 sm:mt-8 xl:mt-10">
          <Link
            href="/shop"
            className="inline-flex text-custom-md font-bold text-dark duration-200 hover:text-gray-7 underline "
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;

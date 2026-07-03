"use client";

import Image from "next/image";
import { useBrands } from "@/hooks/useBrands";

const Brands = () => {
  const brands = useBrands().filter((brand) => brand.img);

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden bg-white pb-8 sm:pb-10 lg:pb-12">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <span className="mb-1.5 block text-custom-sm font-medium uppercase text-blue">
              Brands
            </span>
            <h2 className="text-xl font-semibold text-dark xl:text-heading-5">
              Popular Makers
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="flex h-18 items-center justify-center rounded-md border border-gray-3 bg-gray-1 px-4 py-3 transition duration-200 hover:-translate-y-0.5 hover:border-blue/40 hover:bg-white hover:shadow-1 sm:h-22"
            >
              <Image
                src={brand.img as string}
                alt={brand.title}
                width={140}
                height={70}
                unoptimized
                className="max-h-10 w-auto object-contain sm:max-h-12"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Brands;

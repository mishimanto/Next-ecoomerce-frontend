import { Category } from "@/types/category";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const SingleItem = ({ item }: { item: Category }) => {
  const image = item.img || "/images/categories/categories-01.png";
  const isBackendImage =
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/storage/");

  const categoryValue = item.slug || item.id.toString();

  return (
    <Link
      href={`/shop?category=${encodeURIComponent(categoryValue)}`}
      className="group flex flex-col items-center"
    >
      <div className="mb-1.5 flex h-20 w-20 items-center justify-center bg-white shadow-1 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-blue/40 sm:h-24 sm:w-24 lg:h-28 lg:w-28 xl:h-32.5 xl:w-full xl:max-w-[130px]">
        <Image
          src={image}
          alt={item.title}
          width={82}
          height={62}
          unoptimized={isBackendImage}
          className="max-h-10 w-auto max-w-[52px] sm:max-h-12 sm:max-w-[62px] lg:max-h-14 lg:max-w-[72px] xl:max-h-none xl:max-w-none"
        />
      </div>

      <div className="flex justify-center">
        <h3 className="inline-block max-w-[88px] text-center text-xs font-medium leading-snug text-dark transition duration-200 group-hover:text-blue sm:max-w-[112px] sm:text-custom-sm xl:max-w-none">
          {item.title}
        </h3>
      </div>
    </Link>
  );
};

export default SingleItem;

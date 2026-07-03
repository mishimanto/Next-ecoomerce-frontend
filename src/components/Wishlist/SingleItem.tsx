import React from "react";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";

import { removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { addItemToCart } from "@/redux/features/cart-slice";

import Image from "next/image";
import Link from "next/link";
import { getProductUrl } from "@/lib/product";
import { formatCurrency } from "@/lib/currency";
import { FiShoppingCart, FiX } from "react-icons/fi";

const SingleItem = ({ item }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleRemoveFromWishlist = () => {
    dispatch(removeItemFromWishlist(item.id));
  };

  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        ...item,
        quantity: 1,
      })
    );
  };

  return (
    <div className="relative grid grid-cols-[86px_1fr] gap-4   px-4 py-4 sm:grid-cols-[104px_1fr_auto] sm:items-center sm:gap-5 sm:px-6 lg:flex lg:px-8 xl:px-10 lg:py-5">
      <div className="absolute right-3 top-3 sm:static sm:order-3 sm:min-w-[44px] lg:order-none lg:min-w-[83px]">
        <button
          onClick={() => handleRemoveFromWishlist()}
          aria-label="button for remove product from wishlist"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-3 bg-gray-2 text-dark-4 ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red sm:h-9.5 sm:w-9.5"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="contents lg:flex lg:min-w-[340px] xl:min-w-[387px]">
        <div className="flex h-22 w-full items-center justify-center rounded-[5px] bg-gray-2 sm:h-24 lg:h-17.5 lg:max-w-[80px]">
          {item.imgs?.thumbnails?.[0] && (
            <Image
              src={item.imgs.thumbnails[0]}
              alt={item.title || "product"}
              width={200}
              height={200}
              unoptimized
              className="max-h-[78px] w-auto object-contain sm:max-h-[88px] lg:max-h-15"
            />
          )}
        </div>

        <div className="min-w-0 pr-8 sm:pr-0 lg:ml-5.5 lg:flex lg:items-center">
          <h3 className="line-clamp-2 text-custom-sm font-medium text-dark ease-out duration-200 hover:text-blue sm:text-base">
            <Link href={getProductUrl(item)}>{item.title}</Link>
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 lg:hidden">
            <p className="font-medium text-dark">
              {formatCurrency(item.discountedPrice)}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green"></span>
              <span className="text-custom-sm text-green">
                {item.status || "Available"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden min-w-[180px] lg:block xl:min-w-[205px]">
        <p className="text-dark">{formatCurrency(item.discountedPrice)}</p>
      </div>

      <div className="hidden min-w-[220px] lg:block xl:min-w-[265px]">
        <div className="flex items-center gap-1.5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.33301 12.6433L5.58967 9.9L4.41134 11.0783L8.33301 15L16.6663 6.66667L15.488 5.48834L8.33301 12.6433Z"
              fill="#22AD5C"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1.04102 10C1.04102 5.05247 5.0518 1.04169 9.99935 1.04169C14.9469 1.04169 18.9577 5.05247 18.9577 10C18.9577 14.9476 14.9469 18.9584 9.99935 18.9584C5.0518 18.9584 1.04102 14.9476 1.04102 10ZM9.99935 2.29169C5.74215 2.29169 2.29102 5.74283 2.29102 10C2.29102 14.2572 5.74215 17.7084 9.99935 17.7084C14.2565 17.7084 17.7077 14.2572 17.7077 10C17.7077 5.74283 14.2565 2.29169 9.99935 2.29169Z"
              fill="#22AD5C"
            />
          </svg>

          <span className="text-green"> {item.status || "Available"} </span>
        </div>
      </div>

      <div className="col-span-2 flex sm:col-span-1 sm:order-4 lg:order-none lg:min-w-[150px] lg:justify-end">
        <button
          onClick={() => handleAddToCart()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-3 bg-gray-1 px-4 py-2.5 text-custom-sm font-medium text-dark ease-out duration-200 hover:bg-blue hover:border-gray-3 hover:text-white sm:w-auto lg:px-6"
        >
          <FiShoppingCart size={17} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default SingleItem;

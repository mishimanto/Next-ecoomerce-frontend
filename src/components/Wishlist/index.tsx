"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import SingleItem from "./SingleItem";
import { removeAllItemsFromWishlist } from "@/redux/features/wishlist-slice";
import Link from "next/link";

export const Wishlist = () => {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
      <section className="overflow-hidden py-10 bg-gray-2">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">Your Wishlist</h2>
            {wishlistItems.length > 0 && (
              <button
                type="button"
                onClick={() => dispatch(removeAllItemsFromWishlist())}
                className="text-blue"
              >
                Clear Wishlist
              </button>
            )}
          </div>

          {wishlistItems.length > 0 ? (
            <div className="overflow-hidden bg-white rounded-[10px] shadow-1">
              {/* <!-- table header --> */}
              <div className="hidden lg:flex items-center py-5.5 px-8 xl:px-10">
                <div className="min-w-[83px]"></div>
                <div className="min-w-[340px] xl:min-w-[387px]">
                  <p className="text-dark">Product</p>
                </div>

                <div className="min-w-[180px] xl:min-w-[205px]">
                  <p className="text-dark">Unit Price</p>
                </div>

                <div className="min-w-[220px] xl:min-w-[265px]">
                  <p className="text-dark">Stock Status</p>
                </div>

                <div className="min-w-[150px]">
                  <p className="text-dark text-right">Action</p>
                </div>
              </div>

              {/* <!-- wish item --> */}
              <div>
                {wishlistItems.map((item) => (
                  <SingleItem item={item} key={item.id} />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[10px] shadow-1 text-center py-16 px-4">
              <h3 className="font-medium text-dark text-xl mb-3">
                Your wishlist is empty
              </h3>
              <p className="text-dark-4 mb-6">
                Save products you love and find them here later.
              </p>
              <Link
                href="/shop"
                className="inline-flex justify-center font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
              >
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

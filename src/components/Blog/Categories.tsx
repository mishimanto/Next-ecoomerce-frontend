import React from "react";
import { Category } from "@/types/category";

type BlogCategory = Category & {
  name?: string;
  products?: number;
};

type CategoriesProps = {
  categories?: BlogCategory[];
};

const Categories = ({ categories = [] }: CategoriesProps) => {
  const visibleCategories = categories.slice(0, 8);

  return (
    <div className="shadow-1 bg-white rounded-xl mt-7.5">
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="font-medium text-lg text-dark">Popular Category</h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-3">
          {visibleCategories.map((category) => {
            const title = category.title || category.name || "Category";
            const productCount =
              category.products_count ?? category.products ?? 0;

            return (
              <button
                key={category.id ?? title}
                className="group flex items-center justify-between ease-out duration-200 text-dark hover:text-blue"
              >
                {title}
                <span className="inline-flex rounded-[30px] bg-gray-2 text-custom-xs px-1.5 ease-out duration-200 group-hover:text-white group-hover:bg-blue">
                  {productCount.toString().padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Categories;

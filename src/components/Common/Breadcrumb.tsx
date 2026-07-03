import Link from "next/link";
import React from "react";

const Breadcrumb = ({ title, pages }) => {
  return (
    <div className="overflow-hidden shadow-breadcrumb pt-[130px] sm:pt-[122px] lg:pt-[95px] xl:pt-[165px]">
      <div className=" ">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0 py-4 sm:py-5 xl:py-10">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-semibold text-dark text-base sm:text-2xl xl:text-custom-2">
              {title}
            </h1>

            <ul className="flex min-w-0 flex-wrap items-center justify-end gap-1.5 text-[11px] sm:gap-2 sm:text-custom-sm">
              <li className="hover:text-blue">
                <Link href="/">Home</Link>
              </li>

              {pages.length > 0 &&
                pages.map((page, key) => (
                  <li className="flex items-center gap-1.5 last:text-blue capitalize" key={key}>
                    <span className="text-dark-4">/</span>
                    <span>{page}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;

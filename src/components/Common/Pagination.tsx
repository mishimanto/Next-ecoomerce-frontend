"use client";

import React from "react";
import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from "react-icons/fi";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isDisabled?: boolean;
  className?: string;
};

type PageItem = number | "ellipsis-start" | "ellipsis-end";

const siblingCount = 1;

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);
  const shouldShowLeftEllipsis = leftSibling > 2;
  const shouldShowRightEllipsis = rightSibling < totalPages - 1;

  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    return [1, 2, 3, 4, 5, "ellipsis-end", totalPages];
  }

  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    return [
      1,
      "ellipsis-start",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis-start",
    leftSibling,
    currentPage,
    rightSibling,
    "ellipsis-end",
    totalPages,
  ];
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  isDisabled = false,
  className = "",
}: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const pageItems = getPageItems(currentPage, totalPages);

  const goToPage = (page: number) => {
    if (isDisabled || page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    onPageChange(page);
  };

  return (
    <nav
      className={`flex flex-col items-center justify-between gap-4 rounded-lg border border-gray-3 bg-white p-3 shadow-1 sm:flex-row sm:px-4 ${className}`}
      aria-label="Products pagination"
    >
      <p className="text-custom-sm text-dark-4">
        Page <span className="font-medium text-dark">{currentPage}</span> of{" "}
        <span className="font-medium text-dark">{totalPages}</span>
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={isDisabled || currentPage === 1}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-gray-3 bg-white px-3 text-custom-sm font-medium text-dark duration-200 hover:border-blue hover:text-blue disabled:cursor-not-allowed disabled:border-gray-3 disabled:text-dark-5"
        >
          <FiChevronLeft size={16} />
          Prev
        </button>

        {pageItems.map((item) =>
          typeof item === "number" ? (
            <button
              key={item}
              type="button"
              onClick={() => goToPage(item)}
              disabled={isDisabled}
              aria-current={item === currentPage ? "page" : undefined}
              className={`flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-custom-sm font-medium duration-200 ${
                item === currentPage
                  ? "border-blue bg-blue text-white shadow-sm"
                  : "border-gray-3 bg-white text-dark hover:border-blue hover:text-blue"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {item}
            </button>
          ) : (
            <span
              key={item}
              className="flex h-9 min-w-9 items-center justify-center rounded-md border border-gray-3 bg-gray-1 text-dark-4"
            >
              <FiMoreHorizontal size={16} />
            </span>
          )
        )}

        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={isDisabled || currentPage === totalPages}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-gray-3 bg-white px-3 text-custom-sm font-medium text-dark duration-200 hover:border-blue hover:text-blue disabled:cursor-not-allowed disabled:border-gray-3 disabled:text-dark-5"
        >
          Next
          <FiChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;

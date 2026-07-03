"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Pagination from "../Common/Pagination";
import CustomSelect from "./CustomSelect";
import CategoryDropdown from "./CategoryDropdown";
import BrandDropdown from "./BrandDropdown";
import PriceDropdown from "./PriceDropdown";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import { useCategories } from "@/hooks/useCategories";
import { useBrands } from "@/hooks/useBrands";
import { fetchProductsPage } from "@/services/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { FiSliders, FiX } from "react-icons/fi";

const ShopWithSidebar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categories = useCategories();
  const brands = useBrands();
  const productsTopRef = useRef<HTMLDivElement>(null);
  const [productStyle, setProductStyle] = useState("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number]>([0, 0]);
  const [priceFilterTouched, setPriceFilterTouched] = useState(false);
  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId
  );
  const { data: productPage, isFetching } = useQuery({
    queryKey: [
      "products",
      "shop",
      selectedCategoryId,
      selectedBrandId,
      sortBy,
      appliedPriceRange,
      currentPage,
    ],
    queryFn: () =>
      fetchProductsPage({
        page: currentPage,
        perPage: 24,
        category: selectedCategoryId || undefined,
        brand: selectedBrandId || undefined,
        sort: sortBy as "latest" | "oldest" | "best-selling",
        minPrice: appliedPriceRange[0] > 0 ? appliedPriceRange[0] : undefined,
        maxPrice: appliedPriceRange[1] > 0 ? appliedPriceRange[1] : undefined,
      }),
    placeholderData: keepPreviousData,
  });
  const shopData = useMemo(() => productPage?.data || [], [productPage]);
  const productMeta = productPage?.meta;
  const totalProducts = productMeta?.total || shopData.length;
  const totalPages = productMeta?.last_page || 1;
  const showingFrom = productMeta?.from || (shopData.length > 0 ? 1 : 0);
  const showingTo = productMeta?.to || shopData.length;
  const priceBounds = useMemo(() => {
    if (shopData.length === 0) {
      return { min: 0, max: 0 };
    }

    const prices = shopData.map((product) => product.discountedPrice);

    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [shopData]);

  const options = [
    { label: "Latest Products", value: "latest" },
    { label: "Best Selling", value: "best-selling" },
    { label: "Old Products", value: "oldest" },
  ];

  const visibleProducts = shopData;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    productsTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const updateCategoryParam = (categoryId: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextCategory = categories.find((category) => category.id === categoryId);

    if (nextCategory) {
      params.set("category", nextCategory.slug || nextCategory.id.toString());
    } else {
      params.delete("category");
    }

    const query = params.toString();
    router.replace(query ? `/shop?${query}` : "/shop", { scroll: false });
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    updateCategoryParam(categoryId);
  };

  const handleClearFilters = () => {
    setSelectedCategoryId(null);
    setSelectedBrandId(null);
    setPriceFilterTouched(false);
    setPriceRange([priceBounds.min, priceBounds.max]);
    setAppliedPriceRange([0, 0]);
    setSortBy("latest");
    updateCategoryParam(null);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, selectedBrandId, sortBy, appliedPriceRange]);

  useEffect(() => {
    if (appliedPriceRange[0] === 0 && appliedPriceRange[1] === 0) {
      setPriceRange([priceBounds.min, priceBounds.max]);
    }
  }, [appliedPriceRange, priceBounds.min, priceBounds.max]);

  useEffect(() => {
    if (!priceFilterTouched) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setAppliedPriceRange(priceRange);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [priceFilterTouched, priceRange]);

  useEffect(() => {
    const categoryParam = searchParams.get("category");

    if (!categoryParam) {
      setSelectedCategoryId(null);
      return;
    }

    const matchedCategory = categories.find(
      (category) =>
        category.slug === categoryParam ||
        category.id.toString() === categoryParam
    );

    if (matchedCategory) {
      setSelectedCategoryId(matchedCategory.id);
    }
  }, [categories, searchParams]);

  useEffect(() => {
    // closing sidebar while clicking outside
    function handleClickOutside(event) {
      if (!event.target.closest(".sidebar-content")) {
        setProductSidebar(false);
      }
    }

    if (productSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  return (
    <>
      <Breadcrumb
        title={"Explore All Products"}
        pages={["shop"]}
      />
      <section className="overflow-hidden relative pb-20 pt-5 bg-[#f3f4f6]">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0">
          {productSidebar && (
            <div
              className="fixed inset-0 z-[99998] bg-dark/40 xl:hidden"
              onClick={() => setProductSidebar(false)}
            />
          )}
          <div className="flex gap-6 xl:gap-7.5">
            {/* <!-- Sidebar Start --> */}
            <div
              className={`sidebar-content fixed xl:z-1 z-[99999] right-0 top-0 xl:translate-x-0 xl:static max-w-[320px] xl:max-w-[270px] w-full ease-out duration-200 ${
                productSidebar
                  ? "translate-x-0 bg-white h-screen overflow-y-auto shadow-2"
                  : "translate-x-full"
              }`}
            >
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col xl:gap-5">
                  {/* <!-- filter box --> */}
                  <div className="flex items-center justify-between border-b border-gray-3 px-5 py-4 xl:rounded-lg xl:border-0 xl:bg-white xl:shadow-1">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setProductSidebar(false)}
                        className="xl:hidden text-dark"
                        aria-label="Close filters"
                      >
                        <FiX size={20} />
                      </button>
                      <p className="text-lg font-semibold text-dark xl:text-base xl:font-medium">Filters</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue px-2 text-xs font-semibold text-white">
                        {[selectedCategoryId, selectedBrandId, priceFilterTouched].filter(Boolean).length}
                      </span>
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="text-custom-sm text-blue"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="px-5 xl:px-0">
                    <PriceDropdown
                      min={priceBounds.min}
                      max={priceBounds.max}
                      value={priceRange}
                      onChange={(nextRange) => {
                        setPriceFilterTouched(true);
                        setPriceRange(nextRange);
                      }}
                    />

                    <CategoryDropdown
                      categories={categories}
                      selectedCategoryId={selectedCategoryId}
                      onCategoryChange={handleCategoryChange}
                    />

                    <BrandDropdown
                      brands={brands}
                      selectedBrandId={selectedBrandId}
                      onBrandChange={setSelectedBrandId}
                    />
                  </div>
                </div>
              </form>
            </div>
            {/* // <!-- Sidebar End --> */}

            {/* // <!-- Content Start --> */}
            <div ref={productsTopRef} className="w-full min-w-0 flex-1 scroll-mt-40">
              <div className="mb-6 rounded-lg bg-white shadow-1 p-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="grid grid-cols-2 gap-3 xl:hidden">
                    <button
                      type="button"
                      onClick={() => setProductSidebar(true)}
                      className="inline-flex h-11 items-center justify-between rounded-md border border-gray-3 bg-white px-4 text-custom-sm font-medium text-dark shadow-sm"
                    >
                      <span className="flex items-center gap-3">
                        <FiSliders size={18} />
                        Filters
                      </span>
                      <span className="text-blue">⌄</span>
                    </button>
                    <CustomSelect
                      options={options}
                      value={sortBy}
                      onChange={setSortBy}
                    />
                  </div>
                  {/* <!-- top bar left --> */}
                  <div className="hidden flex-wrap items-center gap-4 xl:flex">
                    <CustomSelect
                      options={options}
                      value={sortBy}
                      onChange={setSortBy}
                    />

                    <p>
                      Showing{" "}
                      <span className="text-dark">
                        {showingFrom}-{showingTo} of {totalProducts}
                      </span>{" "}
                      Products
                      {selectedCategory ? (
                        <span className="ml-1 text-dark-4">
                          in {selectedCategory.title}
                        </span>
                      ) : null}
                      {isFetching ? (
                        <span className="ml-2 text-custom-xs text-dark-4">
                          Updating...
                        </span>
                      ) : null}
                    </p>
                  </div>

                  {/* <!-- top bar right --> */}
                  <div className="hidden items-center gap-2.5 xl:flex">
                    <button
                      onClick={() => setProductStyle("grid")}
                      aria-label="button for product grid tab"
                      className={`${
                        productStyle === "grid"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      <svg
                        className="fill-current"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M4.836 1.3125C4.16215 1.31248 3.60022 1.31246 3.15414 1.37244C2.6833 1.43574 2.2582 1.57499 1.91659 1.91659C1.57499 2.2582 1.43574 2.6833 1.37244 3.15414C1.31246 3.60022 1.31248 4.16213 1.3125 4.83598V4.914C1.31248 5.58785 1.31246 6.14978 1.37244 6.59586C1.43574 7.06671 1.57499 7.49181 1.91659 7.83341C2.2582 8.17501 2.6833 8.31427 3.15414 8.37757C3.60022 8.43754 4.16213 8.43752 4.83598 8.4375H4.914C5.58785 8.43752 6.14978 8.43754 6.59586 8.37757C7.06671 8.31427 7.49181 8.17501 7.83341 7.83341C8.17501 7.49181 8.31427 7.06671 8.37757 6.59586C8.43754 6.14978 8.43752 5.58787 8.4375 4.91402V4.83601C8.43752 4.16216 8.43754 3.60022 8.37757 3.15414C8.31427 2.6833 8.17501 2.2582 7.83341 1.91659C7.49181 1.57499 7.06671 1.43574 6.59586 1.37244C6.14978 1.31246 5.58787 1.31248 4.91402 1.3125H4.836ZM2.71209 2.71209C2.80983 2.61435 2.95795 2.53394 3.30405 2.4874C3.66632 2.4387 4.15199 2.4375 4.875 2.4375C5.59801 2.4375 6.08368 2.4387 6.44596 2.4874C6.79205 2.53394 6.94018 2.61435 7.03791 2.71209C7.13565 2.80983 7.21607 2.95795 7.2626 3.30405C7.31131 3.66632 7.3125 4.15199 7.3125 4.875C7.3125 5.59801 7.31131 6.08368 7.2626 6.44596C7.21607 6.79205 7.13565 6.94018 7.03791 7.03791C6.94018 7.13565 6.79205 7.21607 6.44596 7.2626C6.08368 7.31131 5.59801 7.3125 4.875 7.3125C4.15199 7.3125 3.66632 7.31131 3.30405 7.2626C2.95795 7.21607 2.80983 7.13565 2.71209 7.03791C2.61435 6.94018 2.53394 6.79205 2.4874 6.44596C2.4387 6.08368 2.4375 5.59801 2.4375 4.875C2.4375 4.15199 2.4387 3.66632 2.4874 3.30405C2.53394 2.95795 2.61435 2.80983 2.71209 2.71209Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M13.086 9.5625C12.4121 9.56248 11.8502 9.56246 11.4041 9.62244C10.9333 9.68574 10.5082 9.82499 10.1666 10.1666C9.82499 10.5082 9.68574 10.9333 9.62244 11.4041C9.56246 11.8502 9.56248 12.4121 9.5625 13.086V13.164C9.56248 13.8379 9.56246 14.3998 9.62244 14.8459C9.68574 15.3167 9.82499 15.7418 10.1666 16.0834C10.5082 16.425 10.9333 16.5643 11.4041 16.6276C11.8502 16.6875 12.4121 16.6875 13.0859 16.6875H13.164C13.8378 16.6875 14.3998 16.6875 14.8459 16.6276C15.3167 16.5643 15.7418 16.425 16.0834 16.0834C16.425 15.7418 16.5643 15.3167 16.6276 14.8459C16.6875 14.3998 16.6875 13.8379 16.6875 13.1641V13.086C16.6875 12.4122 16.6875 11.8502 16.6276 11.4041C16.5643 10.9333 16.425 10.5082 16.0834 10.1666C15.7418 9.82499 15.3167 9.68574 14.8459 9.62244C14.3998 9.56246 13.8379 9.56248 13.164 9.5625H13.086ZM10.9621 10.9621C11.0598 10.8644 11.208 10.7839 11.554 10.7374C11.9163 10.6887 12.402 10.6875 13.125 10.6875C13.848 10.6875 14.3337 10.6887 14.696 10.7374C15.0421 10.7839 15.1902 10.8644 15.2879 10.9621C15.3857 11.0598 15.4661 11.208 15.5126 11.554C15.5613 11.9163 15.5625 12.402 15.5625 13.125C15.5625 13.848 15.5613 14.3337 15.5126 14.696C15.4661 15.0421 15.3857 15.1902 15.2879 15.2879C15.1902 15.3857 15.0421 15.4661 14.696 15.5126C14.3337 15.5613 13.848 15.5625 13.125 15.5625C12.402 15.5625 11.9163 15.5613 11.554 15.5126C11.208 15.4661 11.0598 15.3857 10.9621 15.2879C10.8644 15.1902 10.7839 15.0421 10.7374 14.696C10.6887 14.3337 10.6875 13.848 10.6875 13.125C10.6875 12.402 10.6887 11.9163 10.7374 11.554C10.7839 11.208 10.8644 11.0598 10.9621 10.9621Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M4.836 9.5625H4.914C5.58786 9.56248 6.14978 9.56246 6.59586 9.62244C7.06671 9.68574 7.49181 9.82499 7.83341 10.1666C8.17501 10.5082 8.31427 10.9333 8.37757 11.4041C8.43754 11.8502 8.43752 12.4121 8.4375 13.086V13.164C8.43752 13.8378 8.43754 14.3998 8.37757 14.8459C8.31427 15.3167 8.17501 15.7418 7.83341 16.0834C7.49181 16.425 7.06671 16.5643 6.59586 16.6276C6.14979 16.6875 5.58789 16.6875 4.91405 16.6875H4.83601C4.16217 16.6875 3.60022 16.6875 3.15414 16.6276C2.6833 16.5643 2.2582 16.425 1.91659 16.0834C1.57499 15.7418 1.43574 15.3167 1.37244 14.8459C1.31246 14.3998 1.31248 13.8379 1.3125 13.164V13.086C1.31248 12.4122 1.31246 11.8502 1.37244 11.4041C1.43574 10.9333 1.57499 10.5082 1.91659 10.1666C2.2582 9.82499 2.6833 9.68574 3.15414 9.62244C3.60023 9.56246 4.16214 9.56248 4.836 9.5625ZM3.30405 10.7374C2.95795 10.7839 2.80983 10.8644 2.71209 10.9621C2.61435 11.0598 2.53394 11.208 2.4874 11.554C2.4387 11.9163 2.4375 12.402 2.4375 13.125C2.4375 13.848 2.4387 14.3337 2.4874 14.696C2.53394 15.0421 2.61435 15.1902 2.71209 15.2879C2.80983 15.3857 2.95795 15.4661 3.30405 15.5126C3.66632 15.5613 4.15199 15.5625 4.875 15.5625C5.59801 15.5625 6.08368 15.5613 6.44596 15.5126C6.79205 15.4661 6.94018 15.3857 7.03791 15.2879C7.13565 15.1902 7.21607 15.0421 7.2626 14.696C7.31131 14.3337 7.3125 13.848 7.3125 13.125C7.3125 12.402 7.31131 11.9163 7.2626 11.554C7.21607 11.208 7.13565 11.0598 7.03791 10.9621C6.94018 10.8644 6.79205 10.7839 6.44596 10.7374C6.08368 10.6887 5.59801 10.6875 4.875 10.6875C4.15199 10.6875 3.66632 10.6887 3.30405 10.7374Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M13.086 1.3125C12.4122 1.31248 11.8502 1.31246 11.4041 1.37244C10.9333 1.43574 10.5082 1.57499 10.1666 1.91659C9.82499 2.2582 9.68574 2.6833 9.62244 3.15414C9.56246 3.60023 9.56248 4.16214 9.5625 4.836V4.914C9.56248 5.58786 9.56246 6.14978 9.62244 6.59586C9.68574 7.06671 9.82499 7.49181 10.1666 7.83341C10.5082 8.17501 10.9333 8.31427 11.4041 8.37757C11.8502 8.43754 12.4121 8.43752 13.086 8.4375H13.164C13.8378 8.43752 14.3998 8.43754 14.8459 8.37757C15.3167 8.31427 15.7418 8.17501 16.0834 7.83341C16.425 7.49181 16.5643 7.06671 16.6276 6.59586C16.6875 6.14978 16.6875 5.58787 16.6875 4.91402V4.83601C16.6875 4.16216 16.6875 3.60022 16.6276 3.15414C16.5643 2.6833 16.425 2.2582 16.0834 1.91659C15.7418 1.57499 15.3167 1.43574 14.8459 1.37244C14.3998 1.31246 13.8379 1.31248 13.164 1.3125H13.086ZM10.9621 2.71209C11.0598 2.61435 11.208 2.53394 11.554 2.4874C11.9163 2.4387 12.402 2.4375 13.125 2.4375C13.848 2.4375 14.3337 2.4387 14.696 2.4874C15.0421 2.53394 15.1902 2.61435 15.2879 2.71209C15.3857 2.80983 15.4661 2.95795 15.5126 3.30405C15.5613 3.66632 15.5625 4.15199 15.5625 4.875C15.5625 5.59801 15.5613 6.08368 15.5126 6.44596C15.4661 6.79205 15.3857 6.94018 15.2879 7.03791C15.1902 7.13565 15.0421 7.21607 14.696 7.2626C14.3337 7.31131 13.848 7.3125 13.125 7.3125C12.402 7.3125 11.9163 7.31131 11.554 7.2626C11.208 7.21607 11.0598 7.13565 10.9621 7.03791C10.8644 6.94018 10.7839 6.79205 10.7374 6.44596C10.6887 6.08368 10.6875 5.59801 10.6875 4.875C10.6875 4.15199 10.6887 3.66632 10.7374 3.30405C10.7839 2.95795 10.8644 2.80983 10.9621 2.71209Z"
                          fill=""
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => setProductStyle("list")}
                      aria-label="button for product list tab"
                      className={`${
                        productStyle === "list"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      <svg
                        className="fill-current"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M4.4234 0.899903C3.74955 0.899882 3.18763 0.899864 2.74155 0.959838C2.2707 1.02314 1.8456 1.16239 1.504 1.504C1.16239 1.8456 1.02314 2.2707 0.959838 2.74155C0.899864 3.18763 0.899882 3.74953 0.899903 4.42338V4.5014C0.899882 5.17525 0.899864 5.73718 0.959838 6.18326C1.02314 6.65411 1.16239 7.07921 1.504 7.42081C1.8456 7.76241 2.2707 7.90167 2.74155 7.96497C3.18763 8.02495 3.74953 8.02493 4.42339 8.02491H4.5014C5.17525 8.02493 14.7372 8.02495 15.1833 7.96497C15.6541 7.90167 16.0792 7.76241 16.4208 7.42081C16.7624 7.07921 16.9017 6.65411 16.965 6.18326C17.0249 5.73718 17.0249 5.17527 17.0249 4.50142V4.42341C17.0249 3.74956 17.0249 3.18763 16.965 2.74155C16.9017 2.2707 16.7624 1.8456 16.4208 1.504C16.0792 1.16239 15.6541 1.02314 15.1833 0.959838C14.7372 0.899864 5.17528 0.899882 4.50142 0.899903H4.4234ZM2.29949 2.29949C2.39723 2.20175 2.54535 2.12134 2.89145 2.07481C3.25373 2.0261 3.7394 2.0249 4.4624 2.0249C5.18541 2.0249 14.6711 2.0261 15.0334 2.07481C15.3795 2.12134 15.5276 2.20175 15.6253 2.29949C15.7231 2.39723 15.8035 2.54535 15.85 2.89145C15.8987 3.25373 15.8999 3.7394 15.8999 4.4624C15.8999 5.18541 15.8987 5.67108 15.85 6.03336C15.8035 6.37946 15.7231 6.52758 15.6253 6.62532C15.5276 6.72305 15.3795 6.80347 15.0334 6.85C14.6711 6.89871 5.18541 6.8999 4.4624 6.8999C3.7394 6.8999 3.25373 6.89871 2.89145 6.85C2.54535 6.80347 2.39723 6.72305 2.29949 6.62532C2.20175 6.52758 2.12134 6.37946 2.07481 6.03336C2.0261 5.67108 2.0249 5.18541 2.0249 4.4624C2.0249 3.7394 2.0261 3.25373 2.07481 2.89145C2.12134 2.54535 2.20175 2.39723 2.29949 2.29949Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M4.4234 9.1499H4.5014C5.17526 9.14988 14.7372 9.14986 15.1833 9.20984C15.6541 9.27314 16.0792 9.41239 16.4208 9.754C16.7624 10.0956 16.9017 10.5207 16.965 10.9915C17.0249 11.4376 17.0249 11.9995 17.0249 12.6734V12.7514C17.0249 13.4253 17.0249 13.9872 16.965 14.4333C16.9017 14.9041 16.7624 15.3292 16.4208 15.6708C16.0792 16.0124 15.6541 16.1517 15.1833 16.215C14.7372 16.2749 5.17529 16.2749 4.50145 16.2749H4.42341C3.74957 16.2749 3.18762 16.2749 2.74155 16.215C2.2707 16.1517 1.8456 16.0124 1.504 15.6708C1.16239 15.3292 1.02314 14.9041 0.959838 14.4333C0.899864 13.9872 0.899882 13.4253 0.899903 12.7514V12.6734C0.899882 11.9996 0.899864 11.4376 0.959838 10.9915C1.02314 10.5207 1.16239 10.0956 1.504 9.754C1.8456 9.41239 2.2707 9.27314 2.74155 9.20984C3.18763 9.14986 3.74955 9.14988 4.4234 9.1499ZM2.89145 10.3248C2.54535 10.3713 2.39723 10.4518 2.29949 10.5495C2.20175 10.6472 2.12134 10.7954 2.07481 11.1414C2.0261 11.5037 2.0249 11.9894 2.0249 12.7124C2.0249 13.4354 2.0261 13.9211 2.07481 14.2834C2.12134 14.6295 2.20175 14.7776 2.29949 14.8753C2.39723 14.9731 2.54535 15.0535 2.89145 15.1C3.25373 15.1487 3.7394 15.1499 4.4624 15.1499C5.18541 15.1499 14.6711 15.1487 15.0334 15.1C15.3795 15.0535 15.5276 14.9731 15.6253 14.8753C15.7231 14.7776 15.8035 14.6295 15.85 14.2834C15.8987 13.9211 15.8999 13.4354 15.8999 12.7124C15.8999 11.9894 15.8987 11.5037 15.85 11.1414C15.8035 10.7954 15.7231 10.6472 15.6253 10.5495C15.5276 10.4518 15.3795 10.3713 15.0334 10.3248C14.6711 10.2761 5.18541 10.2749 4.4624 10.2749C3.7394 10.2749 3.25373 10.2761 2.89145 10.3248Z"
                          fill=""
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* <!-- Products Grid Tab Content Start --> */}
              <div
                className={`${
                  productStyle === "grid"
                    ? "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-7 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-5 xl:gap-y-8 2xl:gap-x-6"
                    : "flex flex-col gap-7.5"
                }`}
              >
                {visibleProducts.map((item) =>
                  productStyle === "grid" ? (
                    <SingleGridItem item={item} key={item.id} />
                  ) : (
                    <SingleListItem item={item} key={item.id} />
                  )
                )}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isDisabled={isFetching}
                className="mt-10"
              />
              {/* <!-- Products Grid Tab Content End --> */}
            </div>
            {/* // <!-- Content End --> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;

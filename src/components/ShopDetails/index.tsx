"use client";
import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Newsletter from "../Common/Newsletter";
import RecentlyViewdItems from "./RecentlyViewd";
import DotSpinner from "../Common/DotSpinner";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useRouter } from "next/navigation";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchProduct, submitProductReview } from "@/services/api";
import { updateproductDetails } from "@/redux/features/product-details";
import {
  Product,
  ProductAttribute,
  ProductAttributeValue,
  ProductVariant,
  ProductReview,
} from "@/types/product";
import { formatCurrency } from "@/lib/currency";
import toast from "react-hot-toast";

type ShopDetailsProps = {
  slug?: string;
};

function getComparableImageKey(src?: string) {
  if (!src) {
    return "";
  }

  try {
    const parsed = new URL(src, window.location.origin);

    return parsed.pathname.replace(/^\/storage\//, "/").replace(/^\/+/, "/");
  } catch {
    return src.replace(/^https?:\/\/[^/]+/, "").replace(/^\/storage\//, "/").replace(/^\/+/, "/");
  }
}

function findMatchingVariant(
  variants: ProductVariant[] | undefined,
  selectedAttributes: Record<string, string>
) {
  return variants?.find((variant) => {
    if (variant.is_active === false) {
      return false;
    }

    const variantEntries = Object.entries(variant.options || {}).filter(([, value]) => value);

    return (
      variantEntries.length > 0 &&
      variantEntries.every(([key, value]) => selectedAttributes[key] === value)
    );
  });
}

function getActiveVariantOptions(variants: ProductVariant[] | undefined) {
  return (variants || []).filter(
    (variant) =>
      variant.is_active !== false &&
      Object.keys(variant.options || {}).length > 0
  );
}

const ShopDetails = ({ slug }: ShopDetailsProps) => {
  const { openPreviewModal } = usePreviewSlider();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [previewImg, setPreviewImg] = useState(0);

  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);

  const [activeTab, setActiveTab] = useState("tabOne");

  const tabs = [
    {
      id: "tabOne",
      title: "Description",
    },
    {
      id: "tabTwo",
      title: "Additional Information",
    },
    {
      id: "tabThree",
      title: "Reviews",
    },
  ];

  const productFromStorage = useAppSelector(
    (state) => state.productDetailsReducer.value
  );
  const [storedProduct, setStoredProduct] = useState<Product | null>(null);
  const [isProductLoading, setIsProductLoading] = useState(Boolean(slug));
  const [productError, setProductError] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const product = slug
    ? storedProduct || productFromStorage
    : productFromStorage.id
      ? productFromStorage
      : storedProduct || productFromStorage;
  const specifications = product.specifications?.length
    ? product.specifications
    : [product.description || "Product details will be updated soon."];
  const careInstructions = product.care_instructions?.length
    ? product.care_instructions
    : ["Keep the product clean and store it safely when not in use."];
  const additionalInformation = product.additional_information?.length
    ? product.additional_information
    : [
        { label: "Category", value: product.category?.title || "General" },
        { label: "Brand", value: product.brand?.title || "Unassigned" },
        { label: "Model", value: product.title },
        { label: "Warranty", value: "Standard seller warranty" },
      ];
  const customerReviews = product.customer_reviews || [];
  const activeVariant = useMemo(
    () => findMatchingVariant(product.variants, selectedAttributes),
    [product.variants, selectedAttributes]
  );
  const activeVariantOptions = useMemo(
    () => getActiveVariantOptions(product.variants),
    [product.variants]
  );
  const displayPrice = activeVariant?.price ?? product.price;
  const displayDiscountedPrice = activeVariant?.discounted_price ?? product.discountedPrice;
  const displaySku = activeVariant?.sku || product.sku;
  const displayStock = activeVariant ? activeVariant.stock ?? 0 : product.stock ?? null;
  const activeVariantImage = activeVariant?.image || "";
  const activeProductImage = activeVariantImage || product.imgs?.previews?.[previewImg] || "";
  const hasVariantPricing = activeVariantOptions.length > 0;
  const isCombinationAvailable = !hasVariantPricing || Boolean(activeVariant);
  const isPurchasable = isCombinationAvailable && displayStock !== 0;

  const isOptionAvailable = (attributeSlug: string, optionValue: string) => {
    if (!activeVariantOptions.length) {
      return true;
    }

    const isVariantAttribute = activeVariantOptions.some(
      (variant) => variant.options?.[attributeSlug]
    );

    if (!isVariantAttribute) {
      return true;
    }

    const nextSelection = {
      ...selectedAttributes,
      [attributeSlug]: optionValue,
    };

    return activeVariantOptions.some((variant) => {
      const options = variant.options || {};

      if (options[attributeSlug] !== optionValue) {
        return false;
      }

      return Object.entries(options).every(
        ([key, value]) => !nextSelection[key] || nextSelection[key] === value
      );
    });
  };

  useEffect(() => {
    const alreadyExist = window.localStorage.getItem("productDetails");

    if (alreadyExist) {
      const parsedProduct = JSON.parse(alreadyExist) as Product;

      if (!slug || parsedProduct.slug === slug || String(parsedProduct.id) === slug) {
        setStoredProduct(parsedProduct);
      }
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      setIsProductLoading(false);
      return;
    }

    if (
      productFromStorage.id &&
      (productFromStorage.slug === slug || String(productFromStorage.id) === slug)
    ) {
      setStoredProduct(productFromStorage);
      setIsProductLoading(false);
      return;
    }

    let isMounted = true;
    setIsProductLoading(true);
    setProductError("");

    fetchProduct(slug)
      .then((freshProduct) => {
        if (!isMounted) {
          return;
        }

        setStoredProduct(freshProduct);
        dispatch(updateproductDetails(freshProduct));
        window.localStorage.setItem("productDetails", JSON.stringify(freshProduct));
      })
      .catch(() => {
        if (isMounted) {
          setProductError("Product not found.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsProductLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dispatch, productFromStorage, slug]);

  useEffect(() => {
    if (product.id) {
      window.localStorage.setItem("productDetails", JSON.stringify(product));
    }
  }, [product]);

  const handleReviewSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!product.id) {
      toast.error("Product is not ready yet.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const comment = String(formData.get("comments") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();

    try {
      setReviewSubmitting(true);
      const response = await submitProductReview(product.slug || product.id, {
        name,
        email,
        rating: reviewRating,
        comment,
      });

      setStoredProduct(response.product);
      dispatch(updateproductDetails(response.product));
      window.localStorage.setItem("productDetails", JSON.stringify(response.product));
      event.currentTarget.reset();
      setReviewRating(5);
      toast.success(response.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    const defaults = Object.fromEntries(
      (product.attributes || [])
        .filter((attribute) => attribute.values?.length > 0)
        .map((attribute) => [attribute.slug, attribute.values[0].value])
    );

    setSelectedAttributes(defaults);
  }, [product.id, product.attributes]);

  // pass the product here when you get the real data.
  const handlePreviewSlider = () => {
    openPreviewModal(product.imgs?.previews || [], previewImg);
  };

  const handleAttributeChange = (
    attribute: ProductAttribute,
    item: ProductAttributeValue
  ) => {
    setSelectedAttributes((current) => ({
      ...current,
      [attribute.slug]: item.value,
    }));

    if (!item.image || !product.imgs?.previews?.length) {
      return;
    }

    const imageKey = getComparableImageKey(item.image);
    let imageIndex = product.imgs.previews.findIndex(
      (preview) => getComparableImageKey(preview) === imageKey
    );

    if (imageIndex < 0) {
      const optionIndex = attribute.values.findIndex((value) => value.value === item.value);
      imageIndex = optionIndex >= 0 ? optionIndex % product.imgs.previews.length : -1;
    }

    if (imageIndex >= 0) {
      setPreviewImg(imageIndex);
    }
  };

  const handleAddToCart = () => {
    if (!isPurchasable) {
      return;
    }

    dispatch(
      addItemToCart({
        ...product,
        sku: displaySku,
        variantSku: activeVariant?.sku,
        selectedAttributes,
        price: displayPrice,
        discountedPrice: displayDiscountedPrice,
        imgs: activeVariantImage
          ? {
            thumbnails: [activeVariantImage],
            previews: [activeVariantImage],
          }
          : product.imgs,
        quantity,
      })
    );
  };

  const handlePurchaseNow = () => {
    if (!isPurchasable) {
      return;
    }

    handleAddToCart();
    router.push("/checkout");
  };

  const handleAddToWishlist = () => {
    dispatch(
      addItemToWishlist({
        ...product,
        quantity: 1,
        status: "available",
      })
    );
  };

  return (
    <>
      <Breadcrumb title={"Product Details"} pages={["product details"]} />

      {isProductLoading ? (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0 py-24">
          <div className="flex items-center justify-center text-center">
            <DotSpinner label="Loading product" />
          </div>
        </div>
      ) : productError ? (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0 py-20 text-center text-red">
          {productError}
        </div>
      ) : product.title === "" ? (
        "Please add product"
      ) : (
        <>
          <section className="overflow-hidden relative pb-20 pt-5 bg-white">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0">
              <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-10">
                <div className="lg:max-w-[527px] w-full">
                  <div className="min-h-[420px] lg:min-h-[525px] rounded-xl border border-gray-3 bg-white p-4 sm:p-7.5 relative flex items-center justify-center">
                    <div>
                      <button
                        onClick={handlePreviewSlider}
                        aria-label="button for zoom"
                        className="gallery__Image w-11 h-11 rounded-[5px] bg-gray-1 shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-blue absolute top-4 lg:top-6 right-4 lg:right-6 z-50"
                      >
                        <svg
                          className="fill-current"
                          width="22"
                          height="22"
                          viewBox="0 0 22 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9.11493 1.14581L9.16665 1.14581C9.54634 1.14581 9.85415 1.45362 9.85415 1.83331C9.85415 2.21301 9.54634 2.52081 9.16665 2.52081C7.41873 2.52081 6.17695 2.52227 5.23492 2.64893C4.31268 2.77292 3.78133 3.00545 3.39339 3.39339C3.00545 3.78133 2.77292 4.31268 2.64893 5.23492C2.52227 6.17695 2.52081 7.41873 2.52081 9.16665C2.52081 9.54634 2.21301 9.85415 1.83331 9.85415C1.45362 9.85415 1.14581 9.54634 1.14581 9.16665L1.14581 9.11493C1.1458 7.43032 1.14579 6.09599 1.28619 5.05171C1.43068 3.97699 1.73512 3.10712 2.42112 2.42112C3.10712 1.73512 3.97699 1.43068 5.05171 1.28619C6.09599 1.14579 7.43032 1.1458 9.11493 1.14581ZM16.765 2.64893C15.823 2.52227 14.5812 2.52081 12.8333 2.52081C12.4536 2.52081 12.1458 2.21301 12.1458 1.83331C12.1458 1.45362 12.4536 1.14581 12.8333 1.14581L12.885 1.14581C14.5696 1.1458 15.904 1.14579 16.9483 1.28619C18.023 1.43068 18.8928 1.73512 19.5788 2.42112C20.2648 3.10712 20.5693 3.97699 20.7138 5.05171C20.8542 6.09599 20.8542 7.43032 20.8541 9.11494V9.16665C20.8541 9.54634 20.5463 9.85415 20.1666 9.85415C19.787 9.85415 19.4791 9.54634 19.4791 9.16665C19.4791 7.41873 19.4777 6.17695 19.351 5.23492C19.227 4.31268 18.9945 3.78133 18.6066 3.39339C18.2186 3.00545 17.6873 2.77292 16.765 2.64893ZM1.83331 12.1458C2.21301 12.1458 2.52081 12.4536 2.52081 12.8333C2.52081 14.5812 2.52227 15.823 2.64893 16.765C2.77292 17.6873 3.00545 18.2186 3.39339 18.6066C3.78133 18.9945 4.31268 19.227 5.23492 19.351C6.17695 19.4777 7.41873 19.4791 9.16665 19.4791C9.54634 19.4791 9.85415 19.787 9.85415 20.1666C9.85415 20.5463 9.54634 20.8541 9.16665 20.8541H9.11494C7.43032 20.8542 6.09599 20.8542 5.05171 20.7138C3.97699 20.5693 3.10712 20.2648 2.42112 19.5788C1.73512 18.8928 1.43068 18.023 1.28619 16.9483C1.14579 15.904 1.1458 14.5696 1.14581 12.885L1.14581 12.8333C1.14581 12.4536 1.45362 12.1458 1.83331 12.1458ZM20.1666 12.1458C20.5463 12.1458 20.8541 12.4536 20.8541 12.8333V12.885C20.8542 14.5696 20.8542 15.904 20.7138 16.9483C20.5693 18.023 20.2648 18.8928 19.5788 19.5788C18.8928 20.2648 18.023 20.5693 16.9483 20.7138C15.904 20.8542 14.5696 20.8542 12.885 20.8541H12.8333C12.4536 20.8541 12.1458 20.5463 12.1458 20.1666C12.1458 19.787 12.4536 19.4791 12.8333 19.4791C14.5812 19.4791 15.823 19.4777 16.765 19.351C17.6873 19.227 18.2186 18.9945 18.6066 18.6066C18.9945 18.2186 19.227 17.6873 19.351 16.765C19.4777 15.823 19.4791 14.5812 19.4791 12.8333C19.4791 12.4536 19.787 12.1458 20.1666 12.1458Z"
                            fill=""
                          />
                        </svg>
                      </button>

                      {activeProductImage && (
                        <Image
                          src={activeProductImage}
                          alt="products-details"
                          width={430}
                          height={430}
                          unoptimized
                          className="max-h-[430px] w-auto object-contain"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-4 overflow-x-auto pb-1">
                    {product.imgs?.thumbnails.map((item, key) => (
                      <button
                        onClick={() => setPreviewImg(key)}
                        key={key}
                        className={`flex shrink-0 items-center justify-center w-20 sm:w-25 h-20 sm:h-25 overflow-hidden rounded-xl bg-white ease-out duration-200 border hover:border-[#ff7a1a] ${key === previewImg
                          ? "border-[#ff7a1a]"
                          : "border-gray-3"
                          }`}
                      >
                        <Image
                          width={50}
                          height={50}
                          src={item}
                          alt="thumbnail"
                          unoptimized
                          className="h-full w-full object-contain p-2"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* <!-- product content --> */}
                <div className="max-w-[780px] w-full">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-2xl sm:text-3xl text-dark">
                      {product.title}
                    </h2>

                    <div className="hidden font-medium text-custom-sm text-white bg-blue rounded py-0.5 px-2.5">
                      30% OFF
                    </div>
                  </div>

                  <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-base text-dark">
                    <span className="text-2xl font-semibold">
                      {formatCurrency(displayDiscountedPrice)}
                    </span>
                    <span className="text-dark-4">(Cash Price)</span>
                    {displayPrice > displayDiscountedPrice && (
                      <span className="text-lg text-dark-4 line-through">{formatCurrency(displayPrice)}</span>
                    )}
                    <span className="hidden h-5 w-px bg-gray-3 sm:block"></span>
                    <span>
                      <strong>Availability:</strong>{" "}
                      <span className={!isCombinationAvailable || displayStock === 0 ? "text-red" : "text-dark"}>
                        {!isCombinationAvailable
                          ? "Not Available"
                          : displayStock === 0
                            ? "Out of Stock"
                            : "In Stock"}
                      </span>
                    </span>
                    {displaySku && (
                      <>
                        <span className="hidden h-5 w-px bg-gray-3 sm:block"></span>
                        <span><strong>Code:</strong> {displaySku}</span>
                      </>
                    )}
                  </div>

                  <div className="hidden flex-wrap items-center gap-5.5 mb-4.5">
                    <div className="flex items-center gap-2.5">
                      {/* <!-- stars --> */}
                      <div className="flex items-center gap-1">
                        <svg
                          className="fill-[#FFA645]"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_375_9172)">
                            <path
                              d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_375_9172">
                              <rect width="18" height="18" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>

                        <svg
                          className="fill-[#FFA645]"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_375_9172)">
                            <path
                              d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_375_9172">
                              <rect width="18" height="18" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>

                        <svg
                          className="fill-[#FFA645]"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_375_9172)">
                            <path
                              d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_375_9172">
                              <rect width="18" height="18" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>

                        <svg
                          className="fill-[#FFA645]"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_375_9172)">
                            <path
                              d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_375_9172">
                              <rect width="18" height="18" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>

                        <svg
                          className="fill-[#FFA645]"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_375_9172)">
                            <path
                              d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_375_9172">
                              <rect width="18" height="18" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>

                      <span> (5 customer reviews) </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_375_9221)">
                          <path
                            d="M10 0.5625C4.78125 0.5625 0.5625 4.78125 0.5625 10C0.5625 15.2188 4.78125 19.4688 10 19.4688C15.2188 19.4688 19.4688 15.2188 19.4688 10C19.4688 4.78125 15.2188 0.5625 10 0.5625ZM10 18.0625C5.5625 18.0625 1.96875 14.4375 1.96875 10C1.96875 5.5625 5.5625 1.96875 10 1.96875C14.4375 1.96875 18.0625 5.59375 18.0625 10.0312C18.0625 14.4375 14.4375 18.0625 10 18.0625Z"
                            fill="#22AD5C"
                          />
                          <path
                            d="M12.6875 7.09374L8.9688 10.7187L7.2813 9.06249C7.00005 8.78124 6.56255 8.81249 6.2813 9.06249C6.00005 9.34374 6.0313 9.78124 6.2813 10.0625L8.2813 12C8.4688 12.1875 8.7188 12.2812 8.9688 12.2812C9.2188 12.2812 9.4688 12.1875 9.6563 12L13.6875 8.12499C13.9688 7.84374 13.9688 7.40624 13.6875 7.12499C13.4063 6.84374 12.9688 6.84374 12.6875 7.09374Z"
                            fill="#22AD5C"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_375_9221">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>

                      <span className={!isCombinationAvailable || displayStock === 0 ? "text-red" : "text-green"}>
                        {!isCombinationAvailable
                          ? "Not Available"
                          : displayStock === 0
                            ? "Out of Stock"
                            : "In Stock"}
                      </span>
                    </div>
                  </div>

                  <h3 className="hidden font-medium text-custom-1 mb-4.5">
                    <span className="text-sm mr-2 sm:text-base text-dark">
                      Price: {formatCurrency(displayDiscountedPrice)}
                    </span>
                    <span className="line-through">
                      {" "}
                      {formatCurrency(displayPrice)}{" "}
                    </span>
                  </h3>
                  {false && displaySku && (
                    <p className="mb-4 text-sm text-dark-4">SKU: {displaySku}</p>
                  )}

                  <ul className="hidden flex-col gap-2">
                    <li className="flex items-center gap-2.5">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.3589 8.35863C13.603 8.11455 13.603 7.71882 13.3589 7.47475C13.1149 7.23067 12.7191 7.23067 12.4751 7.47475L8.75033 11.1995L7.5256 9.97474C7.28152 9.73067 6.8858 9.73067 6.64172 9.97474C6.39764 10.2188 6.39764 10.6146 6.64172 10.8586L8.30838 12.5253C8.55246 12.7694 8.94819 12.7694 9.19227 12.5253L13.3589 8.35863Z"
                          fill="#3C50E0"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.0003 1.04169C5.05277 1.04169 1.04199 5.05247 1.04199 10C1.04199 14.9476 5.05277 18.9584 10.0003 18.9584C14.9479 18.9584 18.9587 14.9476 18.9587 10C18.9587 5.05247 14.9479 1.04169 10.0003 1.04169ZM2.29199 10C2.29199 5.74283 5.74313 2.29169 10.0003 2.29169C14.2575 2.29169 17.7087 5.74283 17.7087 10C17.7087 14.2572 14.2575 17.7084 10.0003 17.7084C5.74313 17.7084 2.29199 14.2572 2.29199 10Z"
                          fill="#3C50E0"
                        />
                      </svg>
                      Free delivery available
                    </li>

                    <li className="flex items-center gap-2.5">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.3589 8.35863C13.603 8.11455 13.603 7.71882 13.3589 7.47475C13.1149 7.23067 12.7191 7.23067 12.4751 7.47475L8.75033 11.1995L7.5256 9.97474C7.28152 9.73067 6.8858 9.73067 6.64172 9.97474C6.39764 10.2188 6.39764 10.6146 6.64172 10.8586L8.30838 12.5253C8.55246 12.7694 8.94819 12.7694 9.19227 12.5253L13.3589 8.35863Z"
                          fill="#3C50E0"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.0003 1.04169C5.05277 1.04169 1.04199 5.05247 1.04199 10C1.04199 14.9476 5.05277 18.9584 10.0003 18.9584C14.9479 18.9584 18.9587 14.9476 18.9587 10C18.9587 5.05247 14.9479 1.04169 10.0003 1.04169ZM2.29199 10C2.29199 5.74283 5.74313 2.29169 10.0003 2.29169C14.2575 2.29169 17.7087 5.74283 17.7087 10C17.7087 14.2572 14.2575 17.7084 10.0003 17.7084C5.74313 17.7084 2.29199 14.2572 2.29199 10Z"
                          fill="#3C50E0"
                        />
                      </svg>
                      Sales 30% Off Use Code: PROMO30
                    </li>
                  </ul>

                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="grid gap-4 md:grid-cols-2 mt-5 mb-5">
                      {(product.attributes || []).map((attribute) => (
                        <DynamicAttributeSelector
                          key={attribute.slug}
                          attribute={attribute}
                          selectedValue={selectedAttributes[attribute.slug]}
                          isOptionAvailable={(item) =>
                            isOptionAvailable(attribute.slug, item.value)
                          }
                          onChange={(item) => handleAttributeChange(attribute, item)}
                        />
                      ))}
                    </div>

                    <div className="mb-3 font-medium text-dark">Select Quantity:</div>
                    <div className="flex flex-wrap items-center gap-4.5">
                      <div className="flex items-center rounded-full bg-gray-2 p-1">
                        <button
                          type="button"
                          aria-label="button for remove product"
                          className="flex items-center justify-center w-9 h-9 rounded-full bg-white ease-out duration-200 hover:text-[#ff7a1a]"
                          onClick={() =>
                            quantity > 1 && setQuantity(quantity - 1)
                          }
                        >
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.33301 10.0001C3.33301 9.53984 3.7061 9.16675 4.16634 9.16675H15.833C16.2932 9.16675 16.6663 9.53984 16.6663 10.0001C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10.0001Z"
                              fill=""
                            />
                          </svg>
                        </button>

                        <span className="flex items-center justify-center w-16 h-9">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          aria-label="button for add product"
                          className="flex items-center justify-center w-9 h-9 rounded-full bg-white ease-out duration-200 hover:text-[#ff7a1a]"
                        >
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.33301 10C3.33301 9.5398 3.7061 9.16671 4.16634 9.16671H15.833C16.2932 9.16671 16.6663 9.5398 16.6663 10C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10Z"
                              fill=""
                            />
                            <path
                              d="M9.99967 16.6667C9.53944 16.6667 9.16634 16.2936 9.16634 15.8334L9.16634 4.16671C9.16634 3.70647 9.53944 3.33337 9.99967 3.33337C10.4599 3.33337 10.833 3.70647 10.833 4.16671L10.833 15.8334C10.833 16.2936 10.4599 16.6667 9.99967 16.6667Z"
                              fill=""
                            />
                          </svg>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handlePurchaseNow}
                        disabled={!isPurchasable}
                        className="inline-flex min-w-[220px] flex-1 items-center justify-center rounded-full bg-[#ff7a1a] py-3 px-7 font-medium text-white ease-out duration-200 hover:bg-[#e86b0c] disabled:cursor-not-allowed disabled:bg-dark-4"
                      >
                        Shop Now
                      </button>

                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!isPurchasable}
                        className="inline-flex min-w-[220px] flex-1 items-center justify-center gap-2 rounded-full border border-gray-4 bg-white py-3 px-7 font-medium text-dark ease-out duration-200 hover:border-[#ff7a1a] hover:text-[#ff7a1a] disabled:cursor-not-allowed disabled:bg-gray-2"
                      >
                        <svg
                          className="fill-current"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M3.25 4C3.25 3.58579 3.58579 3.25 4 3.25H5.55848C6.37688 3.25 7.08472 3.81864 7.2604 4.61838L7.5335 5.8625H19.1845C20.3764 5.8625 21.2264 7.01946 20.8727 8.15767L19.3052 13.2016C19.073 13.9488 18.3815 14.4583 17.599 14.4583H9.2617C8.42362 14.4583 7.70227 13.8677 7.5363 13.0462L5.79552 4.99995C5.77089 4.8815 5.66863 4.75 5.55848 4.75H4C3.58579 4.75 3.25 4.41421 3.25 4ZM7.85498 7.3625L9.00651 12.7473C9.03491 12.8879 9.14272 12.9583 9.2617 12.9583H17.599C17.7251 12.9583 17.8377 12.8762 17.8758 12.7534L19.4433 7.70951C19.4956 7.54114 19.37 7.3625 19.1845 7.3625H7.85498Z"
                            fill=""
                          />
                          <path
                            d="M9.75 19.25C10.4404 19.25 11 18.6904 11 18C11 17.3096 10.4404 16.75 9.75 16.75C9.05964 16.75 8.5 17.3096 8.5 18C8.5 18.6904 9.05964 19.25 9.75 19.25Z"
                            fill=""
                          />
                          <path
                            d="M17.25 19.25C17.9404 19.25 18.5 18.6904 18.5 18C18.5 17.3096 17.9404 16.75 17.25 16.75C16.5596 16.75 16 17.3096 16 18C16 18.6904 16.5596 19.25 17.25 19.25Z"
                            fill=""
                          />
                        </svg>
                        Add To Cart
                      </button>

                      <button
                        type="button"
                        onClick={handleAddToWishlist}
                        className="inline-flex min-w-[220px] flex-1 items-center justify-center gap-2 rounded-full border border-gray-4 bg-white py-3 px-7 font-medium text-dark ease-out duration-200 hover:border-[#ff7a1a] hover:text-[#ff7a1a]"
                      >
                        <svg
                          className="fill-current"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.62436 4.42423C3.96537 5.18256 2.75 6.98626 2.75 9.13713C2.75 11.3345 3.64922 13.0283 4.93829 14.4798C6.00072 15.6761 7.28684 16.6677 8.54113 17.6346C8.83904 17.8643 9.13515 18.0926 9.42605 18.3219C9.95208 18.7366 10.4213 19.1006 10.8736 19.3649C11.3261 19.6293 11.6904 19.75 12 19.75C12.3096 19.75 12.6739 19.6293 13.1264 19.3649C13.5787 19.1006 14.0479 18.7366 14.574 18.3219C14.8649 18.0926 15.161 17.8643 15.4589 17.6346C16.7132 16.6677 17.9993 15.6761 19.0617 14.4798C20.3508 13.0283 21.25 11.3345 21.25 9.13713C21.25 6.98626 20.0346 5.18256 18.3756 4.42423C16.7639 3.68751 14.5983 3.88261 12.5404 6.02077C12.399 6.16766 12.2039 6.25067 12 6.25067C11.7961 6.25067 11.601 6.16766 11.4596 6.02077C9.40166 3.88261 7.23607 3.68751 5.62436 4.42423ZM12 4.45885C9.68795 2.39027 7.09896 2.1009 5.00076 3.05999C2.78471 4.07296 1.25 6.42506 1.25 9.13713C1.25 11.8027 2.3605 13.8361 3.81672 15.4758C4.98287 16.789 6.41022 17.888 7.67083 18.8586C7.95659 19.0786 8.23378 19.2921 8.49742 19.4999C9.00965 19.9037 9.55954 20.3343 10.1168 20.66C10.6739 20.9855 11.3096 21.25 12 21.25C12.6904 21.25 13.3261 20.9855 13.8832 20.66C14.4405 20.3343 14.9903 19.9037 15.5026 19.4999C15.7662 19.2921 16.0434 19.0786 16.3292 18.8586C17.5898 17.888 19.0171 16.789 20.1833 15.4758C21.6395 13.8361 22.75 11.8027 22.75 9.13713C22.75 6.42506 21.2153 4.07296 18.9992 3.05999C16.901 2.1009 14.3121 2.39027 12 4.45885Z"
                            fill=""
                          />
                        </svg>
                        Add To Wishlist
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden bg-gray-2 py-10">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0">
              {/* <!--== tab header start ==--> */}
              <div className="flex flex-wrap items-center bg-white rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6">
                {tabs.map((item, key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(item.id)}
                    className={`font-medium lg:text-lg ease-out duration-200 hover:text-blue relative before:h-0.5 before:bg-blue before:absolute before:left-0 before:bottom-0 before:ease-out before:duration-200 hover:before:w-full ${activeTab === item.id
                      ? "text-blue before:w-full"
                      : "text-dark before:w-0"
                      }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
              {/* <!--== tab header end ==--> */}

              {/* <!--== tab content start ==--> */}
              {/* <!-- tab content one start --> */}
              <div>
                <div
                  className={`flex-col sm:flex-row gap-7.5 xl:gap-12.5 mt-12.5 ${activeTab === "tabOne" ? "flex" : "hidden"
                    }`}
                >
                  <div className="max-w-[670px] w-full">
                    <h2 className="font-medium text-2xl text-dark mb-7">
                      Specifications:
                    </h2>

                    <div className="flex flex-col gap-4">
                      {specifications.map((item, key) => (
                        <p key={key}>{item}</p>
                      ))}
                    </div>
                  </div>

                  <div className="max-w-[447px] w-full">
                    <h2 className="font-medium text-2xl text-dark mb-7">
                      Care & Maintenance:
                    </h2>

                    <div className="flex flex-col gap-4">
                      {careInstructions.map((item, key) => (
                        <p key={key}>{item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* <!-- tab content one end --> */}

              {/* <!-- tab content two start --> */}
              <div>
                <div
                  className={`rounded-xl bg-white shadow-1 p-4 sm:p-6 mt-10 ${activeTab === "tabTwo" ? "block" : "hidden"
                    }`}
                >
                  {additionalInformation.map((item, key) => (
                    <div
                      key={`${item.label}-${key}`}
                      className="rounded-md even:bg-gray-1 flex py-4 px-4 sm:px-5"
                    >
                      <div className="max-w-[450px] min-w-[140px] w-full">
                        <p className="text-sm sm:text-base text-dark">
                          {item.label}
                        </p>
                      </div>
                      <div className="w-full">
                        <p className="text-sm sm:text-base text-dark">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* <!-- tab content two end --> */}

              {/* <!-- tab content three start --> */}
              <div>
                <div
                  className={`flex-col sm:flex-row gap-7.5 xl:gap-12.5 mt-12.5 ${activeTab === "tabThree" ? "flex" : "hidden"
                    }`}
                >
                  <div className="max-w-[570px] w-full">
                    <h2 className="font-medium text-2xl text-dark mb-9">
                      {customerReviews.length.toString().padStart(2, "0")}{" "}
                      Review{customerReviews.length === 1 ? "" : "s"} for this
                      product
                    </h2>

                    <div className="flex flex-col gap-6">
                      {customerReviews.map((review, key) => (
                        <ReviewCard review={review} key={`${review.name}-${key}`} />
                      ))}
                    </div>

                    <div className="hidden">
                      {/* <!-- review item --> */}
                      <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <a href="#" className="flex items-center gap-4">
                            <div className="w-12.5 h-12.5 rounded-full overflow-hidden">
                              <Image
                                src="/images/users/user-01.jpg"
                                alt="author"
                                className="w-12.5 h-12.5 rounded-full overflow-hidden"
                                width={50}
                                height={50}
                              />
                            </div>

                            <div>
                              <h3 className="font-medium text-dark">
                                Davis Dorwart
                              </h3>
                              <p className="text-custom-sm">
                                Serial Entrepreneur
                              </p>
                            </div>
                          </a>

                          <div className="flex items-center gap-1">
                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>
                          </div>
                        </div>

                        <p className="text-dark mt-6">
                          “Lorem ipsum dolor sit amet, adipiscing elit. Donec
                          malesuada justo vitaeaugue suscipit beautiful
                          vehicula’’
                        </p>
                      </div>

                      {/* <!-- review item --> */}
                      <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <a href="#" className="flex items-center gap-4">
                            <div className="w-12.5 h-12.5 rounded-full overflow-hidden">
                              <Image
                                src="/images/users/user-01.jpg"
                                alt="author"
                                className="w-12.5 h-12.5 rounded-full overflow-hidden"
                                width={50}
                                height={50}
                              />
                            </div>

                            <div>
                              <h3 className="font-medium text-dark">
                                Davis Dorwart
                              </h3>
                              <p className="text-custom-sm">
                                Serial Entrepreneur
                              </p>
                            </div>
                          </a>

                          <div className="flex items-center gap-1">
                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>
                          </div>
                        </div>

                        <p className="text-dark mt-6">
                          “Lorem ipsum dolor sit amet, adipiscing elit. Donec
                          malesuada justo vitaeaugue suscipit beautiful
                          vehicula’’
                        </p>
                      </div>

                      {/* <!-- review item --> */}
                      <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <a href="#" className="flex items-center gap-4">
                            <div className="w-12.5 h-12.5 rounded-full overflow-hidden">
                              <Image
                                src="/images/users/user-01.jpg"
                                alt="author"
                                className="w-12.5 h-12.5 rounded-full overflow-hidden"
                                width={50}
                                height={50}
                              />
                            </div>

                            <div>
                              <h3 className="font-medium text-dark">
                                Davis Dorwart
                              </h3>
                              <p className="text-custom-sm">
                                Serial Entrepreneur
                              </p>
                            </div>
                          </a>

                          <div className="flex items-center gap-1">
                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>
                          </div>
                        </div>

                        <p className="text-dark mt-6">
                          “Lorem ipsum dolor sit amet, adipiscing elit. Donec
                          malesuada justo vitaeaugue suscipit beautiful
                          vehicula’’
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="max-w-[550px] w-full">
                    <form onSubmit={handleReviewSubmit}>
                      <h2 className="font-medium text-2xl text-dark mb-3.5">
                        Add a Review
                      </h2>

                      <p className="mb-6">
                        Your email address will not be published. Required
                        fields are marked *
                      </p>

                      <div className="flex items-center gap-3 mb-7.5">
                        <span>Your Rating*</span>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setReviewRating(index + 1)}
                              aria-label={`Set rating ${index + 1}`}
                              className={index < reviewRating ? "text-[#FBB040]" : "text-gray-5"}
                            >
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
                        <div className="mb-5">
                          <label htmlFor="comments" className="block mb-2.5">
                            Comments
                          </label>

                          <textarea
                            name="comments"
                            id="comments"
                            rows={5}
                            required
                            maxLength={250}
                            placeholder="Your comments"
                            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                          ></textarea>

                          <span className="flex items-center justify-between mt-2.5">
                            <span className="text-custom-sm text-dark-4">
                              Maximum
                            </span>
                            <span className="text-custom-sm text-dark-4">
                              0/250
                            </span>
                          </span>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-5 sm:gap-7.5 mb-5.5">
                          <div>
                            <label htmlFor="name" className="block mb-2.5">
                              Name
                            </label>

                            <input
                              type="text"
                              name="name"
                              id="name"
                              required
                              placeholder="Your name"
                              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                            />
                          </div>

                          <div>
                            <label htmlFor="email" className="block mb-2.5">
                              Email
                            </label>

                            <input
                              type="email"
                              name="email"
                              id="email"
                              required
                              placeholder="Your email"
                              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={reviewSubmitting}
                          className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {reviewSubmitting ? "Submitting..." : "Submit Reviews"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              {/* <!-- tab content three end --> */}
              {/* <!--== tab content end ==--> */}
            </div>
          </section>

          <RecentlyViewdItems />

          <Newsletter />
        </>
      )}
    </>
  );
};

function DynamicAttributeSelector({
  attribute,
  selectedValue,
  isOptionAvailable,
  onChange,
}: {
  attribute: ProductAttribute;
  selectedValue?: string;
  isOptionAvailable: (item: ProductAttributeValue) => boolean;
  onChange: (item: ProductAttributeValue) => void;
}) {
  if (!attribute.values?.length) {
    return null;
  }

  const isSwatch = attribute.type === "swatch";

  return (
    <div className="rounded-xl border border-gray-3 bg-white p-4">
      <h4 className="mb-3 font-semibold text-dark">{attribute.name}:</h4>

      <div className="flex flex-wrap items-center gap-2.5">
        {attribute.values.map((item) => {
          const available = isOptionAvailable(item);

          return isSwatch ? (
            <SwatchOption
              key={item.value}
              attribute={attribute}
              item={item}
              selected={selectedValue === item.value}
              disabled={!available}
              onChange={onChange}
            />
          ) : (
            <TextOption
              key={item.value}
              attribute={attribute}
              item={item}
              selected={selectedValue === item.value}
              disabled={!available}
              onChange={onChange}
            />
          );
        })}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12.5 h-12.5 rounded-full overflow-hidden bg-gray-2">
            <Image
              src={review.avatar || "/images/users/user-01.jpg"}
              alt={review.name}
              className="w-12.5 h-12.5 rounded-full overflow-hidden object-cover"
              width={50}
              height={50}
            />
          </div>

          <div>
            <h3 className="font-medium text-dark">{review.name}</h3>
            {review.role && <p className="text-custom-sm">{review.role}</p>}
          </div>
        </div>

        <StarRating rating={review.rating} />
      </div>

      <p className="text-dark mt-6">{review.comment}</p>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={index < rating ? "text-[#FBB040]" : "text-gray-5"}
        >
          <svg
            className="fill-current"
            width="15"
            height="16"
            viewBox="0 0 15 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
              fill=""
            />
          </svg>
        </span>
      ))}
    </div>
  );
}

function SwatchOption({
  attribute,
  item,
  selected,
  disabled,
  onChange,
}: {
  attribute: ProductAttribute;
  item: ProductAttributeValue;
  selected: boolean;
  disabled: boolean;
  onChange: (item: ProductAttributeValue) => void;
}) {
  return (
    <label
      htmlFor={`${attribute.slug}-${item.value}`}
      className={`select-none ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      title={item.label}
    >
      <input
        type="radio"
        name={attribute.slug}
        id={`${attribute.slug}-${item.value}`}
        className="sr-only"
        checked={selected}
        disabled={disabled}
        onChange={() => onChange(item)}
      />
      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
        disabled
          ? "border-gray-3 bg-gray-1 text-dark-4 opacity-60"
          : selected
            ? "border-[#ff7a1a] text-dark"
            : "border-gray-3 text-dark hover:border-[#ff7a1a]"
      }`}>
        <span
          className={`block h-4 w-4 rounded-full border border-gray-3 ${disabled ? "grayscale" : ""}`}
          style={{ backgroundColor: item.color || item.value }}
        />
        {item.label}
      </span>
    </label>
  );
}

function TextOption({
  attribute,
  item,
  selected,
  disabled,
  onChange,
}: {
  attribute: ProductAttribute;
  item: ProductAttributeValue;
  selected: boolean;
  disabled: boolean;
  onChange: (item: ProductAttributeValue) => void;
}) {
  return (
    <label
      htmlFor={`${attribute.slug}-${item.value}`}
      className={`select-none ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <input
        type="radio"
        name={attribute.slug}
        id={`${attribute.slug}-${item.value}`}
        className="sr-only"
        checked={selected}
        disabled={disabled}
        onChange={() => onChange(item)}
      />
      <span className={`inline-flex rounded-full border px-3 py-2 text-sm font-medium transition ${
        disabled
          ? "border-gray-3 bg-gray-1 text-dark-4 opacity-60"
          : selected
            ? "border-[#ff7a1a] text-dark"
            : "border-gray-3 text-dark hover:border-[#ff7a1a]"
      }`}>
        {item.label}
      </span>
    </label>
  );
}

export default ShopDetails;

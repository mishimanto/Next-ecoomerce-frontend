"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchPromoBanners, PromoBannerItem, PromoBanners } from "@/services/api";

const fallbackBanners: PromoBanners = {
  big: [
    {
      id: 1,
      position: "big",
      title: "Apple iPhone 14 Plus",
      headline: "UP TO 30% OFF",
      description: "iPhone 14 has the same superspeedy chip that is in iPhone 13 Pro, A15 Bionic, with a 5-core GPU.",
      button_text: "Buy Now",
      button_url: "/shop",
      image: "/images/promo/promo-01.png",
      background_color: "#F5F5F7",
      button_color: "blue",
    },
  ],
  small_left: [
    {
      id: 2,
      position: "small_left",
      title: "Foldable Motorised Treadmill",
      headline: "Workout At Home",
      highlight_text: "Flat 20% off",
      button_text: "Grab Now",
      button_url: "/shop",
      image: "/images/promo/promo-02.png",
      background_color: "#DBF4F3",
      button_color: "teal",
      highlight_color: "teal",
    },
  ],
  small_right: [
    {
      id: 3,
      position: "small_right",
      title: "Apple Watch Ultra",
      headline: "Up to 40% off",
      description: "The aerospace-grade titanium case strikes the perfect balance of everything.",
      button_text: "Buy Now",
      button_url: "/shop",
      image: "/images/promo/promo-03.png",
      background_color: "#FFECE1",
      button_color: "orange",
      highlight_color: "orange",
    },
  ],
};

const buttonClass: Record<string, string> = {
  blue: "bg-blue hover:bg-blue-dark",
  teal: "bg-teal hover:bg-teal-dark",
  orange: "bg-orange hover:bg-orange-dark",
  dark: "bg-dark hover:bg-blue",
};

const textClass: Record<string, string> = {
  teal: "text-teal",
  orange: "text-orange",
  blue: "text-blue",
  red: "text-red",
};

const PromoBanner = () => {
  const { data } = useQuery({
    queryKey: ["promo-banners"],
    queryFn: fetchPromoBanners,
  });
  const banners = data || fallbackBanners;
  const bigBanner = banners.big[0] || fallbackBanners.big[0];
  const leftBanner = banners.small_left[0] || fallbackBanners.small_left[0];
  const rightBanner = banners.small_right[0] || fallbackBanners.small_right[0];

  return (
    <section className="overflow-hidden bg-[#F8FAFC] py-8 sm:py-10 xl:py-12">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0">
        <BigBanner banner={bigBanner} />

        <div className="grid grid-cols-1 gap-5 sm:gap-7.5 lg:grid-cols-2">
          <SmallLeftBanner banner={leftBanner} />
          <SmallRightBanner banner={rightBanner} />
        </div>
      </div>
    </section>
  );
};

function BigBanner({ banner }: { banner: PromoBannerItem }) {
  return (
    <div
      className="relative z-1 mb-5 overflow-hidden rounded-lg border border-gray-3 px-5 py-6 shadow-1 sm:mb-6 sm:px-7.5 lg:px-12 xl:px-16 xl:py-10"
      style={{ backgroundColor: banner.background_color || "#F5F5F7" }}
    >
      <div className="relative z-10 max-w-[560px] w-full">
        <span className="mb-2 block text-custom-sm font-medium uppercase text-blue">
          {banner.title}
        </span>

        <h2 className="mb-4 text-2xl font-bold leading-tight text-dark lg:text-heading-4 xl:text-heading-3">
          {banner.headline}
        </h2>

        {banner.description && <p className="max-w-[430px] text-dark-3">{banner.description}</p>}

        <BannerButton banner={banner} className="py-[11px] px-9.5 mt-6" />
      </div>

      <Image
        src={banner.image || "/images/promo/promo-01.png"}
        alt={banner.title}
        className="relative z-0 mx-auto mt-6 max-h-[210px] w-auto sm:absolute sm:bottom-0 sm:right-4 sm:mt-0 sm:max-h-[300px] sm:-z-1 lg:right-18 xl:right-26 xl:max-h-none"
        width={274}
        height={350}
        unoptimized={Boolean(banner.image?.startsWith("http"))}
      />
    </div>
  );
}

function SmallLeftBanner({ banner }: { banner: PromoBannerItem }) {
  return (
    <div
      className="relative z-1 overflow-hidden rounded-lg border border-gray-3 px-5 py-7 shadow-1 sm:px-7.5 xl:px-10 xl:py-10"
      style={{ backgroundColor: banner.background_color || "#DBF4F3" }}
    >
      <Image
        src={banner.image || "/images/promo/promo-02.png"}
        alt={banner.title}
        className="absolute top-1/2 left-3 -z-1 max-w-[145px] -translate-y-1/2 opacity-45 sm:left-8 sm:max-w-[220px] sm:opacity-100"
        width={241}
        height={241}
        unoptimized={Boolean(banner.image?.startsWith("http"))}
      />

      <div className="relative z-10 ml-auto max-w-[280px] text-right">
        <span className="mb-1.5 block text-custom-sm font-medium uppercase text-dark-3">
          {banner.title}
        </span>

        <h2 className="mb-2.5 text-2xl font-bold leading-tight text-dark lg:text-heading-4">
          {banner.headline}
        </h2>

        {banner.highlight_text && (
          <p className={`font-semibold text-custom-1 ${textClass[banner.highlight_color || "teal"] || "text-teal"}`}>
            {banner.highlight_text}
          </p>
        )}

        <BannerButton banner={banner} className="py-2.5 px-7 sm:px-8.5 mt-5 sm:mt-6" />
      </div>
    </div>
  );
}

function SmallRightBanner({ banner }: { banner: PromoBannerItem }) {
  return (
    <div
      className="relative z-1 overflow-hidden rounded-lg border border-gray-3 px-5 py-7 shadow-1 sm:px-7.5 xl:px-10 xl:py-10"
      style={{ backgroundColor: banner.background_color || "#FFECE1" }}
    >
      <Image
        src={banner.image || "/images/promo/promo-03.png"}
        alt={banner.title}
        className="absolute top-1/2 right-3 -z-1 max-w-[140px] -translate-y-1/2 opacity-45 sm:right-8.5 sm:max-w-[190px] sm:opacity-100"
        width={200}
        height={200}
        unoptimized={Boolean(banner.image?.startsWith("http"))}
      />

      <div className="relative z-10 max-w-[285px]">
        <span className="mb-1.5 block text-custom-sm font-medium uppercase text-dark-3">
          {banner.title}
        </span>

        <h2 className="mb-2.5 text-2xl font-bold leading-tight text-dark lg:text-heading-4">
          {renderHeadline(banner)}
        </h2>

        {banner.description && (
          <p className="max-w-[285px] text-custom-sm text-dark-3">{banner.description}</p>
        )}

        <BannerButton banner={banner} className="py-2.5 px-7 sm:px-8.5 mt-5 sm:mt-6" />
      </div>
    </div>
  );
}

function BannerButton({ banner, className }: { banner: PromoBannerItem; className: string }) {
  return (
    <Link
      href={banner.button_url || "/shop"}
      className={`inline-flex rounded-md text-custom-sm font-medium text-white duration-200 ${buttonClass[banner.button_color || "blue"] || buttonClass.blue} ${className}`}
    >
      {banner.button_text || "Buy Now"}
    </Link>
  );
}

function renderHeadline(banner: PromoBannerItem) {
  const headline = banner.headline || "";
  const match = headline.match(/(\d+%)/);

  if (!match) {
    return headline;
  }

  const [before, after] = headline.split(match[0]);

  return (
    <>
      {before}
      <span className={textClass[banner.highlight_color || "orange"] || "text-orange"}>{match[0]}</span>
      {after}
    </>
  );
}

export default PromoBanner;

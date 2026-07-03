"use client";

import React from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchHomeHero, HomeHero, HomeHeroItem } from "@/services/api";
import { formatCurrency } from "@/lib/currency";

const fallbackHero: HomeHero = {
  sliders: [
    {
      id: 1,
      type: "slider",
      title: "True Wireless Noise Cancelling Headphone",
      description: "Premium sound with a comfortable fit for everyday listening.",
      badge: "30%",
      label: "Sale Off",
      button_text: "Shop Now",
      button_url: "/shop",
      image: "/images/hero/hero-01.png",
    },
  ],
  promos: [
    {
      id: 2,
      type: "promo",
      title: "iPhone 14 Plus & 14 Pro Max",
      subtitle: "limited time offer",
      button_url: "/shop",
      image: "/images/hero/hero-02.png",
      price: 699,
      old_price: 999,
    },
    {
      id: 3,
      type: "promo",
      title: "Wireless Headphone",
      subtitle: "limited time offer",
      button_url: "/shop",
      image: "/images/hero/hero-01.png",
      price: 699,
      old_price: 999,
    },
  ],
  features: [
    {
      id: 4,
      type: "feature",
      title: "Fast Delivery",
      description: "Inside and outside Narayanganj",
      image: "/images/icons/icon-01.svg",
    },
    {
      id: 5,
      type: "feature",
      title: "Easy Support",
      description: "Order help from admin team",
      image: "/images/icons/icon-02.svg",
    },
    {
      id: 6,
      type: "feature",
      title: "Secure Payments",
      description: "Manual payment verification",
      image: "/images/icons/icon-03.svg",
    },
    {
      id: 7,
      type: "feature",
      title: "Dedicated Support",
      description: "Anywhere & anytime",
      image: "/images/icons/icon-04.svg",
    },
  ],
};

const Hero = () => {
  const { data } = useQuery({
    queryKey: ["home-hero"],
    queryFn: fetchHomeHero,
  });
  const hero = data || fallbackHero;
  const sliders = hero.sliders.length ? hero.sliders : fallbackHero.sliders;
  const promos = hero.promos.length ? hero.promos.slice(0, 2) : fallbackHero.promos;
  const features = hero.features.length ? hero.features : fallbackHero.features;

  return (
    <section className="overflow-hidden border-b border-gray-3 bg-[#F3F7FB] pt-[136px] pb-7 sm:pt-[146px] sm:pb-8 lg:pt-30 lg:pb-10 xl:pt-46 xl:pb-12">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="grid items-stretch gap-4 lg:gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="w-full min-w-0">
            <div className="relative z-1 h-full overflow-hidden rounded-lg border border-gray-3 bg-white shadow-1">
              <Image
                src="/images/hero/hero-bg.png"
                alt="hero bg shapes"
                className="absolute right-0 bottom-0 -z-1 opacity-55"
                width={534}
                height={520}
                loading="eager"
                priority
              />

              <HeroCarousel sliders={sliders} />
            </div>
          </div>

          <div className="w-full min-w-0">
            <div className="flex h-full flex-col sm:flex-row xl:flex-col gap-5">
              {promos.map((promo) => (
                <PromoCard key={promo.id} promo={promo} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <HeroFeature features={features} />
    </section>
  );
};

function PromoCard({ promo }: { promo: HomeHeroItem }) {
  return (
    <Link
      href={promo.button_url || "/shop"}
      className="group relative w-full flex-1 overflow-hidden rounded-lg border border-gray-3 bg-white p-4 shadow-1 transition duration-200 hover:-translate-y-0.5 hover:border-blue/40 hover:shadow-2 sm:p-5 xl:p-6"
    >
      <div className="flex h-full min-h-[178px] items-center justify-between gap-4">
        <div className="relative z-10 min-w-0">
          <p className="mb-2 text-custom-xs font-medium uppercase text-blue">
            {promo.subtitle || "Limited offer"}
          </p>
          <h2 className="max-w-[220px] text-lg font-semibold leading-snug text-dark transition group-hover:text-blue sm:text-xl">
            {promo.title}
          </h2>

          <div className="mt-7 sm:mt-9 xl:mt-11">
            <span className="flex flex-wrap items-center gap-3">
              {promo.price !== null && promo.price !== undefined ? (
                <span className="text-xl font-semibold text-red">
                  {formatCurrency(Number(promo.price))}
                </span>
              ) : null}
              {promo.old_price !== null && promo.old_price !== undefined ? (
                <span className="font-medium text-custom-sm text-dark-4 line-through">
                  {formatCurrency(Number(promo.old_price))}
                </span>
              ) : null}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <Image
            src={promo.image || "/images/hero/hero-01.png"}
            alt={promo.title}
            width={123}
            height={161}
            unoptimized={Boolean(promo.image?.startsWith("http"))}
            className="max-h-[145px] w-auto transition duration-300 group-hover:scale-105"
          />
        </div>
      </div>
    </Link>
  );
}

export default Hero;

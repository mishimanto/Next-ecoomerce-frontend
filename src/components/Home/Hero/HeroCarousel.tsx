"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";
import Link from "next/link";
import { HomeHeroItem } from "@/services/api";

const HeroCarousal = ({ sliders }: { sliders: HomeHeroItem[] }) => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 3500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      {sliders.map((item) => (
        <SwiperSlide key={item.id}>
          <div className="grid min-h-[500px] items-center gap-6 px-4 py-7 sm:min-h-[420px] sm:grid-cols-[minmax(0,1fr)_330px] sm:px-7.5 sm:py-10 lg:min-h-[455px] lg:grid-cols-[minmax(0,1fr)_390px] lg:px-12.5 xl:min-h-[500px]">
            <div className="max-w-[520px]">
              {(item.badge || item.label) && (
                <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-blue/15 bg-blue-light-5 px-3 py-1.5">
                  <span className="font-semibold text-blue">{item.badge}</span>
                  <span className="text-custom-xs font-medium uppercase text-dark">
                    {item.label || "Sale Off"}
                  </span>
                </div>
              )}

              <h1 className="mb-4 text-3xl font-semibold leading-tight text-dark sm:text-heading-4 xl:text-heading-3">
                <Link href={item.button_url || "/shop"}>{item.title}</Link>
              </h1>

              {item.description && (
                <p className="max-w-[440px] text-custom-sm leading-6 text-dark-3 sm:text-base">
                  {item.description}
                </p>
              )}

              <Link
                href={item.button_url || "/shop"}
                className="mt-6 inline-flex items-center justify-center rounded-md bg-dark px-8 py-3 text-custom-sm font-medium text-white duration-200 hover:bg-blue"
              >
                {item.button_text || "Shop Now"}
              </Link>
            </div>

            <div className="flex items-center justify-center">
              <Image
                src={item.image || "/images/hero/hero-01.png"}
                alt={item.title}
                width={351}
                height={358}
                unoptimized={Boolean(item.image?.startsWith("http"))}
                className="max-h-[245px] w-auto object-contain sm:max-h-[315px] xl:max-h-[370px]"
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousal;

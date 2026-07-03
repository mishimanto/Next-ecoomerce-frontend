import React from "react";
import Image from "next/image";
import { HomeHeroItem } from "@/services/api";

const featureData = [
  {
    img: "/images/icons/icon-01.svg",
    title: "Free Shipping",
    description: "For selected store offers",
  },
  {
    img: "/images/icons/icon-02.svg",
    title: "Easy Returns",
    description: "Clear order support",
  },
  {
    img: "/images/icons/icon-03.svg",
    title: "Secure Payments",
    description: "Verified checkout flow",
  },
  {
    img: "/images/icons/icon-04.svg",
    title: "Dedicated Support",
    description: "Help when you need it",
  },
];

type FeatureItem = Partial<HomeHeroItem> & {
  img?: string;
  title: string;
  description?: string | null;
};

const HeroFeature = ({ features = featureData }: { features?: FeatureItem[] }) => {
  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0">
      <div className="mt-6 grid grid-cols-1 gap-3 rounded-lg border border-gray-3 bg-white p-4 shadow-1 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-4 xl:mt-8">
        {features.map((item, key) => (
          <div
            className="flex items-center gap-3 border-gray-3 lg:border-r lg:pr-4 last:border-r-0"
            key={item.id ?? key}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-light-5">
              <Image
                src={item.image || item.img || "/images/icons/icon-01.svg"}
                alt=""
                width={30}
                height={30}
                unoptimized={Boolean(item.image?.startsWith("http"))}
              />
            </span>

            <div>
              <h3 className="font-medium text-custom-sm text-dark">{item.title}</h3>
              <p className="text-custom-xs text-dark-4">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;

"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const CounDown = () => {
  const deadline = useMemo(() => Date.now() + 1000 * 60 * 60 * 24 * 21, []);
  const [timeLeft, setTimeLeft] = useState({ days: 21, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const time = Math.max(0, deadline - Date.now());

      setTimeLeft({
        days: Math.floor(time / (1000 * 60 * 60 * 24)),
        hours: Math.floor((time / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((time / 1000 / 60) % 60),
        seconds: Math.floor((time / 1000) % 60),
      });
    };

    update();
    const interval = window.setInterval(update, 1000);

    return () => window.clearInterval(interval);
  }, [deadline]);

  return (
    <section className="overflow-hidden bg-[#F8FAFC] py-8 sm:py-10 xl:py-12">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative z-1 overflow-hidden rounded-lg border border-gray-3 bg-[#EAF6F8] p-5 shadow-1 sm:p-7 lg:p-8 xl:p-10">
          <div className="relative z-10 max-w-[430px] w-full">
            <span className="mb-2.5 block text-custom-sm font-medium uppercase text-blue">
              Limited Deal
            </span>

            <h2 className="mb-3 text-2xl font-bold leading-tight text-dark lg:text-heading-4 xl:text-heading-3">
              Upgrade Your Everyday Tech
            </h2>            

            <div className="mt-5 flex flex-wrap gap-3 sm:gap-5">
              <TimeBox value={timeLeft.days} label="Days" />
              <TimeBox value={timeLeft.hours} label="Hours" />
              <TimeBox value={timeLeft.minutes} label="Minutes" />
              <TimeBox value={timeLeft.seconds} label="Seconds" />
            </div>

            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-md bg-blue px-9.5 py-3 text-custom-sm font-medium text-white duration-200 hover:bg-blue-dark"
            >
              Shop Deals
            </Link>
          </div>

          <Image
            src="/images/countdown/countdown-bg.png"
            alt=""
            className="hidden sm:block absolute right-0 bottom-0 -z-1 opacity-80"
            width={737}
            height={482}
          />
          <Image
            src="/images/countdown/countdown-01.png"
            alt="Featured deal product"
            className="hidden lg:block absolute right-4 xl:right-33 bottom-4 xl:bottom-10 -z-1"
            width={411}
            height={376}
          />
        </div>
      </div>
    </section>
  );
};

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <span className="mb-2 flex h-13 min-w-[58px] items-center justify-center rounded-md bg-white px-3 text-xl font-semibold text-dark shadow-1 sm:h-14.5 sm:min-w-[64px] sm:px-4 lg:text-3xl">
        {value < 10 ? `0${value}` : value}
      </span>
      <span className="block text-center text-custom-sm text-dark">{label}</span>
    </div>
  );
}

export default CounDown;

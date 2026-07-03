"use client";

import { useState } from "react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { formatCurrency } from "@/lib/currency";

type PriceDropdownProps = {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
};

const PriceDropdown = ({ min, max, value, onChange }: PriceDropdownProps) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const isDisabled = max <= min;

  return (
    <div className="border-b border-gray-3 bg-white xl:mt-0 xl:rounded-lg xl:border-0 xl:shadow-1">
      <div
        onClick={(event) => {
          event.preventDefault();
          setToggleDropdown(!toggleDropdown);
        }}
        className="cursor-pointer flex items-center justify-between py-4 xl:py-3 xl:pl-6 xl:pr-5.5"
      >
        <p className="font-semibold text-dark xl:font-medium">Price Range</p>
        <button
          type="button"
          aria-label="button for price dropdown"
          className={`text-dark ease-out duration-200 ${
            toggleDropdown && "rotate-180"
          }`}
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      <div
        className={`${
          toggleDropdown ? "flex" : "hidden"
        } flex-col gap-5 pb-5 xl:py-6 xl:px-6`}
      >
        <RangeSlider
          min={min}
          max={max}
          step={1}
          value={value}
          disabled={isDisabled}
          onInput={(nextValue: number[]) =>
            onChange([nextValue[0], nextValue[1]])
          }
        />

        <p className="text-custom-sm">
          Price:{" "}
          <span className="text-dark">
            {formatCurrency(value[0])} - {formatCurrency(value[1])}
          </span>
        </p>
      </div>
    </div>
  );
};

export default PriceDropdown;

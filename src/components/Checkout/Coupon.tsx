"use client";
import React, { useState } from "react";

type CouponProps = {
  appliedCode?: string | null;
  isApplying?: boolean;
  message?: string;
  onApply: (code: string) => void;
  onRemove: () => void;
};

const Coupon = ({
  appliedCode,
  isApplying = false,
  message = "",
  onApply,
  onRemove,
}: CouponProps) => {
  const [code, setCode] = useState("");

  const handleApply = () => {
    onApply(code);
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Have any Coupon Code?</h3>
      </div>

      <div className="py-8 px-4 sm:px-8.5">
        <div className="flex gap-4">
          <input
            type="text"
            name="coupon"
            id="coupon"
            placeholder="Enter coupon code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            disabled={isApplying || Boolean(appliedCode)}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />

          {appliedCode ? (
            <button
              type="button"
              onClick={() => {
                setCode("");
                onRemove();
              }}
              className="inline-flex font-medium text-white bg-red py-3 px-6 rounded-md ease-out duration-200 hover:opacity-90"
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApply}
              disabled={isApplying}
              className="inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:cursor-not-allowed disabled:bg-dark-5"
            >
              {isApplying ? "Applying..." : "Apply"}
            </button>
          )}
        </div>
        {appliedCode && (
          <p className="mt-3 text-custom-sm text-green">
            Coupon {appliedCode} applied.
          </p>
        )}
        {message && <p className="mt-3 text-custom-sm text-dark-4">{message}</p>}
      </div>
    </div>
  );
};

export default Coupon;

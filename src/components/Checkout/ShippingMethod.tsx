import React from "react";
import { formatCurrency } from "@/lib/currency";

type ShippingMethodProps = {
  storeDistrict: string;
  deliveryArea: string;
  shippingTotal: number;
};

const ShippingMethod = ({
  storeDistrict,
  deliveryArea,
  shippingTotal,
}: ShippingMethodProps) => {
  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Delivery Charge</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="rounded-md border border-gray-3 bg-gray-1 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-dark">
                {deliveryArea === "inside_district"
                  ? `Inside ${storeDistrict}`
                  : `Outside ${storeDistrict}`}
              </p>
              <p className="mt-1 text-custom-xs text-dark-4">
                Delivery charge is calculated from the delivery city.
              </p>
            </div>
            <p className="font-semibold text-dark">{formatCurrency(shippingTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingMethod;

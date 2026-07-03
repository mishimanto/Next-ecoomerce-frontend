import React from "react";
import { CheckoutPaymentMethod } from "@/services/api";
import Image from "next/image";

type PaymentMethodProps = {
  payment: string;
  methods: CheckoutPaymentMethod[];
  onPaymentChange: (payment: string) => void;
};

const PaymentMethod = ({
  payment,
  methods,
  onPaymentChange,
}: PaymentMethodProps) => {
  if (methods.length === 0) {
    return (
      <div className="bg-white shadow-1 rounded-[10px] mt-7.5 p-4 sm:p-8.5">
        <p className="text-red">No payment method is available right now.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Payment Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-3">
          {methods.map((method) => (
            <label
              key={method.code}
              htmlFor={method.code}
              className="flex cursor-pointer select-none items-start gap-4"
            >
              <div className="relative mt-5">
                <input
                  type="radio"
                  name="paymentMethod"
                  id={method.code}
                  value={method.code}
                  checked={payment === method.code}
                  className="sr-only"
                  onChange={() => onPaymentChange(method.code)}
                />
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full ${
                    payment === method.code
                      ? "border-4 border-blue"
                      : "border border-gray-4"
                  }`}
                ></div>
              </div>

              <div
                className={`w-full rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none ${
                  payment === method.code
                    ? "border-transparent bg-gray-2"
                    : " border-gray-4 shadow-1"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-dark">{method.title}</p>
                    <p className="mt-1 text-custom-xs text-dark-4">
                      {method.type === "manual_cod" || method.code === "cod"
                        ? "Pay delivery charge now, product price on delivery."
                        : "Pay the full order amount before processing."}
                    </p>
                    {method.payment_systems?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {method.payment_systems.map((system) => (
                          <span
                            key={system.code}
                            className="inline-flex items-center gap-2 rounded-md border border-gray-3 bg-white px-2.5 py-1.5 text-custom-xs font-medium text-dark"
                          >
                            {system.image ? (
                              <Image
                                src={system.image}
                                alt={system.title}
                                className="h-5 w-8 object-contain"
                              />
                            ) : null}
                            {system.title}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-custom-xs text-red">
                        No active payment system is configured.
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-custom-xs font-medium text-blue">
                    Manual
                  </span>
                </div>
              </div>
            </label>
          ))}
        </div>

        <p className="mt-5 rounded-md bg-gray-1 p-4 text-sm text-dark-4">
          Payment instructions and proof upload will be shown after placing the order.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethod;

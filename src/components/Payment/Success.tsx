"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/Common/Breadcrumb";
import DotSpinner from "@/components/Common/DotSpinner";
import { fetchPaymentOrder, PaymentOrder } from "@/services/api";
import { formatCurrency } from "@/lib/currency";

type PaymentSuccessProps = {
  token: string;
};

const errorToastOptions = {
  duration: 3200,
  style: {
    background: "#dc2626",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
    padding: "12px 14px",
  },
};

function humanize(value: string) {
  return value
    .split("_")
    .join(" ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function statusClass(status: string) {
  if (["full_paid", "delivery_charge_paid", "verified", "completed", "delivered"].includes(status)) {
    return "text-green";
  }

  if (["unpaid", "rejected", "cancelled"].includes(status)) {
    return "text-red";
  }

  return "text-yellow-dark";
}

const PaymentSuccess = ({ token }: PaymentSuccessProps) => {
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPaymentOrder = useCallback(() => {
    setIsLoading(true);
    fetchPaymentOrder(token)
      .then(setPaymentOrder)
      .catch((error) => {
        toast.error(
          error instanceof Error ? error.message : "Unable to load order details.",
          errorToastOptions
        );
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  useEffect(() => {
    loadPaymentOrder();
  }, [loadPaymentOrder]);

  const order = paymentOrder?.order;
  const latestSubmission = paymentOrder?.submissions[0];

  return (
    <>
      <Breadcrumb title="Payment Submitted" pages={["payment", "success"]} />
      <section className="overflow-hidden bg-gray-2 py-10">
        <div className="mx-auto w-full max-w-[820px] px-4 sm:px-8 xl:px-0">
          {isLoading ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-[10px] bg-white shadow-1">
              <DotSpinner label="Loading confirmation" />
            </div>
          ) : !paymentOrder || !order ? (
            <div className="rounded-[10px] bg-white p-6 shadow-1">
              <p className="text-red">Order details could not be loaded.</p>
            </div>
          ) : (
            <div className="rounded-[10px] bg-white shadow-1">
              <div className="border-b border-gray-3 p-6 text-center sm:p-8.5">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-light-6 text-3xl font-semibold text-green">
                  ✓
                </span>
                <h1 className="mt-5 text-2xl font-semibold text-dark">
                  Payment information submitted
                </h1>
                {/* <p className="mx-auto mt-2 max-w-[520px] text-dark-4">
                  Thank you. Your payment proof is now waiting for admin
                  verification.
                </p> */}
              </div>

              <div className="p-6 sm:p-8.5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoBox label="Order number" value={order.order_number} />
                  <InfoBox
                    label="Payment status"
                    value={humanize(order.payment_status)}
                    status={order.payment_status}
                  />
                  <InfoBox label="Total" value={formatCurrency(order.total)} />
                  {/* {order.discount_total > 0 && (
                    <InfoBox
                      label={`Coupon${order.coupon_code ? ` (${order.coupon_code})` : ""}`}
                      value={`-${formatCurrency(order.discount_total)}`}
                    />
                  )} */}
                  <InfoBox
                    label="Pay now"
                    value={formatCurrency(order.payable_now)}
                  />
                </div>

                {latestSubmission && (
                  <div className="mt-6 rounded-md border border-gray-3 bg-gray-1 p-5">
                    <p className="mb-3 font-medium text-dark">
                      Payment Details:
                    </p>
                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <SummaryLine
                        label="Method"
                        value={humanize(latestSubmission.payment_method_code)}
                      />
                      <SummaryLine
                        label="Amount"
                        value={formatCurrency(latestSubmission.amount)}
                      />
                      <SummaryLine
                        label="Transaction ID"
                        value={latestSubmission.transaction_id}
                      />
                      <SummaryLine
                        label="Status"
                        value={humanize(latestSubmission.status)}
                        status={latestSubmission.status}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/shop"
                    className="inline-flex flex-1 justify-center rounded-md bg-blue px-6 py-3 font-medium text-white duration-200 hover:bg-blue-dark"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    href="/my-account"
                    className="inline-flex flex-1 justify-center rounded-md bg-gray-1 px-6 py-3 font-medium text-dark duration-200 hover:bg-gray-3"
                  >
                    View My Orders
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

function InfoBox({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: string;
}) {
  return (
    <div className="rounded-md border border-gray-3 bg-gray-1 p-4">
      <p className="text-custom-xs text-dark-4">{label}</p>
      {status ? (
        <p className={`mt-1 font-medium ${statusClass(status)}`}>
          {value}
        </p>
      ) : (
        <p className="mt-1 font-medium text-dark">{value}</p>
      )}
    </div>
  );
}

function SummaryLine({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: string;
}) {
  return (
    <div>
      <p className="text-custom-xs text-dark-4">{label}</p>
      {status ? (
        <p className={`mt-1 break-words font-medium ${statusClass(status)}`}>
          {value}
        </p>
      ) : (
        <p className="mt-1 break-words font-medium text-dark">{value}</p>
      )}
    </div>
  );
}

export default PaymentSuccess;

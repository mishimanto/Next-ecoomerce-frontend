"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/Common/Breadcrumb";
import DotSpinner from "@/components/Common/DotSpinner";
import {
  fetchPaymentOrder,
  PaymentOrder,
  submitPaymentProof,
} from "@/services/api";
import { formatCurrency } from "@/lib/currency";

type PaymentPageProps = {
  token: string;
};

type PaymentChannel = {
  code: string;
  title: string;
  number: string;
  action: string;
  image?: string | null;
  instructions?: string | null;
  color: string;
  soft: string;
};

const successToastOptions = {
  duration: 2600,
  style: {
    background: "#16a34a",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
    padding: "12px 14px",
  },
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

function paymentMethodLabel(value: string) {
  if (value === "cod") {
    return "Cash on Delivery";
  }

  if (value === "full_payment") {
    return "Full Payment";
  }

  return humanize(value);
}

function channelStyle(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("bkash")) {
    return {
      color: "from-[#e2136e] to-[#b80d58]",
      soft: "bg-[#fff0f6] text-[#b80d58]",
    };
  }

  if (normalized.includes("nagad")) {
    return {
      color: "from-[#f97316] to-[#dc2626]",
      soft: "bg-orange-light-5 text-orange-dark",
    };
  }

  if (normalized.includes("rocket")) {
    return {
      color: "from-[#7b1fa2] to-[#4a148c]",
      soft: "bg-[#f5efff] text-[#5b21b6]",
    };
  }

  return {
    color: "from-blue to-blue-dark",
    soft: "bg-blue-light-5 text-blue",
  };
}

function paymentChannelsFromMethod(method?: PaymentOrder["payment_method"]): PaymentChannel[] {
  if (!method) {
    return [];
  }

  return method.payment_systems?.map((system) => {
    const style = channelStyle(system.title);

    return {
      code: system.code,
      title: system.title,
      number: system.account_number || "",
      action: system.payment_action?.trim() || "Payment",
      image: system.image,
      instructions: system.instructions,
      ...style,
    };
  }).filter((channel) => channel.number) || [];
}

function paymentStatusClass(status: string) {
  if (["delivery_charge_paid", "full_paid"].includes(status)) {
    return "bg-green-light-6 text-green";
  }

  if (["unpaid", "rejected"].includes(status)) {
    return "bg-red-light-6 text-red";
  }

  return "bg-yellow-light-4 text-yellow-dark";
}

const Payment = ({ token }: PaymentPageProps) => {
  const router = useRouter();
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentChannel, setPaymentChannel] = useState("");
  const [numberCopied, setNumberCopied] = useState(false);

  const loadPaymentOrder = useCallback(() => {
    setIsLoading(true);
    fetchPaymentOrder(token)
      .then((data) => {
        setPaymentOrder(data);
      })
      .catch((error) => {
        toast.error(
          error instanceof Error ? error.message : "Unable to load payment details.",
          errorToastOptions
        );
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  useEffect(() => {
    loadPaymentOrder();
  }, [loadPaymentOrder]);

  const copyPaymentNumber = async () => {
    if (!selectedPaymentChannel) {
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(selectedPaymentChannel.number);
    } else {
      const input = document.createElement("input");
      input.value = selectedPaymentChannel.number;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }

    setNumberCopied(true);
    window.setTimeout(() => setNumberCopied(false), 1600);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);

    try {
      const response = await submitPaymentProof(token, formData);
      toast.success(response.message, successToastOptions);
      form.reset();
      router.push(`/payment/${token}/success`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to submit payment information.",
        errorToastOptions
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const order = paymentOrder?.order;
  const method = paymentOrder?.payment_method;
  const paymentChannels = paymentChannelsFromMethod(method);
  const selectedPaymentChannel =
    paymentChannels.find((channel) => channel.code === paymentChannel) ||
    paymentChannels[0];
  const isVerified = ["delivery_charge_paid", "full_paid"].includes(
    order?.payment_status || ""
  );

  useEffect(() => {
    if (paymentChannel && paymentChannels.some((channel) => channel.code === paymentChannel)) {
      return;
    }

    if (paymentChannels[0]) {
      setPaymentChannel(paymentChannels[0].code);
      return;
    }

    setPaymentChannel("");
  }, [paymentChannel, paymentChannels]);

  return (
    <>
      <Breadcrumb title="Payment" pages={["payment"]} />
      <section className="overflow-hidden bg-gray-2 py-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 xl:px-0">
          {isLoading ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-[10px] bg-white shadow-1">
              <DotSpinner label="Loading payment details" />
            </div>
          ) : !paymentOrder || !order ? (
            <div className="rounded-[10px] bg-white p-6 shadow-1">
              <p className="text-red">Payment details could not be loaded.</p>
            </div>
          ) : (
            <div className="grid gap-7.5 lg:grid-cols-[1fr_420px]">
              <div className="space-y-7.5">
                <div className="rounded-[10px] bg-white shadow-1">
                  <div className="border-b border-gray-3 px-4 py-5 sm:px-8.5">
                    <h3 className="text-xl font-medium text-dark">
                      Payment Instructions
                    </h3>
                  </div>
                  <div className="p-4 sm:p-8.5">
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-blue-light-5 px-4 py-1.5 text-custom-sm font-medium text-blue">
                        {method?.title || paymentMethodLabel(order.payment_method)}
                      </span>
                      <span
                        className={`rounded-full px-4 py-1.5 text-custom-sm font-medium ${paymentStatusClass(
                          order.payment_status
                        )}`}
                      >
                        {humanize(order.payment_status)}
                      </span>
                    </div>

                    {method?.instructions ? (
                      <p className="mb-5 whitespace-pre-line text-dark">
                        {method.instructions}
                      </p>
                    ) : (
                      <p className="mb-5 text-dark">
                        Complete the payment using the account details below,
                        then submit your transaction information for admin
                        verification.
                      </p>
                    )}

                    <PaymentChannelPicker
                      channels={paymentChannels}
                      selectedCode={paymentChannel}
                      onSelect={setPaymentChannel}
                    />

                    {selectedPaymentChannel ? (
                      <div className="mt-5 overflow-hidden rounded-lg border border-gray-3 bg-gray-1">
                        <div
                          className={`h-1.5 bg-gradient-to-r ${selectedPaymentChannel.color}`}
                        />
                        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-custom-sm font-medium uppercase text-dark-4">
                              {selectedPaymentChannel.action} to this <span className="font-bold">{selectedPaymentChannel.title}</span> account
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-dark">
                              {selectedPaymentChannel.number}
                            </p>
                            {selectedPaymentChannel.instructions ? (
                              <p className="mt-2 whitespace-pre-line text-custom-sm text-dark-4">
                                {selectedPaymentChannel.instructions}
                              </p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={copyPaymentNumber}
                            className={`w-max rounded-md px-4 py-3 border border-gray-5 text-md font-medium transition hover:shadow-1 ${selectedPaymentChannel.soft}`}
                          >
                            {numberCopied ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-lg border border-red/20 bg-red-light-6 p-4 text-red">
                        No payment system is configured for this payment method.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[10px] bg-white shadow-1">
                  <div className="border-b border-gray-3 px-4 py-5 sm:px-8.5">
                    <h3 className="text-xl font-medium text-dark">
                      Submit Payment Details
                    </h3>
                  </div>
                  <form onSubmit={handleSubmit} className="p-4 sm:p-8.5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="hidden">
                        <input
                          type="hidden"
                          name="payment_method_code"
                          value={paymentChannel}
                        />
                      </div>
                      <div>
                        <label className="mb-2.5 block text-dark">
                          Sender Number
                        </label>
                        <input
                          name="sender_number"
                          required
                          className="w-full rounded-md border border-gray-3 bg-gray-1 p-3 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                          placeholder="01XXXXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="mb-2.5 block text-dark">
                          Transaction ID
                        </label>
                        <input
                          name="transaction_id"
                          required
                          className="w-full rounded-md border border-gray-3 bg-gray-1 p-3 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                          placeholder="Txn ID"
                        />
                      </div>
                      <div>
                        <label className="mb-2.5 block text-dark">Amount</label>
                        <input
                          name="amount"
                          type="number"
                          min="1"
                          step="0.01"
                          required
                          defaultValue={order.payable_now}
                          className="w-full rounded-md border border-gray-3 bg-gray-1 p-3 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                        />
                      </div>
                      <div>
                        <label className="mb-2.5 block text-dark">
                          Screenshot (optional)
                        </label>
                        <input
                          name="screenshot"
                          type="file"
                          accept="image/*"
                          className="w-full rounded-md border border-gray-3 bg-gray-1 p-3 text-sm outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || isVerified || !selectedPaymentChannel}
                      className="mt-6 inline-flex w-full justify-center rounded-md bg-blue px-6 py-3 font-medium text-white duration-200 hover:bg-blue-dark disabled:cursor-not-allowed disabled:bg-dark-5"
                    >
                      {isVerified
                        ? "Payment Verified"
                        : isSubmitting
                          ? "Submitting..."
                          : "Submit For Verification"}
                    </button>
                  </form>
                </div>
              </div>

              <aside className="h-max rounded-[10px] bg-white shadow-1">
                <div className="border-b border-gray-3 px-4 py-5 sm:px-8.5">
                  <h3 className="text-xl font-medium text-dark">
                    Order Summary
                  </h3>
                </div>
                <div className="p-4 sm:p-8.5">
                  <div className="mb-5 rounded-md bg-gray-1 p-4">
                    <p className="text-custom-xs text-dark-4">Order number</p>
                    <p className="font-medium text-dark">{order.order_number}</p>
                    <p className="mt-3 text-custom-xs text-dark-4">Email</p>
                    <p className="break-words font-medium text-dark">
                      {order.email}
                    </p>
                  </div>

                  <div className="space-y-3 border-b border-gray-3 pb-5">
                    {order.items.map((item) => (
                      <div
                        key={`${item.title}-${item.quantity}-${item.line_total}`}
                        className="flex justify-between gap-4 text-sm"
                      >
                        <span className="text-dark">
                          {item.title} x {item.quantity}
                        </span>
                        <span className="font-medium text-dark">
                          {formatCurrency(item.line_total)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <SummaryRow label="Subtotal" value={order.subtotal} />
                  {order.discount_total > 0 && (
                    <div className="flex items-center justify-between border-b border-gray-3 py-3 last:border-0">
                      <span className="text-dark">
                        Coupon{order.coupon_code ? ` (${order.coupon_code})` : ""}
                      </span>
                      <span className="text-green">
                        -{formatCurrency(order.discount_total)}
                      </span>
                    </div>
                  )}
                  <SummaryRow label="Shipping" value={order.shipping_total} />
                  <SummaryRow label="Total" value={order.total} strong />
                  <SummaryRow label="Pay now" value={order.payable_now} strong />
                  <SummaryRow
                    label="Due on delivery"
                    value={order.due_on_delivery}
                  />

                  {paymentOrder.submissions.length > 0 && (
                    <div className="mt-5 rounded-md border border-gray-3 p-4">
                      <p className="mb-3 font-medium text-dark">
                        Submitted Payments
                      </p>
                      <div className="space-y-3">
                        {paymentOrder.submissions.map((submission) => (
                          <div
                            key={submission.id}
                            className="border-b border-gray-3 pb-3 last:border-0 last:pb-0"
                          >
                            <div className="flex justify-between gap-4">
                              <span>
                                {humanize(submission.payment_method_code)} -{" "}
                                {formatCurrency(submission.amount)}
                              </span>
                              <span className="font-medium text-dark">
                                {humanize(submission.status)}
                              </span>
                            </div>
                            <p className="mt-1 text-custom-xs text-dark-4">
                              {submission.transaction_id}
                            </p>
                            {submission.admin_note && (
                              <p className="mt-1 text-custom-xs text-red">
                                {submission.admin_note}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    href="/shop"
                    className="mt-5 inline-flex w-full justify-center rounded-md bg-gray-1 px-6 py-3 font-medium text-dark duration-200 hover:bg-gray-3"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

function PaymentChannelPicker({
  channels,
  selectedCode,
  onSelect,
}: {
  channels: PaymentChannel[];
  selectedCode: string;
  onSelect: (code: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 font-medium text-dark">Choose Payment Method</p>
      {channels.length === 0 ? (
        <div className="rounded-lg border border-red/20 bg-red-light-6 p-4 text-sm text-red">
          No active payment system is available for this payment method.
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => {
          const selected = selectedCode === channel.code;

          return (
            <label
              key={channel.code}
              className={`relative flex  cursor-pointer items-center gap-4 overflow-hidden rounded-lg border p-4 transition duration-200 ${
                selected
                  ? "border-transparent bg-white shadow-2 ring-2 ring-blue/20"
                  : "border-gray-3 bg-gray-1 hover:border-blue/40 hover:bg-white"
              }`}
            >
              <input
                type="radio"
                name="payment_channel_picker"
                value={channel.code}
                checked={selected}
                onChange={() => onSelect(channel.code)}
                className="sr-only"
              />
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${channel.color}`}
              />
              {channel.image ? (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center">
                  <Image
                    src={channel.image}
                    alt={channel.title}
                    width={48}
                    height={36}
                    unoptimized
                    className="max-h-9 w-auto object-contain"
                  />
                </span>
              ) : (
                <span className={`flex h-12 w-16 shrink-0 items-center justify-center rounded-md ${channel.soft}`}>
                  {channel.title.slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold text-dark">
                  {channel.title}
                </p>
                {/* <p className="mt-1 break-all text-custom-sm text-dark-4">
                  {channel.number}
                </p> */}
              </div>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  selected ? "border-blue bg-blue" : "border-gray-4 bg-white"
                }`}
              >
                {selected && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-3 py-3 last:border-0">
      <span className={strong ? "font-medium text-dark" : "text-dark"}>
        {label}
      </span>
      <span className={strong ? "font-medium text-dark" : "text-dark"}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

export default Payment;

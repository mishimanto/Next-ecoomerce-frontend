"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";
import {
  removeAllItemsFromCart,
  selectTotalPrice,
} from "@/redux/features/cart-slice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { applyCoupon, createOrder } from "@/services/api";
import { fetchCheckoutConfig, CheckoutConfig } from "@/services/api";
import { getUser } from "@/services/auth";
import { formatCurrency } from "@/lib/currency";

type CheckoutStatus = {
  type: "success" | "error";
  message: string;
} | null;

type CheckoutConfirmation = {
  orderNumber: string;
  email: string;
  subtotal: number;
  shippingTotal: number;
  total: number;
  payableNow: number;
  dueOnDelivery: number;
  paymentStatus: string;
  paymentMethod: string;
  shippingMethod: string;
};

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function splitFullName(name: string) {
  const [firstName = "", ...lastNameParts] = name.trim().split(/\s+/);

  return {
    firstName,
    lastName: lastNameParts.join(" ") || firstName,
  };
}

const Checkout = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const subtotal = useAppSelector(selectTotalPrice);
  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfig | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [currentUser, setCurrentUser] = useState(() => getUser());
  const [billingTown, setBillingTown] = useState(currentUser?.city || "");
  const [shippingTown, setShippingTown] = useState("");
  const [shipToDifferent, setShipToDifferent] = useState(false);
  const [status, setStatus] = useState<CheckoutStatus>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coupon, setCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const billingDefaults = useMemo(() => {
    return {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      address: currentUser?.address || "",
      town: currentUser?.city || "",
      country: currentUser?.country || "",
    };
  }, [currentUser]);
  const deliveryTown = shipToDifferent ? shippingTown : billingTown;
  const storeDistrict = checkoutConfig?.delivery.store_district || "Narayanganj";
  const deliveryArea = deliveryTown.toLowerCase().includes(storeDistrict.toLowerCase())
    ? "inside_district"
    : "outside_narayanganj";
  const shippingTotal = cartItems.length > 0
    ? deliveryArea === "inside_district"
      ? checkoutConfig?.delivery.inside_district_charge || 0
      : checkoutConfig?.delivery.outside_district_charge || 0
    : 0;
  const discountTotal = Math.min(coupon?.discount || 0, subtotal);
  const discountedSubtotal = Math.max(0, subtotal - discountTotal);
  const total = discountedSubtotal + shippingTotal;
  const payableNow = paymentMethod === "cod" ? shippingTotal : total;
  const dueOnDelivery = paymentMethod === "cod" ? discountedSubtotal : 0;
  const paymentMethods = checkoutConfig?.payment_methods || [];

  useEffect(() => {
    const syncUser = () => setCurrentUser(getUser());

    window.addEventListener("auth-changed", syncUser);

    return () => window.removeEventListener("auth-changed", syncUser);
  }, []);

  useEffect(() => {
    if (coupon && subtotal <= 0) {
      setCoupon(null);
      setCouponMessage("");
    }
  }, [coupon, subtotal]);

  const couponItems = () =>
    cartItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      variant_sku: item.variantSku,
      selected_attributes: item.selectedAttributes,
    }));

  const handleApplyCoupon = async (code: string) => {
    const couponCode = code.trim();

    if (!couponCode) {
      setCouponMessage("Please enter a coupon code.");
      return;
    }

    if (cartItems.length === 0) {
      setCouponMessage("Add products before applying a coupon.");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponMessage("");

    try {
      const response = await applyCoupon({
        code: couponCode,
        items: couponItems(),
      });

      setCoupon({
        code: response.coupon.code,
        discount: response.coupon.discount,
      });
      setCouponMessage(response.message);
    } catch (error) {
      setCoupon(null);
      setCouponMessage(
        error instanceof Error ? error.message : "Unable to apply coupon."
      );
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    fetchCheckoutConfig()
      .then((config) => {
        if (!mounted) return;

        setCheckoutConfig(config);
        if (config.payment_methods.length > 0) {
          setPaymentMethod(config.payment_methods[0].code);
        }
      })
      .catch(() => {
        if (mounted) {
          setStatus({
            type: "error",
            message: "Checkout settings could not be loaded.",
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (cartItems.length === 0) {
      setStatus({ type: "error", message: "Your cart is empty." });
      return;
    }

    const formData = new FormData(form);
    const shipToDifferent = formData.has("shipToDifferent");
    setIsSubmitting(true);
    setStatus(null);

    try {
      const billingName = splitFullName(formValue(formData, "name"));
      const response = await createOrder({
        first_name: billingName.firstName,
        last_name: billingName.lastName,
        company_name: formValue(formData, "companyName"),
        country_region: formValue(formData, "countryRegion"),
        address: formValue(formData, "address"),
        apartment: formValue(formData, "apartment"),
        town: formValue(formData, "town"),
        country: formValue(formData, "country"),
        phone: formValue(formData, "phone"),
        email: formValue(formData, "email"),
        notes: formValue(formData, "notes"),
        coupon_code: coupon?.code || "",
        payment_method: paymentMethod,
        shipping_total: shippingTotal,
        ship_to_different: shipToDifferent,
        shipping_country_region: shipToDifferent
          ? formValue(formData, "shippingCountryRegion")
          : "",
        shipping_address: shipToDifferent
          ? formValue(formData, "shippingAddress")
          : "",
        shipping_apartment: shipToDifferent
          ? formValue(formData, "shippingApartment")
          : "",
        shipping_town: shipToDifferent ? formValue(formData, "shippingTown") : "",
        shipping_country: shipToDifferent
          ? formValue(formData, "shippingCountry")
          : "",
        shipping_phone: shipToDifferent
          ? formValue(formData, "shippingPhone")
          : "",
        shipping_email: shipToDifferent
          ? formValue(formData, "shippingEmail")
          : "",
        items: couponItems(),
      });

      dispatch(removeAllItemsFromCart());
      setCoupon(null);
      form.reset();
      router.push(`/payment/${response.order.payment_token}`);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to place order.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-10 bg-gray-2">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit}>
            {status && (
              <div
                role="status"
                className={`mb-5 rounded-md px-5 py-4 shadow-1 ${
                  status.type === "success"
                    ? "bg-green-light-6 text-green"
                    : "bg-red-light-6 text-red"
                }`}
              >
                {status.message}
              </div>
            )}
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                {/* <!-- login box --> */}
                {!currentUser && <Login />}

                {/* <!-- billing details --> */}
                <Billing defaults={billingDefaults} onTownChange={setBillingTown} />

                {/* <!-- address box two --> */}
                <Shipping
                  defaults={billingDefaults}
                  onShippingTownChange={setShippingTown}
                  onShipToDifferentChange={setShipToDifferent}
                />

                {/* <!-- others note box --> */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Other Notes (optional)
                    </label>

                    <textarea
                      name="notes"
                      id="notes"
                      rows={5}
                      placeholder="Notes about your order, e.g. speacial notes for delivery."
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* // <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                {/* <!-- order list box --> */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Your Order
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* <!-- title --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">Product</h4>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark text-right">
                          Subtotal
                        </h4>
                      </div>
                    </div>

                    {cartItems.length > 0 ? (
                      cartItems.map((item) => (
                        <div
                          className="flex items-center justify-between py-5 border-b border-gray-3"
                          key={item.id}
                        >
                          <div>
                            <p className="text-dark">
                              {item.title} x {item.quantity}
                            </p>
                          </div>
                          <div>
                            <p className="text-dark text-right">
                              {formatCurrency(item.discountedPrice * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-between py-5 border-b border-gray-3">
                        <div>
                          <p className="text-dark">Your cart is empty</p>
                        </div>
                      </div>
                    )}

                    {/* <!-- product item --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <p className="text-dark">Shipping Fee</p>
                      </div>
                      <div>
                        <p className="text-dark text-right">
                          {formatCurrency(shippingTotal)}
                        </p>
                      </div>
                    </div>

                    {discountTotal > 0 && (
                      <div className="flex items-center justify-between py-5 border-b border-gray-3">
                        <div>
                          <p className="text-dark">Coupon ({coupon?.code})</p>
                        </div>
                        <div>
                          <p className="text-green text-right">
                            -{formatCurrency(discountTotal)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* <!-- total --> */}
                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <p className="font-medium text-lg text-dark">Total</p>
                      </div>
                      <div>
                        <p className="font-medium text-lg text-dark text-right">
                          {formatCurrency(total)}
                        </p>
                      </div>
                    </div>                    
                  </div>
                </div>

                {/* <!-- coupon box --> */}
                <Coupon
                  appliedCode={coupon?.code}
                  isApplying={isApplyingCoupon}
                  message={couponMessage}
                  onApply={handleApplyCoupon}
                  onRemove={() => {
                    setCoupon(null);
                    setCouponMessage("");
                  }}
                />

                {/* <!-- shipping box --> */}
                <ShippingMethod
                  storeDistrict={storeDistrict}
                  deliveryArea={deliveryArea}
                  shippingTotal={shippingTotal}
                />

                {/* <!-- payment box --> */}
                <PaymentMethod
                  payment={paymentMethod}
                  methods={paymentMethods}
                  onPaymentChange={setPaymentMethod}
                />

                {/* <!-- checkout button --> */}
                <button
                  type="submit"
                  disabled={isSubmitting || cartItems.length === 0 || paymentMethods.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:cursor-not-allowed disabled:bg-dark-5"
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

function humanize(value: string) {
  return value
    .split("_")
    .join(" ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function OrderConfirmation({
  confirmation,
  isLoggedIn,
}: {
  confirmation: CheckoutConfirmation;
  isLoggedIn: boolean;
}) {
  return (
    <div className="bg-white rounded-[10px] shadow-1 p-4 sm:p-8.5">
      <div className="mb-7">
        <span className="inline-flex rounded-md bg-green-light-6 px-4 py-2 text-green font-medium text-custom-sm">
          Order placed successfully
        </span>
        <h2 className="font-medium text-dark text-2xl mt-4 mb-2">
          Thank you for your order.
        </h2>
        <p className="text-dark-4">
          A confirmation has been prepared for {confirmation.email}.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <ConfirmationCard label="Order number" value={confirmation.orderNumber} />
        <ConfirmationCard
          label="Payment"
          value={humanize(confirmation.paymentMethod)}
        />
        <ConfirmationCard
          label="Shipping"
          value={humanize(confirmation.shippingMethod)}
        />
        <ConfirmationCard
          label="Total"
          value={formatCurrency(confirmation.total)}
        />
        <ConfirmationCard
          label="Pay now"
          value={formatCurrency(confirmation.payableNow)}
        />
        <ConfirmationCard
          label="Due on delivery"
          value={formatCurrency(confirmation.dueOnDelivery)}
        />
        <ConfirmationCard
          label="Payment status"
          value={humanize(confirmation.paymentStatus)}
        />
      </div>

      <div className="rounded-md bg-gray-1 p-5 mb-7">
        <div className="flex items-center justify-between pb-3 border-b border-gray-3">
          <span>Subtotal</span>
          <span className="font-medium text-dark">
            {formatCurrency(confirmation.subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-3">
          <span>Shipping</span>
          <span className="font-medium text-dark">
            {formatCurrency(confirmation.shippingTotal)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-3">
          <span className="font-medium text-dark">Total</span>
          <span className="font-medium text-dark text-lg">
            {formatCurrency(confirmation.total)}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/shop"
          className="inline-flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
        >
          Continue Shopping
        </Link>
        {isLoggedIn && (
          <Link
            href="/my-account"
            className="inline-flex justify-center font-medium text-dark bg-gray-1 py-3 px-6 rounded-md ease-out duration-200 hover:bg-gray-3"
          >
            View Orders
          </Link>
        )}
      </div>
    </div>
  );
}

function ConfirmationCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-3 p-4">
      <p className="text-custom-xs text-dark-4 mb-1">{label}</p>
      <p className="font-medium text-dark break-words">{value}</p>
    </div>
  );
}

export default Checkout;

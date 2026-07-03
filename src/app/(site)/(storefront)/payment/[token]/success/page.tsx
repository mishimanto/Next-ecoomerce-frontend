import React from "react";
import PaymentSuccess from "@/components/Payment/Success";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Submitted",
  description: "Review your order and payment submission details.",
};

type PaymentSuccessPageProps = {
  params: Promise<{
    token: string;
  }>;
};

const PaymentSuccessPage = async ({ params }: PaymentSuccessPageProps) => {
  const { token } = await params;

  return (
    <main>
      <PaymentSuccess token={token} />
    </main>
  );
};

export default PaymentSuccessPage;

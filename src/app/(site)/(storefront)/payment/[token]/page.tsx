import React from "react";
import Payment from "@/components/Payment";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment",
  description: "Submit your payment proof for verification.",
};

type PaymentPageProps = {
  params: Promise<{
    token: string;
  }>;
};

const PaymentPage = async ({ params }: PaymentPageProps) => {
  const { token } = await params;

  return (
    <main>
      <Payment token={token} />
    </main>
  );
};

export default PaymentPage;

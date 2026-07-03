import React from "react";
import { Suspense } from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shop",
  description: "Browse products, categories, brands, and current offers.",
};

const ShopPage = () => {
  return (
    <main>
      <Suspense fallback={null}>
        <ShopWithSidebar />
      </Suspense>
    </main>
  );
};

export default ShopPage;

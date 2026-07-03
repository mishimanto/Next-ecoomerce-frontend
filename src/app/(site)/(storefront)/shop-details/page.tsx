import React from "react";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Details",
  description: "View product details, pricing, and availability.",
  // other metadata
};

const ShopDetailsPage = () => {
  redirect("/shop");
};

export default ShopDetailsPage;

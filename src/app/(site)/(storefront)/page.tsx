import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Shop featured products, categories, and latest offers.",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}

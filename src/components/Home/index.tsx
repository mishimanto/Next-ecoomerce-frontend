import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
import PromoBanner from "./PromoBanner";
import BestSeller from "./BestSeller";
import CounDown from "./Countdown";
import Brands from "./Brands";
import Newsletter from "../Common/Newsletter";

const Home = () => {
  return (
    <main className="bg-[#F8FAFC]">
      <Hero />
      <Categories />
      <NewArrival />
      <PromoBanner />
      <BestSeller />
      <CounDown />
      <Brands />
      <Newsletter />
    </main>
  );
};

export default Home;

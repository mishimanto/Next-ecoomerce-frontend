import Signin from "@/components/Auth/Signin";
import React from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your customer account.",
  // other metadata
};

const SigninPage = () => {
  return <Signin />;
};

export default SigninPage;

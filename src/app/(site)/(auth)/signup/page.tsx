import Signup from "@/components/Auth/Signup";
import React from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new customer account.",
  // other metadata
};

const SignupPage = () => {
  return <Signup />;
};

export default SignupPage;

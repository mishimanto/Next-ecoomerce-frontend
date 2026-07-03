import ResetPassword from "@/components/Auth/ResetPassword";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a new account password.",
};

const ResetPasswordPage = () => {
  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
};

export default ResetPasswordPage;

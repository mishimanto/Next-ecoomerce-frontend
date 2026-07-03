import SocialCallback from "@/components/Auth/SocialCallback";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = {
  title: "Google Sign In",
  description: "Complete your Google sign in.",
};

const SocialCallbackPage = () => {
  return (
    <Suspense fallback={<SocialCallbackFallback />}>
      <SocialCallback />
    </Suspense>
  );
};

function SocialCallbackFallback() {
  return (
    <div className="max-w-[570px] w-full rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
      <div className="text-center">
        <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-3">
          Google Sign In
        </h2>
        <p>Signing you in...</p>
      </div>
    </div>
  );
}

export default SocialCallbackPage;

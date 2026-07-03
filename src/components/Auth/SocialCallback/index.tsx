"use client";

import { exchangeSocialLoginCode } from "@/services/auth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const SocialCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error") || searchParams.get("social_error");

    if (error) {
      setStatus("Google sign in failed. Please try again.");
      window.setTimeout(() => router.push("/signin"), 1400);
      return;
    }

    if (!code) {
      setStatus("Google sign in link is missing or expired.");
      window.setTimeout(() => router.push("/signin"), 1400);
      return;
    }

    exchangeSocialLoginCode(code)
      .then((data) => {
        if (data.admin_url) {
          window.location.href = data.admin_url;
          return;
        }

        router.push("/my-account");
      })
      .catch((error) => {
        setStatus(error instanceof Error ? error.message : "Unable to complete Google sign in.");
        window.setTimeout(() => router.push("/signin"), 1800);
      });
  }, [router, searchParams]);

  return (
    <div className="max-w-[570px] w-full rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
      <div className="text-center">
        <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-3">
          Google Sign In
        </h2>
        <p>{status}</p>
      </div>
    </div>
  );
};

export default SocialCallback;

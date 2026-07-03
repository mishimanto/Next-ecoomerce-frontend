"use client";

import { resetPassword } from "@/services/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import PasswordInput from "@/components/Common/PasswordInput";

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setStatus("");

    try {
      await resetPassword({
        email: String(formData.get("email") || ""),
        token: String(formData.get("token") || ""),
        password: String(formData.get("password") || ""),
        password_confirmation: String(formData.get("password_confirmation") || ""),
      });
      setStatus("Password reset successfully. Redirecting to sign in...");
      window.setTimeout(() => router.push("/signin"), 1200);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[570px] w-full rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Choose a New Password
              </h2>
              <p>Enter and confirm your new password</p>
            </div>

            <form onSubmit={handleSubmit}>
              {status && (
                <div className="mb-5 rounded-lg bg-gray-1 px-5 py-3 text-dark">
                  {status}
                </div>
              )}

              <input type="hidden" name="token" value={searchParams.get("token") || ""} />

              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  defaultValue={searchParams.get("email") || ""}
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <PasswordInput
                label="Password"
                name="password"
                id="password"
                placeholder="Enter new password"
                autoComplete="new-password"
              />

              <PasswordInput
                label="Confirm Password"
                name="password_confirmation"
                id="password_confirmation"
                placeholder="Confirm new password"
                autoComplete="new-password"
                wrapperClassName="mb-5.5"
              />

              <button
                type="submit"
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>

              <p className="text-center mt-6">
                Back to
                <Link
                  href="/signin"
                  className="text-dark ease-out duration-200 hover:text-blue pl-2"
                >
                  Sign in
                </Link>
              </p>

              <Link
                href="/"
                className="mt-4 flex justify-center font-medium text-dark-4 ease-out duration-200 hover:text-blue"
              >
                Back to home
              </Link>
            </form>
    </div>
  );
};

export default ResetPassword;

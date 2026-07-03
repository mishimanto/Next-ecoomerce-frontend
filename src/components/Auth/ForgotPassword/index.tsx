"use client";

import { forgotPassword } from "@/services/auth";
import Link from "next/link";
import React, { useState } from "react";

const ForgotPassword = () => {
  const [status, setStatus] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setStatus("");
    setResetUrl("");

    try {
      const data = await forgotPassword(String(formData.get("email") || ""));
      setStatus(data.message);
      setResetUrl(data.reset_url || "");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send reset link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[570px] w-full rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Reset Your Password
              </h2>
              <p>Enter your email below</p>
            </div>

            <form onSubmit={handleSubmit}>
              {status && (
                <div className="mb-5 rounded-lg bg-gray-1 px-5 py-3 text-dark">
                  {status}
                  {resetUrl && (
                    <Link href={resetUrl} className="block text-blue mt-2 break-all">
                      Open reset link
                    </Link>
                  )}
                </div>
              )}

              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter your email"
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5"
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="text-center mt-6">
                Remember your password?
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

export default ForgotPassword;

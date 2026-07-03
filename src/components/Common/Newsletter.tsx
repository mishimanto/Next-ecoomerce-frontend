"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import { submitNewsletterSubscription } from "@/services/api";

type NewsletterProps = {
  variant?: "banner" | "footer";
};

const Newsletter = ({ variant = "banner" }: NewsletterProps) => {
  const siteSettings = useSiteSettings();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const title = siteSettings.newsletter_title || "Get New Drops And Store Offers";
  const text = siteSettings.newsletter_text || "Product launches, deals, and store updates in one useful email.";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await submitNewsletterSubscription(email);
      setEmail("");
      toast.success("Subscribed successfully.", {
        style: { background: "#16a34a", color: "#fff" },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to subscribe.", {
        style: { background: "#dc2626", color: "#fff" },
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (variant === "footer") {
    return (
      <div className="w-full sm:w-auto">
        <h2 className="mb-3 text-custom-1 font-medium text-dark lg:text-right">{title}</h2>
        <p className="mb-4 max-w-[320px] text-custom-sm text-dark-4 lg:ml-auto lg:text-right">{text}</p>

        <form onSubmit={handleSubmit} className="flex w-full max-w-[320px] flex-col gap-3 lg:ml-auto">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            required
            className="rounded-md border border-gray-3 bg-gray-1 px-4 py-3 text-custom-sm outline-none transition placeholder:text-dark-5 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue px-5 py-3 font-medium text-white transition hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <section className="overflow-hidden bg-[#F8FAFC] pb-8 sm:pb-10 xl:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative z-1 overflow-hidden rounded-lg border border-gray-3 bg-dark shadow-1">
          <Image
            src="/images/shapes/newsletter-bg.jpg"
            alt=""
            className="absolute left-0 top-0 -z-1 h-full w-full object-cover opacity-35"
            width={1170}
            height={200}
          />

          <div className="flex flex-col gap-5 px-5 py-7 sm:gap-6 sm:px-7.5 lg:flex-row lg:items-center lg:justify-between xl:px-12.5 xl:py-8">
            <div className="max-w-[500px] w-full">
              <span className="mb-2 block text-custom-sm font-medium uppercase text-blue-light-4">
                Newsletter
              </span>
              <h2 className="mb-2 max-w-[420px] text-2xl font-bold leading-tight text-white sm:text-heading-5">
                {title}
              </h2>
              <p className="max-w-[460px] text-custom-sm text-white/75">{text}</p>
            </div>

            <div className="max-w-[480px] w-full">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-md border border-white/20 bg-white px-5 py-3 text-dark outline-none placeholder:text-dark-4 focus:ring-2 focus:ring-blue-light-4"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex justify-center rounded-md bg-blue px-7 py-3 font-medium text-white duration-200 hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;

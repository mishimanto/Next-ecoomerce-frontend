"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { FiCreditCard, FiDollarSign, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";

const fallbackAccountLinks = [
  { label: "My Account", url: "/my-account" },
  { label: "Cart", url: "/cart" },
  { label: "Wishlist", url: "/wishlist" },
  { label: "Sign In", url: "/signin" },
];

const fallbackQuickLinks = [
  { label: "Shop", url: "/shop" },
  { label: "Contact", url: "/contact" },
  { label: "FAQ", url: "/faq" },
  { label: "Refund Policy", url: "/refund-policy" },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const siteSettings = useSiteSettings();
  const accountLinks = siteSettings.footer_account_links?.length
    ? siteSettings.footer_account_links
    : fallbackAccountLinks;
  const quickLinks = siteSettings.footer_quick_links?.length
    ? siteSettings.footer_quick_links
    : fallbackQuickLinks;
  const socialLinks = siteSettings.footer_social_links?.length
    ? siteSettings.footer_social_links.filter(
        (link) => link.url && link.url.trim() !== "" && link.url.trim() !== "#"
      )
    : [];
  const acceptedPayments = siteSettings.accepted_payments?.length
    ? siteSettings.accepted_payments
    : [];
  const mapAddress = siteSettings.address || "685 Market Street, Las Vegas, LA 95820, United States.";
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`;

  return (
    <footer className="overflow-hidden border-t border-white/10 bg-[#1E293B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 xl:px-0">
        <div className="grid gap-8 py-10 sm:py-12 lg:grid-cols-[minmax(0,1.3fr)_0.7fr_0.7fr_1fr] xl:gap-12">
          <div>
            <Link href="/" className="mb-5 inline-flex h-10 items-center overflow-hidden xl:h-11">
              <Image
                src={siteSettings.logo || "/images/logo/logo.svg"}
                alt={siteSettings.project_name || "Next Commerce"}
                width={180}
                height={44}
                unoptimized
                className="h-10 w-auto max-w-[170px] object-contain xl:h-11 xl:max-w-[190px]"
                style={{ width: "auto" }}
              />
            </Link>

            <p className="mb-5 max-w-[360px] text-custom-sm leading-6 text-white/65">
              {siteSettings.tagline || "A clean ecommerce storefront for everyday products, offers, and fast ordering."}
            </p>

            <ul className="space-y-3 text-custom-sm text-white/75">
              <li className="flex items-start gap-3">
                <FiMapPin className="mt-1 shrink-0 text-blue-200" />
                <span>{mapAddress}</span>
              </li>
              <li>
                <a href={`tel:${siteSettings.support_phone || ""}`} className="flex items-center gap-3 duration-200 hover:text-blue-100">
                  <FiPhone className="shrink-0 text-blue-200" />
                  {siteSettings.support_phone || "(+965) 7492-3477"}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteSettings.support_email || ""}`} className="flex items-center gap-3 duration-200 hover:text-blue-100">
                  <FiMail className="shrink-0 text-blue-200" />
                  {siteSettings.support_email || "support@example.com"}
                </a>
              </li>
            </ul>

            {socialLinks.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={`${link.label}-${link.url}`}
                    href={link.url || "#"}
                    aria-label={`${link.label} social link`}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-white/65 duration-200 hover:border-blue-200 hover:bg-[#2563EB] hover:text-white"
                    target={link.url?.startsWith("http") ? "_blank" : undefined}
                    rel={link.url?.startsWith("http") ? "noreferrer" : undefined}
                  >
                    <SocialIcon icon={link.icon || link.label} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <FooterLinks title="Account" links={accountLinks} />
          <FooterLinks title="Quick Links" links={quickLinks} />

          <div>
            <h2 className="mb-4 text-custom-1 font-medium text-white">Find Us</h2>
            <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-1">
              <iframe
                title={`${siteSettings.project_name || "Store"} location`}
                src={mapUrl}
                className="h-[220px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#0F172A] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-custom-sm font-medium text-white/80">
              &copy; {year}. All rights reserved by {siteSettings.project_name || "Next Commerce"}.
            </p>

            {acceptedPayments.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-custom-sm font-medium text-white/80">We Accept:</p>
                <div className="flex flex-wrap items-center gap-3">
                  {acceptedPayments.map((payment) => (
                    <span
                      key={`${payment.label}-${payment.icon}`}
                      className="flex h-9 items-center rounded-md border border-white/10 bg-white px-2"
                      aria-label={`${payment.label} accepted`}
                      title={payment.label}
                    >
                      <PaymentIcon icon={payment.icon} label={payment.label} />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

function FooterLinks({ title, links }: { title: string; links: Array<{ label: string; url: string }> }) {
  return (
    <div>
      <h2 className="mb-4 text-custom-1 font-medium text-white">{title}</h2>
      <ul className="flex flex-col gap-3 text-custom-sm text-white/65">
        {links.map((link) => (
          <li key={`${link.label}-${link.url}`}>
            <Link className="duration-200 hover:text-blue-100" href={link.url || "/"}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ icon }: { icon: string }) {
  const normalized = icon.toLowerCase();

  if (normalized.includes("instagram")) return <FaInstagram />;
  if (normalized.includes("youtube")) return <FaYoutube />;
  if (normalized.includes("linkedin")) return <FaLinkedinIn />;
  if (normalized === "x" || normalized.includes("twitter")) return <FaXTwitter />;

  return <FaFacebookF />;
}

function PaymentIcon({ icon, label }: { icon: string; label: string }) {
  const normalized = icon.toLowerCase();

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("/")
  ) {
    return <Image src={icon} alt={label} width={80} height={32} unoptimized className="max-h-7 w-auto object-contain" />;
  }

  if (normalized.includes("bkash")) {
    return (
      <Image
        src="https://cdn.brandfetch.io/id_4D40okd/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B"
        alt="bKash"
        width={24}
        height={24}
        className="h-6 w-auto"
      />
    );
  }

  if (normalized.includes("nagad")) {
    return (
      <Image
        src="https://cdn.brandfetch.io/idPKXOsXfF/w/512/h/512/theme/dark/logo.png?c=1dxbfHSJFAPEGdCLU4o5B"
        alt="Nagad"
        width={64}
        height={24}
        className="h-6 w-auto"
      />
    );
  }

  if (normalized.includes("cash")) {
    return (
      <span className="flex items-center gap-2 text-sm font-semibold text-dark">
        <FiDollarSign className="text-green" />
        {label}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2 text-sm font-semibold text-dark">
      <FiCreditCard className="text-blue-600" />
      {label}
    </span>
  );
}

export default Footer;




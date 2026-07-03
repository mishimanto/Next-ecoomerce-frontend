"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchSiteSettings, type SiteSettings } from "@/services/api";

const fallbackSiteSettings: SiteSettings = {
  project_name: "Next Commerce",
  tagline: "Modern ecommerce store",
  support_phone: "(+965) 7492-3477",
  support_email: "support@example.com",
  address: "685 Market Street, Las Vegas, LA 95820, United States.",
  logo: "/images/logo/logo.svg",
  favicon: "/favicon.ico",
  footer_account_links: [
    { label: "My Account", url: "/my-account" },
    { label: "Login / Register", url: "/signin" },
    { label: "Cart", url: "/cart" },
    { label: "Wishlist", url: "/wishlist" },
    { label: "Shop", url: "/shop" },
  ],
  footer_quick_links: [
    { label: "Privacy Policy", url: "/privacy-policy" },
    { label: "Refund Policy", url: "/refund-policy" },
    { label: "Terms of Use", url: "/terms" },
    { label: "FAQ", url: "/faq" },
    { label: "Contact", url: "/contact" },
  ],
  footer_social_links: [
    { label: "Facebook", url: "#", icon: "facebook" },
    { label: "Instagram", url: "#", icon: "instagram" },
    { label: "YouTube", url: "#", icon: "youtube" },
    { label: "LinkedIn", url: "#", icon: "linkedin" },
  ],
  accepted_payments: [
    { label: "bKash", icon: "bkash" },
    { label: "Nagad", icon: "nagad" },
  ],
  newsletter_title: "Newsletter",
  newsletter_text: "Get updates about new products, offers, and store news.",
};

const SiteSettingsContext = createContext<SiteSettings>(fallbackSiteSettings);
const SITE_SETTINGS_CACHE_KEY = "next_commerce_site_settings";

function mergeSettings(settings?: Partial<SiteSettings> | null): SiteSettings {
  return { ...fallbackSiteSettings, ...(settings || {}) };
}

function getCachedSettings() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const cached = window.localStorage.getItem(SITE_SETTINGS_CACHE_KEY);

    return cached ? (JSON.parse(cached) as SiteSettings) : null;
  } catch {
    window.localStorage.removeItem(SITE_SETTINGS_CACHE_KEY);
    return null;
  }
}

export function SiteSettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: SiteSettings | null;
}) {
  const [settings, setSettings] = useState<SiteSettings>(() =>
    mergeSettings(initialSettings || getCachedSettings())
  );

  useEffect(() => {
    let mounted = true;

    fetchSiteSettings()
      .then((data) => {
        if (mounted) {
          const nextSettings = mergeSettings(data);
          setSettings(nextSettings);
          window.localStorage.setItem(
            SITE_SETTINGS_CACHE_KEY,
            JSON.stringify(nextSettings)
          );
        }
      })
      .catch(() => {
        if (mounted) {
          setSettings((current) => current || fallbackSiteSettings);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => settings, [settings]);

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

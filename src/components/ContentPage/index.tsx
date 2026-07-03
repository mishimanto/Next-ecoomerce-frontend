"use client";

import React, { useEffect, useState } from "react";
import { FiCheckCircle, FiChevronRight, FiFileText, FiHelpCircle, FiRefreshCw, FiShield } from "react-icons/fi";
import Breadcrumb from "../Common/Breadcrumb";
import { fetchContentPage, type ContentPage as ContentPageType } from "@/services/api";

const fallbackContent: Record<string, ContentPageType> = {
  "privacy-policy": {
    id: 0,
    title: "Privacy Policy",
    slug: "privacy-policy",
    excerpt: "How we collect, use and protect customer information.",
    content: [
      "We collect only the information needed to process orders, provide support and improve the shopping experience.",
      "Customer information is not sold to third parties. Payment and delivery partners may receive the information required to complete an order.",
      "Customers can contact support to request updates or removal of their account information where applicable.",
    ],
  },
  "refund-policy": {
    id: 0,
    title: "Refund Policy",
    slug: "refund-policy",
    excerpt: "Refund and return rules for completed orders.",
    content: [
      "Refund requests are reviewed after the returned item is received and inspected.",
      "Products must be unused, complete and returned with original packaging unless the item arrived damaged or incorrect.",
      "Approved refunds are processed through the original payment method or store-approved alternative.",
    ],
  },
  terms: {
    id: 0,
    title: "Terms of Use",
    slug: "terms",
    excerpt: "Rules for using this storefront and placing orders.",
    content: [
      "By using this website, customers agree to provide accurate information when placing an order or creating an account.",
      "Product availability, prices and promotions may change without prior notice before an order is confirmed.",
      "Misuse of the website, fraudulent orders or abusive communication may result in account or order restrictions.",
    ],
  },
  faq: {
    id: 0,
    title: "FAQ",
    slug: "faq",
    excerpt: "Common questions about orders, payments and delivery.",
    content: [
      "How can I place an order? Add products to your cart, complete checkout and follow the payment instructions.",
      "How long does delivery take? Delivery time depends on your location and selected shipping method.",
      "Can I track my order? Contact support with your order number for the latest status.",
    ],
  },
};

const pageMeta: Record<
  string,
  {
    eyebrow: string;
    icon: React.ReactNode;
    accent: string;
    light: string;
  }
> = {
  "privacy-policy": {
    eyebrow: "Customer data",
    icon: <FiShield />,
    accent: "text-blue",
    light: "bg-blue-light-5",
  },
  "refund-policy": {
    eyebrow: "Returns and refunds",
    icon: <FiRefreshCw />,
    accent: "text-green",
    light: "bg-green-light-6",
  },
  terms: {
    eyebrow: "Store agreement",
    icon: <FiFileText />,
    accent: "text-blue",
    light: "bg-blue-light-5",
  },
  faq: {
    eyebrow: "Help center",
    icon: <FiHelpCircle />,
    accent: "text-orange",
    light: "bg-orange-light-5",
  },
};

export default function ContentPage({ slug }: { slug: string }) {
  const [page, setPage] = useState<ContentPageType>(fallbackContent[slug]);
  const meta = pageMeta[slug] || pageMeta.terms;
  const relatedPages = Object.values(fallbackContent).filter((item) => item.slug !== slug);

  useEffect(() => {
    let mounted = true;

    fetchContentPage(slug)
      .then((data) => {
        if (mounted) {
          setPage(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setPage(fallbackContent[slug]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  return (
    <>
      <Breadcrumb title={page.title} pages={[page.title]} />

      <section className="bg-gray-2 py-5 lg:py-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 xl:px-0">
          <div className="overflow-hidden rounded-lg border border-gray-3 bg-white shadow-1">
            <div className="border-b border-gray-3 bg-white px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-5 flex items-center">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-md ${meta.accent} text-2xl`}>
                      {meta.icon}
                    </span>
                    <span className="text-sm font-medium uppercase text-dark-4">{meta.eyebrow}</span>
                  </div>

                  {/* <h1 className="text-3xl font-semibold leading-tight text-dark sm:text-4xl lg:text-5xl">
                    {page.title}
                  </h1> */}
                  {page.excerpt && (
                    <p className="px-4 max-w-3xl text-custom-lg leading-7 text-dark-4">{page.excerpt}</p>
                  )}
                </div>

                {/* <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[320px] lg:grid-cols-1">
                  <InfoPill label="Updated" value="Managed from admin" />
                  <InfoPill label="Status" value="Published" />
                </div> */}
              </div>
            </div>

            <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1fr_300px] lg:px-10 lg:py-10">
              <article>
                {slug === "faq" ? (
                  <div className="space-y-4">
                    {page.content.map((item, index) => (
                      <FaqItem key={`${page.slug}-${index}`} text={item} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {page.content.map((paragraph, index) => (
                      <PolicySection key={`${page.slug}-${index}`} text={paragraph} index={index} />
                    ))}
                  </div>
                )}
              </article>

              <aside className="h-max rounded-lg border border-gray-3 bg-gray-1 p-5">
                <h2 className="text-lg font-semibold text-dark">Quick Links</h2>
                <div className="mt-5 space-y-2">
                  {relatedPages.map((item) => (
                    <a
                      key={item.slug}
                      href={`/${item.slug}`}
                      className="flex items-center justify-between rounded-md bg-white px-4 py-3 text-custom-sm font-medium text-dark transition hover:text-blue"
                    >
                      {item.title}
                      <FiChevronRight className="text-dark-4" />
                    </a>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-3 bg-gray-1 px-4 py-3">
      <p className="text-xs font-medium uppercase text-dark-4">{label}</p>
      <p className="mt-1 text-custom-sm font-semibold text-dark">{value}</p>
    </div>
  );
}

function PolicySection({ text, index }: { text: string; index: number }) {
  return (
    <section className="rounded-lg border border-gray-3 bg-white p-5 transition hover:border-blue/30 sm:p-6">
      <div className="flex gap-4">
        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-green-light-6 text-green">
          <FiCheckCircle />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-dark">Section {index + 1}</h2>
          <p className="mt-2 text-custom-sm leading-7 text-dark-4">{text}</p>
        </div>
      </div>
    </section>
  );
}

function FaqItem({ text, index }: { text: string; index: number }) {
  const [question, answer] = splitFaqText(text);

  return (
    <section className="rounded-lg border border-gray-3 bg-white p-5 sm:p-6">
      <div className="flex gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-orange-light-5 text-orange">
          {index + 1}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-dark">{question}</h2>
          {answer && <p className="mt-2 text-custom-sm leading-7 text-dark-4">{answer}</p>}
        </div>
      </div>
    </section>
  );
}

function splitFaqText(text: string) {
  const separatorIndex = text.indexOf("?");

  if (separatorIndex === -1) {
    return [text, ""];
  }

  return [text.slice(0, separatorIndex + 1), text.slice(separatorIndex + 1).trim()];
}

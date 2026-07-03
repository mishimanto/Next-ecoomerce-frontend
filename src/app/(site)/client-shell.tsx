"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import { SiteSettingsProvider } from "../context/SiteSettingsContext";
import type { SiteSettings } from "@/services/api";
import PreviewSliderModal from "@/components/Common/PreviewSlider";
import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import { Toaster } from "react-hot-toast";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

export default function ClientShell({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: SiteSettings | null;
}) {
  const [loading, setLoading] = useState(true);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 1000);

    return () => window.clearTimeout(timeout);
  }, []);

  if (loading) {
    return <PreLoader />;
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ReduxProvider>
          <SiteSettingsProvider initialSettings={initialSettings}>
            <CartModalProvider>
              <ModalProvider>
                <PreviewSliderProvider>
                  <Header />
                  {children}
                  <QuickViewModal />
                  <CartSidebarModal />
                  <PreviewSliderModal />
                  <Toaster position="top-right" />
                </PreviewSliderProvider>
              </ModalProvider>
            </CartModalProvider>
            <Footer />
          </SiteSettingsProvider>
        </ReduxProvider>
      </QueryClientProvider>
      <ScrollToTop />
    </>
  );
}

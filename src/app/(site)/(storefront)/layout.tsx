import ClientShell from "../client-shell";
import { fetchSiteSettings } from "@/services/api";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialSettings = await fetchSiteSettings().catch(() => null);

  return <ClientShell initialSettings={initialSettings}>{children}</ClientShell>;
}

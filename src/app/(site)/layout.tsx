import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import { Metadata } from "next";
import { fetchSiteSettings } from "@/services/api";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await fetchSiteSettings();
    const title = settings.project_name || "Next Commerce";
    const description = settings.tagline || "Modern ecommerce store";

    return {
      title: {
        default: title,
        template: `%s | ${title}`,
      },
      description,
      icons: settings.favicon
        ? {
            icon: settings.favicon,
            shortcut: settings.favicon,
            apple: settings.favicon,
          }
        : undefined,
    };
  } catch {
    return {
      title: {
        default: "Next Commerce",
        template: "%s | Next Commerce",
      },
      description: "Modern ecommerce store",
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning={true}
    >
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}

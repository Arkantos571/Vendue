import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Venudue",
    template: "%s · Venudue",
  },
  description:
    "Venudue — hospitality events management from venue setup to staff rota and mobile operations.",
  openGraph: {
    title: "Venudue",
    description:
      "Hospitality event operations — enquiries, events, rotas, and function sheets in one workspace.",
    url: "https://venudue.app",
    siteName: "Venudue",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Venudue",
    description:
      "Hospitality event operations — enquiries, events, rotas, and function sheets in one workspace.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

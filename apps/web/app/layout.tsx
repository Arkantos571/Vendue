import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
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
    "Venudue — enquiries, events, function sheets and rotas in one calm workspace for hospitality venues.",
  openGraph: {
    title: "Venudue",
    description:
      "Run the room, not the chaos. Hospitality event operations on one screen.",
    url: "https://venudue.app",
    siteName: "Venudue",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Venudue",
    description:
      "Run the room, not the chaos. Hospitality event operations on one screen.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      className={`${inter.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { DM_Sans, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { AuthProvider } from "@/lib/context/AuthContext";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { siteSchemas } from "@/lib/seo/schema";

// Self-hosted by Next.js: no render-blocking request to Google Fonts.
const headingFont = DM_Sans({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-heading", display: "swap" });
const bodyFont = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });

const description =
  "Find verified jobs in Ilorin and Kwara State: Tanke, GRA, Taiwo, Challenge, Fate, Asa Dam and more. Apply online or on WhatsApp, track your applications and message employers. Free for job seekers.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jobs in Ilorin, Kwara State | Illy Jobs",
    template: "%s | Illy Jobs",
  },
  description,
  applicationName: SITE_NAME,
  keywords: [
    "jobs in Ilorin",
    "Ilorin vacancies",
    "jobs in Kwara State",
    "Tanke jobs",
    "GRA Ilorin jobs",
    "teaching jobs in Ilorin",
    "Unilorin student jobs",
    "latest jobs in Ilorin today",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_NG",
    url: "/",
    title: "Jobs in Ilorin, Kwara State | Illy Jobs",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Jobs in Ilorin, Kwara State | Illy Jobs",
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#047857",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NG" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body className="bg-slate-50 text-slate-900 font-sans antialiased flex flex-col min-h-screen">
        <JsonLd data={siteSchemas} />
        <AuthProvider>
          <Navbar />
          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

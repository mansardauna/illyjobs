import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/context/AuthContext";

export const metadata: Metadata = {
  title: {
    default: "Illy Jobs SaaS - Hyper-Local Jobs in Ilorin, Kwara State",
    template: "%s | Illy Jobs Ilorin",
  },
  description:
    "Find verified jobs across Tanke, GRA, Taiwo, Challenge, Fate, Asa Dam, and all of Ilorin City. Direct connections between Kwara employers and qualified local job seekers.",
  keywords: [
    "Jobs in Ilorin",
    "Ilorin vacancies",
    "Tanke jobs",
    "GRA Ilorin jobs",
    "Unilorin jobs",
    "Kwara State polytechnic jobs",
    "Teaching jobs in Ilorin",
    "Tech jobs Kwara",
    "Illy Jobs SaaS",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

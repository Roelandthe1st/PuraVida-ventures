import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Providers from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: "Pura Vida Ventures",
  description: "Portfolio dashboard voor crypto fondsbeheer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className="dark">
      <body className="min-h-screen bg-[#0c0e14]">
        <Providers>
          <Header />
          <main className="mx-auto max-w-[1400px] px-6 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

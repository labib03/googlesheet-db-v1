import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard Generus Bogsel",
  description: "Dashboard Generus Bogsel",
};

import { SessionProvider } from "@/components/providers/session-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${syne.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50`}
      >
        <SessionProvider>
          <main className="animate-in fade-in duration-700 slide-in-from-top-1">
            {children}
          </main>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}

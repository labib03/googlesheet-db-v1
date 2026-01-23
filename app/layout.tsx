import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { DashboardProvider } from "@/context/dashboard-context";

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
        <main className="animate-in fade-in duration-700 slide-in-from-top-1">
          <NuqsAdapter>
            <DashboardProvider>{children}</DashboardProvider>
          </NuqsAdapter>
        </main>
        <Toaster />
      </body>
    </html>
  );
}

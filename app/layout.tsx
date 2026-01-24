import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { DashboardProvider } from "@/context/dashboard-context";
import { InitialTransition } from "@/components/providers/initial-transition";
import { ViewConfigProvider } from "@/context/view-config-context";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.setAttribute('data-preloader', 'active');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${outfit.variable} ${syne.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50`}
      >
        <NuqsAdapter>
          <DashboardProvider>
            <ViewConfigProvider>
              <InitialTransition>
                <main className="animate-in fade-in duration-700 slide-in-from-top-1">
                  {children}
                </main>
              </InitialTransition>
            </ViewConfigProvider>
          </DashboardProvider>
        </NuqsAdapter>
        <Toaster />
      </body>
    </html>
  );
}

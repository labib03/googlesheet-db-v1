"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface SummaryItem {
  label: string;
  count: number;
  key?: string;
  href?: { pathname: string; query?: Record<string, string> };
}

interface SummaryListProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  items: SummaryItem[];
  selectedKey?: string;
  showAsLink?: boolean;
  isKelompok?: boolean;
  isClickable?: boolean;
}

export function SummaryList({
  title,
  description,
  icon,
  items,
  selectedKey,
  showAsLink = true,
  isKelompok = false,
  isClickable = false,
}: SummaryListProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSelect = (item: SummaryItem) => {
    startTransition(() => {
      if (item.key && item.key === selectedKey) {
        router.push("/summary");
      } else {
        router.push(`/summary?desa=${encodeURIComponent(item.label)}`);
      }
    });
  };

  const handleBackToDesa = () => {
    startTransition(() => {
      router.push("/summary");
      router.refresh();
    });
  };

  return (
    <>
      {isPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Memuat data…</span>
          </div>
        </div>
      )}

      <Card className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm gap-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>

          {isKelompok && (
            <div className="flex justify-start">
              <Button
                onClick={handleBackToDesa}
                asChild
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <span>
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke daftar Desa
                </span>
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {items.length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              <p>Tidak ada data untuk ditampilkan.</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900">
                    <TableRow>
                      <TableHead>
                        {title.includes("Desa") ? "Desa" : "Kelompok"}
                      </TableHead>
                      <TableHead className="text-right w-24">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const isActive = item.key === selectedKey;
                      const href = item.href;
                      const clickable = isClickable || (showAsLink && href);

                      if (showAsLink && href && !isClickable) {
                        return (
                          <TableRow
                            key={`${title}-${item.label}`}
                            className={
                              "cursor-pointer transition-colors " +
                              (isActive
                                ? "bg-indigo-50/80 dark:bg-indigo-900/40"
                                : "hover:bg-slate-50 dark:hover:bg-slate-900/40")
                            }
                          >
                            <TableCell className="font-medium p-0">
                              <Link href={href} className="block px-4 py-3">
                                {item.label}
                              </Link>
                            </TableCell>
                            <TableCell className="text-right font-semibold p-0">
                              <Link href={href} className="block px-4 py-3">
                                {item.count.toLocaleString("id-ID")}
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      return (
                        <TableRow
                          key={`${title}-${item.label}`}
                          className={
                            (clickable
                              ? "cursor-pointer transition-colors " +
                                (isActive
                                  ? "bg-indigo-50/80 dark:bg-indigo-900/40"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-900/40")
                              : "") ||
                            (isActive
                              ? "bg-indigo-50/80 dark:bg-indigo-900/40"
                              : "")
                          }
                          onClick={
                            isClickable ? () => handleSelect(item) : undefined
                          }
                        >
                          <TableCell className="font-medium p-0">
                            <div className="px-4 py-3">{item.label}</div>
                          </TableCell>
                          <TableCell className="text-right font-semibold p-0">
                            <div className="px-4 py-3">
                              {item.count.toLocaleString("id-ID")}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile */}
              <div className="md:hidden space-y-3">
                {items.map((item) => {
                  const isActive = item.key === selectedKey;
                  const href = item.href;
                  const clickable = isClickable || (showAsLink && href);

                  const cardContent = (
                    <div
                      className={
                        "flex items-center justify-between rounded-lg border p-4 transition-colors " +
                        (isActive
                          ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/40"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900")
                      }
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.label}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Total data
                        </div>
                      </div>
                      <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {item.count.toLocaleString("id-ID")}
                      </div>
                    </div>
                  );

                  if (showAsLink && href && !isClickable) {
                    return (
                      <Link
                        key={`${title}-mobile-${item.label}`}
                        href={href}
                        className="block"
                      >
                        {cardContent}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={`${title}-mobile-${item.label}`}
                      className={clickable ? "cursor-pointer" : undefined}
                      onClick={
                        isClickable ? () => handleSelect(item) : undefined
                      }
                    >
                      {cardContent}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

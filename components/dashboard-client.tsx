"use client";

import { useMemo, useState, useTransition } from "react";
import { useEffect, useRef } from "react";
import { SheetRow } from "@/lib/google-sheets";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditDataDialog } from "@/components/edit-data-dialog";
import { DeleteDataDialog } from "@/components/delete-data-dialog";
import { DataDetailDialog } from "@/components/data-detail-dialog";
import { AddDataDialog } from "@/components/add-data-dialog";
import { RefreshButton } from "@/components/refresh-button";
import Link from "next/link";
import {
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUp,
  Loader2,
  BarChart3,
  X,
} from "lucide-react";
import { desaData, Gender } from "@/lib/constants";
import { useDebounceValue } from "usehooks-ts";

interface DashboardClientProps {
  initialData: SheetRow[];
  headers: string[];
}

export function DashboardClient({
  initialData,
  headers,
}: DashboardClientProps) {
  const [filterDesa, setFilterDesa] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterNama, setFilterNama] = useState("");
  const [debouncedValue] = useDebounceValue(filterNama, 1000);

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const dataTopRef = useRef<HTMLDivElement | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEnableAction = process.env.NEXT_PUBLIC_IS_ENABLE_ACTION === "true";

  // Option lists follow the same source as add/edit dialogs
  const desaOptions = useMemo(() => Object.keys(desaData).sort(), []);

  const kelompokOptions = useMemo(() => {
    // if (filterDesa) {
    //   return [...(desaData[filterDesa] || [])].sort();
    // }
    // const allKelompok = Object.values(desaData).flat();
    // return Array.from(new Set(allKelompok)).sort();

    // munculin semua kelompok tana filter desa
    return Object.values(desaData).flat();
  }, []);

  const handleChangeNama = (nama: string) => {
    setFilterNama(nama);
  };

  // Filter Data
  const filteredData = useMemo(() => {
    return initialData.filter((row) => {
      const matchDesa = filterDesa
        ? String(row["DESA"] || "").toLowerCase() === filterDesa.toLowerCase()
        : true;
      const matchKelompok = filterKelompok
        ? String(row["KELOMPOK"] || "").toLowerCase() ===
          filterKelompok.toLowerCase()
        : true;

      const matchGender = filterGender
        ? String(row["JENIS KELAMIN"] || "").toLowerCase() ===
          filterGender.toLowerCase()
        : true;

      const matchNama = debouncedValue
        ? String(row["NAMA LENGKAP"] || "")
            .toLowerCase()
            .includes(debouncedValue.toLowerCase())
        : true;

      return matchDesa && matchKelompok && matchGender && matchNama;
    });
  }, [initialData, filterDesa, filterKelompok, filterGender, debouncedValue]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // NOTE: Reset pagination + loading feedback is handled via startTransition()
  // inside event handlers (filters/pageSize/pagination) to avoid setState in effects.

  // Back-to-top visibility
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    startTransition(() => {
      setCurrentPage(1);
    });
  }, [debouncedValue]);

  const scrollToDataTopWithOffset = () => {
    const element = dataTopRef.current;
    if (!element) return;

    const NAVBAR_OFFSET = 60; // approx height of sticky navbar
    const rect = element.getBoundingClientRect();
    const absoluteTop = rect.top + window.scrollY;

    window.scrollTo({
      top: Math.max(absoluteTop - NAVBAR_OFFSET, 0),
      behavior: "smooth",
    });
  };

  // When pagination changes, bring user back to the top of the data section with offset
  useEffect(() => {
    scrollToDataTopWithOffset();
  }, [currentPage]);

  const isFiltered = Boolean(filterDesa || filterKelompok);

  const resetFilters = () => {
    startTransition(() => {
      setFilterDesa("");
      setFilterKelompok("");
      setFilterGender("");
      setFilterNama("");
      setCurrentPage(1);
    });
  };

  const scrollToTop = () => {
    // Prefer scrolling to the data section (with navbar offset), fallback to window top
    if (dataTopRef.current) {
      scrollToDataTopWithOffset();
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Helper for Mobile View
  const labelMap: { [key: string]: string } = {
    "TANGGAL LAHIR": "Tanggal Lahir",
    "NAMA LENGKAP": "Nama Lengkap",
    Desa: "Desa",
    KELOMPOK: "Kelompok Sambung",
    "JENIS KELAMIN": "Jenis Kelamin",
    HOBI: "Hobi",
    "SKILL / CITA-CITA": "Skill / Cita-cita",
    Umur: "Usia",
    'Nomor telpon "WA" ( bagi generus caberawit no WA orang tua )': "Nomor HP",
  };

  const getKey = (header: string) => labelMap[header] || header;

  const getValue = (header: string, val: unknown) => String(val ?? "-");

  return (
    <div className="space-y-6 relative">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Data Generus
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Kelola dan filter data generus •{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {filteredData.length.toLocaleString("id-ID")} data
              {isFiltered && " (sesuai filter)"}
            </span>
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row justify-end gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/summary">
              <BarChart3 className="h-4 w-4" />
              Summary
            </Link>
          </Button>
          {isEnableAction && <AddDataDialog headers={headers} />}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Filter className="w-4 h-4" />
          <h3 className="font-bold text-sm uppercase tracking-wide">
            Filter Data
          </h3>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-between items-end">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1">
            {/* Filter Desa */}
            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Desa
              </label>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[180px]"
                value={filterDesa}
                onChange={(e) => {
                  const nextDesa = e.target.value;
                  startTransition(() => {
                    setFilterDesa(nextDesa);
                    setFilterKelompok("");
                    setCurrentPage(1);
                  });
                }}
              >
                <option value="">Semua Desa</option>
                {desaOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Kelompok */}
            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Kelompok Sambung
              </label>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[180px] disabled:cursor-not-allowed disabled:bg-slate-200"
                value={filterKelompok}
                onChange={(e) => {
                  const nextKelompok = e.target.value;
                  startTransition(() => {
                    setFilterKelompok(nextKelompok);
                    setCurrentPage(1);
                  });
                }}
                // disabled={!filterDesa}
              >
                <option value="">Semua Kelompok</option>
                {kelompokOptions.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Gender */}
            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Jenis Kelamin
              </label>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[180px]"
                value={filterGender}
                onChange={(e) => {
                  const gender = e.target.value;
                  startTransition(() => {
                    setFilterGender(gender);
                    setCurrentPage(1);
                  });
                }}
              >
                <option value="">Semua</option>
                {Gender.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Nama */}
            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Nama Generus
              </label>
              <input
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[180px]"
                value={filterNama}
                placeholder="Cari berdasarkan nama..."
                onChange={(e) => {
                  const nama = e.target.value;
                  handleChangeNama(nama);
                }}
              ></input>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={resetFilters}>
            <span className="flex flex-row items-center gap-2.5">
              <X className="w-4 h-4" /> Reset Filter
            </span>
          </Button>

          <RefreshButton />
        </div>
      </div>

      {/* Anchor: top of data list/table */}
      <div ref={dataTopRef} />

      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0 relative">
          {isPending && (
            <div className="absolute inset-0 z-30 bg-white/70 dark:bg-slate-950/70 backdrop-blur-[1px] flex items-center justify-center">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-200">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat...
              </div>
            </div>
          )}
          {filteredData.length === 0 ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm p-8 text-center space-y-3">
              <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Tidak ada data
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isFiltered
                  ? "Tidak ada data yang sesuai filter. Coba ubah atau reset filter."
                  : "Belum ada data yang tersedia."}
              </p>
              {isFiltered && (
                <div className="flex justify-center">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset Filter
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <TableRow>
                      <TableHead className="w-12 text-center font-bold text-slate-700 dark:text-slate-200">
                        No
                      </TableHead>
                      {headers.map((header) => (
                        <TableHead
                          key={header}
                          className="font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap"
                        >
                          {header}
                        </TableHead>
                      ))}
                      <TableHead className="font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap text-center">
                        Umur
                      </TableHead>
                      {isEnableAction && (
                        <TableHead className="font-bold text-slate-700 dark:text-slate-200 text-center">
                          Aksi
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((row, index) => {
                      const originalIndex = Number(row["_index"]);

                      return (
                        <TableRow
                          key={originalIndex}
                          className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                        >
                          <TableCell className="text-center font-medium text-slate-500">
                            {(currentPage - 1) * pageSize + index + 1}
                          </TableCell>
                          {headers.map((header) => (
                            <TableCell
                              key={`${originalIndex}-${header}`}
                              className="whitespace-normal max-w-64"
                            >
                              {getValue(header, row[header])}
                            </TableCell>
                          ))}
                          <TableCell className="whitespace-nowrap">
                            {row["Umur"] ? `${row["Umur"]} Tahun` : "-"}
                          </TableCell>
                          {isEnableAction && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <DataDetailDialog
                                  row={row}
                                  title={`Detail ${
                                    row["NAMA LENGKAP"] || "Data"
                                  }`}
                                />
                                <EditDataDialog
                                  row={row}
                                  rowIndex={originalIndex}
                                />
                                {/* <DeleteDataDialog rowIndex={originalIndex} /> */}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden grid gap-8">
                {paginatedData.map((row, index) => {
                  const originalIndex = Number(row["_index"]);
                  return (
                    <div
                      key={originalIndex}
                      className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col"
                    >
                      <DataDetailDialog
                        row={row}
                        title={`Detail ${row["NAMA LENGKAP"] || "Data"}`}
                      >
                        <div className="p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors grow">
                          {/* Header */}
                          <div className="flex items-center gap-4 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xl ring-4 ring-indigo-50 dark:ring-indigo-950/50">
                              {(currentPage - 1) * pageSize + index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 truncate">
                                {String(row["NAMA LENGKAP"] || "Data Generus")}
                              </h3>
                              {row["Umur"] && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                  {`${row["Umur"]} Tahun`}
                                </p>
                              )}
                            </div>
                            <div className="text-slate-300 dark:text-slate-600">
                              <Eye className="w-5 h-5" />
                            </div>
                          </div>
                          {/* Body */}
                          <div className="space-y-4">
                            {headers.slice(0, 7).map((header) => {
                              if (header === "NAMA LENGKAP") return null;
                              return (
                                <div key={header} className="flex flex-col">
                                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                                    {getKey(header)}
                                  </span>
                                  <span className="text-base font-semibold text-slate-700 dark:text-slate-200 wrap-break-word leading-relaxed">
                                    {getValue(header, row[header])}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </DataDetailDialog>
                      {/* Actions */}
                      {isEnableAction && (
                        <div className="grid grid-cols-1">
                          <EditDataDialog row={row} rowIndex={originalIndex}>
                            <button className="w-full h-full flex items-center justify-center gap-2 py-4 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border-t border-r border-indigo-100 dark:border-indigo-900/50">
                              <Pencil className="w-4 h-4" />
                              Edit Data
                            </button>
                          </EditDataDialog>
                          {/* <DeleteDataDialog rowIndex={originalIndex}>
                            <button className="w-full h-full flex items-center justify-center gap-2 py-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors border-t border-red-100 dark:border-red-900/50">
                              <Trash2 className="w-4 h-4" />
                              Hapus
                            </button>
                          </DeleteDataDialog> */}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {filteredData.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-b-xl border-x border-b">
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                    <span className="text-sm text-slate-500 whitespace-nowrap">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase hidden sm:inline">
                        Tampil:
                      </span>
                      <select
                        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-16"
                        value={pageSize}
                        onChange={(e) => {
                          const nextSize = Number(e.target.value);
                          startTransition(() => {
                            setPageSize(nextSize);
                            setCurrentPage(1);
                          });
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        startTransition(() =>
                          setCurrentPage((p) => Math.max(1, p - 1)),
                        )
                      }
                      disabled={currentPage === 1}
                      className="flex-1 sm:flex-none"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        startTransition(() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1)),
                        )
                      }
                      disabled={currentPage === totalPages}
                      className="flex-1 sm:flex-none"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Back to top */}
      {showBackToTop && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={scrollToTop}
            className="rounded-full shadow-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 px-4 py-2 h-auto"
            aria-label="Kembali ke atas"
          >
            <span className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Kembali ke atas
              </span>
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import { SheetRow } from "@/lib/google-sheets";
import { getSheetDataAction } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UserCheck, UserX, User, MapPin, Building2, Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { COLUMNS } from "@/lib/constants";

export default function CheckNamaPage() {
    const [search, setSearch] = useState("");
    const [data, setData] = useState<SheetRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initial fetch
    useEffect(() => {
        async function loadData() {
            try {
                const result = await getSheetDataAction();
                if (result.success && result.data) {
                    setData(result.data);
                } else {
                    setError(result.message || "Gagal memuat data");
                }
            } catch (err) {
                setError("Terjadi kesalahan koneksi");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const filteredResults = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (q.length < 3) return [];

        const result = data.filter(row => {
            const nama = String(row[COLUMNS.NAMA] || "").toLowerCase();
            return nama.includes(q);
        });

        console.log("cek isi data", result);

        return result;
    }, [data, search]);

    const hasTypedEnough = search.trim().length >= 3;

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="text-center mb-10 space-y-4">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                        Cek Nama <span className="text-indigo-600 dark:text-indigo-400">Generus</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Gunakan fitur ini untuk memeriksa apakah nama Anda sudah terdaftar di database. Masukkan minimal 3 huruf nama Anda.
                    </p>
                </div>

                <div className="max-w-xl mx-auto space-y-6">
                    {/* Search Card */}
                    <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Search className="h-5 w-5 text-indigo-500" />
                                Cari Nama
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Masukkan minimal 3 huruf..."
                                    className="pl-10 h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-lg focus-visible:ring-indigo-500 transition-all rounded-xl"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-3 text-center">
                                Menampilkan hasil dari kolom NAMA LENGKAP
                            </p>
                        </CardContent>
                    </Card>

                    {/* Results Area */}
                    <div className="space-y-4 min-h-[200px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
                                <p>Menyiapkan data...</p>
                            </div>
                        ) : error ? (
                            <Card className="border-red-100 bg-red-50 dark:bg-red-950/10 dark:border-red-900/50">
                                <CardContent className="py-8 text-center text-red-600 dark:text-red-400">
                                    <p className="font-medium">{error}</p>
                                </CardContent>
                            </Card>
                        ) : search.trim().length > 0 && !hasTypedEnough ? (
                            <div className="text-center py-8 text-slate-400 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                <p>Masukkan minimal 3 huruf untuk mulai mencari</p>
                            </div>
                        ) : hasTypedEnough && filteredResults.length > 0 ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-3 px-2">
                                    <Badge variant="outline" className="px-3 py-1 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                                        <UserCheck className="h-4 w-4" />
                                        Nama Sudah Terdaftar
                                    </Badge>
                                    <span className="text-xs text-slate-400">
                                        Ditemukan {filteredResults.length} data
                                    </span>
                                </div>

                                {filteredResults.slice(0, 10).map((row, idx) => (
                                    <Card key={idx} className="group hover:ring-2 hover:ring-indigo-500/20 transition-all border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
                                        <CardContent className="p-5 flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-900 dark:text-white truncate text-lg">
                                                    {String(row[COLUMNS.NAMA] || "-")}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                    <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                        <span>{String(row[COLUMNS.DESA] || "-")}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                                        <span>{String(row[COLUMNS.KELOMPOK] || "-")}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {filteredResults.length > 10 && (
                                    <p className="text-center text-xs text-slate-400 italic">
                                        Menampilkan 10 dari {filteredResults.length} hasil. Silakan perjelas pencarian Anda.
                                    </p>
                                )}
                            </div>
                        ) : hasTypedEnough && filteredResults.length === 0 ? (
                            <div className="text-center py-12 space-y-4 animate-in fade-in duration-500 bg-white dark:bg-slate-900 rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
                                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                                    <UserX className="h-8 w-8 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nama Belum Terdaftar</h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm mt-1">
                                        Kami tidak menemukan data dengan nama &quot;{search}&quot; di database.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Final Welcome State before searching */
                            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl opacity-50">
                                <UserCheck className="h-12 w-12 text-slate-300 mb-2" />
                                <p className="text-slate-500">Hasil pencarian akan muncul di sini</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

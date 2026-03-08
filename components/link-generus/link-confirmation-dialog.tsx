import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SheetRow } from "@/lib/google-sheets";
import { AlertCircle, ArrowRightCircle, Calendar, Link2, Loader2, Phone, Search } from "lucide-react";

export type PendingLinkType = {
    additionalInfoIdx: number;
    generusRow: SheetRow;
    isAutoMatch?: boolean;
    isLoading?: boolean;
    isNotFound?: boolean;
    isError?: boolean;
    errorMessage?: string;
} | null;

interface LinkConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pendingLink: PendingLinkType;
    additionalInfoData: SheetRow[];
    isLinkingInDialog: boolean;
    handleCancelLink: () => void;
    handleConfirmLink: () => void;
}

export function LinkConfirmationDialog({
    open,
    onOpenChange,
    pendingLink,
    additionalInfoData,
    isLinkingInDialog,
    handleCancelLink,
    handleConfirmLink
}: LinkConfirmationDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={(v) => {
            if (!v && isLinkingInDialog) return;
            onOpenChange(v);
        }}>
            <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg sm:rounded-xl">
                            <Link2 className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        Konfirmasi Link
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-6 pt-2">
                            <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                                <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                                <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                                    {pendingLink?.isAutoMatch
                                        ? "Sistem menemukan kecocokan otomatis berdasarkan Nama Lengkap. Mohon verifikasi perbandingan data untuk memastikan data sudah benar."
                                        : "Pastikan data Generus yang dipilih sudah benar sebelum melakukan linking."}
                                </p>
                            </div>

                            {pendingLink && (
                                <div className="min-h-[300px] flex flex-col justify-center">
                                    {pendingLink.isLoading ? (
                                        <div className="space-y-6 py-8">
                                            <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-center gap-4 animate-pulse">
                                                <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                                                    <div className="w-5 h-5" />
                                                </div>
                                                <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                                            </div>
                                            <p className="text-sm text-center text-slate-400 animate-bounce">
                                                Mencari kecocokan data...
                                            </p>
                                        </div>
                                    ) : (pendingLink.isNotFound || pendingLink.isError) ? (
                                        <div className="py-12 flex flex-col items-center text-center space-y-4">
                                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                                                <Search className="h-8 w-8 text-amber-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    {pendingLink.isNotFound ? "Tidak Ditemukan" : "Terjadi Kesalahan"}
                                                </h3>
                                                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                                    {pendingLink.errorMessage || "Tidak dapat menemukan data yang cocok secara otomatis."}
                                                </p>
                                            </div>
                                            <AlertDialogAction
                                                onClick={handleCancelLink}
                                                className="mt-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border-none"
                                            >
                                                Tutup
                                            </AlertDialogAction>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-center md:items-stretch gap-3 md:gap-4 max-h-[50vh] overflow-y-auto px-1">
                                            {/* Additional Info Side */}
                                            <div className="w-full group space-y-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-700 relative overflow-hidden">
                                                <div className="flex items-center gap-2 mb-1 relative z-10">
                                                    <div className="p-1 px-2 bg-amber-100 dark:bg-amber-900/30 rounded text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                                        New Entry
                                                    </div>
                                                </div>

                                                {(() => {
                                                    const row = additionalInfoData.find(r => (r._index as number) === pendingLink?.additionalInfoIdx);
                                                    if (!row) return null;
                                                    return (
                                                        <div className="space-y-3 relative z-10">
                                                            <div className="space-y-0.5">
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Nama Lengkap</p>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                                                    {String(row["Nama Lengkap"] || "-")}
                                                                </p>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                                                                <div className="space-y-0.5">
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Kelompok</p>
                                                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                        {String(row["Kelompok"] || "-")}
                                                                    </p>
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Gender</p>
                                                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                        {String(row["Jenis Kelamin"] || "-")}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                                                                <div className="space-y-0.5">
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                                                        <Calendar className="h-2.5 w-2.5" /> Tgl Lahir
                                                                    </p>
                                                                    {(() => {
                                                                        const aiTgl = String(row["Tanggal Lahir"] || "").trim();
                                                                        const masterTgl = String(pendingLink.generusRow["TANGGAL LAHIR"] || "").trim();
                                                                        const isMatch = aiTgl && masterTgl && aiTgl.toLowerCase() === masterTgl.toLowerCase();
                                                                        return (
                                                                            <p className={`text-xs font-semibold ${isMatch ? "text-emerald-600 dark:text-emerald-400" : aiTgl && masterTgl ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"}`}>
                                                                                {aiTgl || "-"}
                                                                                {aiTgl && masterTgl && (
                                                                                    <span className={`ml-1.5 inline-flex items-center text-[8px] font-bold px-1 py-0.5 rounded ${isMatch ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-amber-100 dark:bg-amber-900/30 text-amber-600"}`}>
                                                                                        {isMatch ? "✓" : "≠"}
                                                                                    </span>
                                                                                )}
                                                                            </p>
                                                                        );
                                                                    })()}
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                                                        <Phone className="h-2.5 w-2.5" /> No. Whatsapp
                                                                    </p>
                                                                    {(() => {
                                                                        const aiWa = String(row["Nomor Whatsapp"] || "").trim();
                                                                        const masterHp = String(pendingLink?.generusRow["NOMOR HP"] || "").trim();
                                                                        const normalizePhone = (p: string) => p.replace(/[^0-9]/g, "");
                                                                        const isMatch = aiWa && masterHp && normalizePhone(aiWa) === normalizePhone(masterHp);
                                                                        return (
                                                                            <p className={`text-xs font-semibold ${isMatch ? "text-emerald-600 dark:text-emerald-400" : aiWa && masterHp ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"}`}>
                                                                                {aiWa || "-"}
                                                                                {aiWa && masterHp && (
                                                                                    <span className={`ml-1.5 inline-flex items-center text-[8px] font-bold px-1 py-0.5 rounded ${isMatch ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-amber-100 dark:bg-amber-900/30 text-amber-600"}`}>
                                                                                        {isMatch ? "✓" : "≠"}
                                                                                    </span>
                                                                                )}
                                                                            </p>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            {/* Simplified Connector */}
                                            <div className="flex md:flex-col items-center justify-center gap-2 py-1 md:py-4 w-full md:w-auto">
                                                <div className="hidden md:block h-20 w-px bg-slate-200 dark:bg-slate-800" />
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full shadow-md">
                                                    <ArrowRightCircle className="w-5 h-5 text-indigo-500 rotate-90 md:rotate-0" />
                                                </div>
                                                <div className="hidden md:block h-20 w-px bg-slate-200 dark:bg-slate-800" />
                                                <div className="md:hidden h-px grow bg-slate-200 dark:bg-slate-800" />
                                            </div>

                                            {/* Generus Side */}
                                            <div className="w-full group space-y-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-emerald-300 dark:hover:border-emerald-700 relative overflow-hidden">
                                                <div className="flex items-center gap-2 mb-1 relative z-10">
                                                    <div className="p-1 px-2 bg-emerald-100 dark:bg-emerald-900/30 rounded text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                                        Master Data
                                                    </div>
                                                </div>

                                                <div className="space-y-3 relative z-10">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Nama Lengkap</p>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                                            {String(pendingLink.generusRow["NAMA LENGKAP"] || "-")}
                                                        </p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                                                        <div className="space-y-0.5">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Kelompok</p>
                                                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                {String(pendingLink.generusRow["KELOMPOK"] || "-")}
                                                            </p>
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Gender</p>
                                                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                {String(pendingLink.generusRow["JENIS KELAMIN"] || "-")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                                                        <div className="space-y-0.5">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                                                <Calendar className="h-2.5 w-2.5" /> Tgl Lahir
                                                            </p>
                                                            {(() => {
                                                                const aiRow = additionalInfoData.find(r => (r._index as number) === pendingLink?.additionalInfoIdx);
                                                                const aiTgl = String(aiRow?.["Tanggal Lahir"] || "").trim();
                                                                const masterTgl = String(pendingLink.generusRow["TANGGAL LAHIR"] || "").trim();
                                                                const isMatch = aiTgl && masterTgl && aiTgl.toLowerCase() === masterTgl.toLowerCase();
                                                                return (
                                                                    <p className={`text-xs font-semibold ${isMatch ? "text-emerald-600 dark:text-emerald-400" : aiTgl && masterTgl ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"}`}>
                                                                        {masterTgl || "-"}
                                                                        {aiTgl && masterTgl && (
                                                                            <span className={`ml-1.5 inline-flex items-center text-[8px] font-bold px-1 py-0.5 rounded ${isMatch ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-amber-100 dark:bg-amber-900/30 text-amber-600"}`}>
                                                                                {isMatch ? "✓" : "≠"}
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                );
                                                            })()}
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                                                <Phone className="h-2.5 w-2.5" /> No. HP
                                                            </p>
                                                            {(() => {
                                                                const aiRow = additionalInfoData.find(r => (r._index as number) === pendingLink?.additionalInfoIdx);
                                                                const aiWa = String(aiRow?.["Nomor Whatsapp"] || "").trim();
                                                                const masterHp = String(pendingLink.generusRow["NOMOR HP"] || "").trim();
                                                                const normalizePhone = (p: string) => p.replace(/[^0-9]/g, "");
                                                                const isMatch = aiWa && masterHp && normalizePhone(aiWa) === normalizePhone(masterHp);
                                                                return (
                                                                    <p className={`text-xs font-semibold ${isMatch ? "text-emerald-600 dark:text-emerald-400" : aiWa && masterHp ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"}`}>
                                                                        {masterHp || "-"}
                                                                        {aiWa && masterHp && (
                                                                            <span className={`ml-1.5 inline-flex items-center text-[8px] font-bold px-1 py-0.5 rounded ${isMatch ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-amber-100 dark:bg-amber-900/30 text-amber-600"}`}>
                                                                                {isMatch ? "✓" : "≠"}
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <p className="text-[11px] text-center text-slate-400 italic">
                                Setelah konfirmasi, UserId baru akan dihasilkan dan ditulis ke kedua sheet untuk sinkronisasi data.
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4 gap-3">
                    <AlertDialogCancel
                        onClick={handleCancelLink}
                        disabled={isLinkingInDialog}
                        className="rounded-xl border-slate-200 dark:border-slate-800"
                    >
                        Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirmLink}
                        disabled={isLinkingInDialog || pendingLink?.isLoading || pendingLink?.isNotFound || pendingLink?.isError}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 dark:shadow-none px-6"
                    >
                        {isLinkingInDialog ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Menghubungkan...
                            </>
                        ) : (
                            "Ya, Hubungkan Sekarang"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

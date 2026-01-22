import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-indigo-600/20" />
        </div>
        <div className="flex flex-col items-center">
          <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Generus Bogsel</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Memuat data dari server...</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  FileUp, 
  Download, 
  ArrowLeft, 
  FileSpreadsheet, 
  Trash2, 
  Plus, 
  UploadCloud, 
  X, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { MassUploadPreview } from "@/components/admin/MassUploadPreview";
import { parseMassUploadFile } from "@/lib/excel-utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getSheetDataAction } from "@/app/actions";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MassUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<Record<string, string>[] | null>(null);
  const [existingData, setExistingData] = useState<Record<string, any>[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleDownloadTemplate = () => {
    window.location.href = "/api/admin/mass-upload/template";
  };

  const handleAddFiles = (newFiles: FileList | File[]) => {
    const validFiles: File[] = [];
    const rejectedNames: string[] = [];
    const duplicateNames: string[] = [];

    Array.from(newFiles).forEach((file) => {
      const isExcel =
        file.name.endsWith(".xlsx") ||
        file.type.includes("spreadsheetml") ||
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      if (!isExcel) {
        rejectedNames.push(file.name);
        return;
      }

      const isDuplicate = queuedFiles.some(
        (f) => f.name === file.name && f.size === file.size
      );

      if (isDuplicate) {
        duplicateNames.push(file.name);
        return;
      }

      validFiles.push(file);
    });

    if (rejectedNames.length > 0) {
      toast.error("Format tidak didukung", {
        description: `${rejectedNames.length} file diabaikan karena bukan .xlsx`,
      });
    }

    if (duplicateNames.length > 0) {
      toast.info("File sudah ada", {
        description: `${duplicateNames.length} file sudah berada di dalam antrean.`,
      });
    }

    if (validFiles.length > 0) {
      setQueuedFiles((prev) => [...prev, ...validFiles]);
      toast.success("File ditambahkan", {
        description: `${validFiles.length} file baru siap diproses.`,
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setQueuedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllFiles = () => {
    setQueuedFiles([]);
  };

  const handleProcessFiles = async () => {
    if (queuedFiles.length === 0) {
      toast.error("Tidak ada file", {
        description: "Pilih atau drag minimal satu file Excel terlebih dahulu.",
      });
      return;
    }

    try {
      setIsUploading(true);
      const allRows: Record<string, string>[] = [];
      const failedFiles: string[] = [];

      for (const file of queuedFiles) {
        try {
          const buffer = await file.arrayBuffer();
          const rows = await parseMassUploadFile(buffer);

          if (rows.length === 0) {
            failedFiles.push(`${file.name} (kosong)`);
            continue;
          }

          // Attach source file name to each record
          const taggedRows = rows.map((row) => ({
            ...row,
            _fileName: file.name,
          }));

          allRows.push(...taggedRows);
        } catch (err) {
          console.error(`Error parsing ${file.name}:`, err);
          failedFiles.push(`${file.name} (gagal dibaca)`);
        }
      }

      if (allRows.length === 0) {
        toast.error("Gagal membaca file", {
          description: "Tidak ada baris data yang berhasil dibaca dari semua file yang dipilih.",
        });
        return;
      }

      if (failedFiles.length > 0) {
        toast.warning("Beberapa file bermasalah", {
          description: `${failedFiles.join(", ")} dilewati.`,
        });
      }

      // Fetch existing data for preview matching
      const result = await getSheetDataAction();
      if (result.success && result.data) {
        setExistingData(result.data);
      }

      setParsedData(allRows);
      toast.success("Berhasil memproses file", {
        description: `Total ${allRows.length} baris data dimuat dari ${queuedFiles.length - failedFiles.length} file.`,
      });
    } catch (error) {
      console.error("Parse error:", error);
      toast.error("Gagal membaca file", {
        description: "Terjadi kesalahan saat memproses file Excel.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (validData: Record<string, string>[]) => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/admin/mass-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validData }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Gagal menyimpan data");
      }

      toast.success("Berhasil", {
        description: `Berhasil memproses data: ${result.stats.inserted} baru, ${result.stats.updated} diupdate, ${result.stats.deleted} dihapus.`,
      });

      // Redirect back to admin dashboard after short delay
      setTimeout(() => {
        router.push("/admin-restricted");
        router.refresh();
      }, 1500);
      
    } catch (error) {
      toast.error("Terjadi Kesalahan", {
        description: error instanceof Error ? error.message : "Gagal menyimpan data ke database.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-outfit p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-full shadow-sm" asChild>
              <Link href="/admin-restricted">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Mass Upload Data
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Upload satu atau beberapa file Excel (.xlsx) sekaligus untuk sinkronisasi data massal.
              </p>
            </div>
          </div>
          <Button 
            onClick={handleDownloadTemplate} 
            variant="outline"
            className="hidden sm:flex items-center gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Download Template .xlsx
          </Button>
        </div>

        {/* Content Section */}
        {!parsedData ? (
          <div className="space-y-6">
            {/* Mobile Template Download Button */}
            <div className="sm:hidden">
              <Button 
                onClick={handleDownloadTemplate} 
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-slate-300"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                Download Template .xlsx
              </Button>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[1.008] shadow-lg ring-4 ring-indigo-500/10"
                  : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md"
              }`}
            >
              <input
                type="file"
                multiple
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />

              <div className="flex flex-col items-center justify-center space-y-4">
                <div className={`p-4 rounded-2xl transition-colors ${
                  isDragging 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                    : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                }`}>
                  <UploadCloud className="w-10 h-10 stroke-[1.75]" />
                </div>

                <div className="space-y-1 max-w-md">
                  <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
                    {isDragging ? "Lepaskan file di sini" : "Tarik & Lepaskan file Excel di sini"}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">
                    atau <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline underline-offset-2">pilih file dari komputer</span> (bisa pilih banyak file sekaligus)
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  Format yang didukung: .xlsx (Excel)
                </div>
              </div>
            </div>

            {/* Queued Files List */}
            {queuedFiles.length > 0 && (
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                          Antrean File ({queuedFiles.length})
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Total ukuran: {formatFileSize(queuedFiles.reduce((acc, f) => acc + f.size, 0))}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 h-8 gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah File
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAllFiles}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 h-8 gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                    {queuedFiles.map((file, idx) => (
                      <div
                        key={`${file.name}-${idx}`}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                            <FileSpreadsheet className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFile(idx)}
                          className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 shrink-0 rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <Button
                      onClick={handleProcessFiles}
                      disabled={isUploading}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 px-6 py-2.5"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Memproses {queuedFiles.length} File...
                        </>
                      ) : (
                        <>
                          <FileUp className="w-4 h-4" />
                          Proses & Preview {queuedFiles.length} File
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <MassUploadPreview
            data={parsedData}
            existingData={existingData}
            onSave={handleSave}
            isSaving={isSaving}
            onCancel={() => setParsedData(null)}
          />
        )}
      </div>
    </div>
  );
}


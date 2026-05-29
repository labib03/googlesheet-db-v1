"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileUp, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MassUploadPreview } from "@/components/admin/MassUploadPreview";
import { parseMassUploadFile } from "@/lib/excel-utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getSheetDataAction } from "@/app/actions";

export default function MassUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<Record<string, string>[] | null>(null);
  const [existingData, setExistingData] = useState<Record<string, any>[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleDownloadTemplate = () => {
    window.location.href = "/api/admin/mass-upload/template";
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !file.type.includes("spreadsheetml") &&
      !file.name.endsWith(".xlsx")
    ) {
      toast.error("Format tidak didukung", {
        description: "Harap upload file Excel (.xlsx).",
      });
      return;
    }

    try {
      setIsUploading(true);
      const buffer = await file.arrayBuffer();
      const rows = await parseMassUploadFile(buffer);
      
      if (rows.length === 0) {
        toast.error("File Kosong", {
          description: "Tidak ada data yang ditemukan di file Excel.",
        });
        return;
      }

      // Fetch existing data for preview matching
      const result = await getSheetDataAction();
      if (result.success && result.data) {
        setExistingData(result.data);
      }

      setParsedData(rows);
    } catch (error) {
      console.error("Parse error:", error);
      toast.error("Gagal membaca file", {
        description: "Pastikan format file sesuai dengan template.",
      });
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
    <div className="min-h-screen bg-white font-outfit p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <Button variant="outline" size="icon" className="rounded-full" asChild>
            <Link href="/admin-restricted">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Mass Upload Data
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Upload banyak data sekaligus menggunakan format Excel.
            </p>
          </div>
        </div>

        {/* Content Section */}
        {!parsedData ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-indigo-100 dark:border-indigo-900 shadow-sm bg-indigo-50/30 dark:bg-indigo-950/20">
              <CardHeader>
                <CardTitle className="text-lg text-indigo-700 dark:text-indigo-400">1. Download Template</CardTitle>
                <CardDescription>
                  Gunakan template ini untuk memastikan format data Anda sesuai dengan sistem.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleDownloadTemplate} className="w-full gap-2" variant="outline">
                  <Download className="w-4 h-4" />
                  Download Template .xlsx
                </Button>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 dark:border-emerald-900 shadow-sm bg-emerald-50/30 dark:bg-emerald-950/20">
              <CardHeader>
                <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400">2. Upload File</CardTitle>
                <CardDescription>
                  Upload file Excel yang sudah Anda isi sesuai dengan template.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isUploading}
                >
                  <FileUp className="w-4 h-4" />
                  {isUploading ? "Membaca file..." : "Pilih File .xlsx"}
                </Button>
              </CardContent>
            </Card>
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

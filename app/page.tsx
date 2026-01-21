import { getSheetData, SheetRow } from "@/lib/google-sheets";
import { Navbar } from "@/components/navbar";
import { DashboardClient } from "@/components/dashboard-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { differenceInYears, parse, format } from "date-fns";
import { id } from "date-fns/locale";

export const dynamic = "force-dynamic";

// Helper to calculate age
function calculateAge(dateString: string): string {
  if (!dateString) return "-";

  try {
    // Parsing string "DD/MM/YYYY" menjadi Date
    const birthDate = parse(dateString, "dd/MM/yyyy", new Date());

    if (isNaN(birthDate.getTime())) {
      console.error("Invalid date:", dateString);
      return "-";
    }

    const today = new Date();
    const age = differenceInYears(today, birthDate);

    return age.toString();
  } catch (error) {
    console.error("Error parsing date:", error);
    return "-";
  }
}

// Helper to format date to "DD MMMM YYYY" (e.g., "20 Maret 2010")
function formatDate(dateString: string): string {
  if (!dateString) return "-";

  try {
    // Parsing string "DD/MM/YYYY" menjadi Date
    const date = parse(dateString, "dd/MM/yyyy", new Date());

    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "-";
    }

    // Format ke "dd MMMM yyyy" dengan locale Indonesia
    return format(date, "dd MMMM yyyy", { locale: id });
  } catch (error) {
    console.error("Error parsing date:", error);
    return "-";
  }
}

export default async function Home() {
  let data: SheetRow[] = [];
  let error: string | null = null;
  let headers: string[] = [];

  try {
    const rawData = await getSheetData();

    if (rawData.length > 0) {
      // Process rows: Calculate Age & Format Date
      data = rawData.map((row, index) => {
        const tanggalLahirRaw = String(row["TANGGAL LAHIR"] || "");
        const updatedRow: SheetRow & { _index: number } = {
          ...row,
          _index: index, // Adding original index for edit/delete
        };

        // 1. Calculate Age (if DOB exists)
        if (tanggalLahirRaw.trim()) {
          updatedRow["Umur"] = calculateAge(tanggalLahirRaw);
        }

        // 2. Format Date of Birth (if DOB exists)
        if (tanggalLahirRaw.trim()) {
          updatedRow["TANGGAL LAHIR"] = formatDate(tanggalLahirRaw);
        }

        return updatedRow;
      });
      // Headers come from first row which is data[0]'s keys if data exists?
      // getSheetData typically returns array of objects where keys are headers.
      // So Object.keys of first row is correct.
      if (data.length > 0) {
        headers = Object.keys(data[0]).filter(
          (k) => k !== "_index" && k !== "Timestamp" && k !== "Umur"
        ); // Exclude internal index, Timestamp, and Umur (calculated field)
      }
    }
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : "Failed to fetch data from Google Sheets";
    console.error("Error:", err);
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-sans">
      <Navbar />

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Error State */}
        {error && (
          <Card className="mx-auto mb-8 max-w-2xl border-l-4 border-l-red-500 border-y-0 border-r-0 shadow-lg bg-white dark:bg-slate-900 mt-8">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <span>⚠️</span> Terjadi Kesalahan
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-500 font-medium">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
                <p className="mb-3 text-sm font-bold text-red-900 dark:text-red-200">
                  Langkah Perbaikan:
                </p>
                <ol className="list-inside list-decimal space-y-2 text-sm text-red-800 dark:text-red-300">
                  <li>
                    Pastikan Service Account sudah dibuat di Google Cloud
                    Console
                  </li>
                  <li>
                    Cek kembali file{" "}
                    <code className="rounded bg-red-200/50 px-1.5 py-0.5 font-mono text-xs">
                      .env.local
                    </code>
                  </li>
                  <li>
                    Undang email service account sebagai <strong>Editor</strong>{" "}
                    di Google Sheet
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Content */}
        {!error && <DashboardClient initialData={data} headers={headers} />}
      </main>
    </div>
  );
}

import { getSheetData, SheetRow } from '@/lib/google-sheets';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Database } from 'lucide-react';
import { RefreshButton } from '@/components/refresh-button';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let data: SheetRow[] = [];
  let error: string | null = null;
  let headers: string[] = [];

  try {
    data = await getSheetData();
    if (data.length > 0) {
      headers = Object.keys(data[0]);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch data from Google Sheets';
    console.error('Error:', err);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Database className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
              Google Sheets Dashboard
            </h1>
          </div>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Data yang diambil langsung dari Google Sheets secara real-time
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mx-auto mb-8 max-w-2xl border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="text-red-900 dark:text-red-400">Error</CardTitle>
              <CardDescription className="text-red-700 dark:text-red-500">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-slate-100 p-4 dark:bg-slate-900">
                <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Untuk menggunakan aplikasi ini:
                </p>
                <ol className="list-inside list-decimal space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  <li>Buat Service Account di Google Cloud Console</li>
                  <li>Download JSON key file</li>
                  <li>Buat file <code className="rounded bg-slate-200 px-1 dark:bg-slate-800">.env.local</code></li>
                  <li>Tambahkan credentials (lihat <code className="rounded bg-slate-200 px-1 dark:bg-slate-800">env.example</code>)</li>
                  <li>Share Google Sheet dengan service account email</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        {!error && data.length > 0 && (
          <Card className="mx-auto shadow-xl backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-r from-indigo-500/10 to-blue-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Data dari Google Sheets</CardTitle>
                  <CardDescription className="mt-1">
                    Total {data.length} baris data
                  </CardDescription>
                </div>
<RefreshButton />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption className="mb-4">
                    Data diperbarui secara real-time dari Google Sheets
                  </TableCaption>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-900">
                      {headers.map((header) => (
                        <TableHead key={header} className="font-semibold">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, index) => (
                      <TableRow
                        key={index}
                        className="transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20"
                      >
                        {headers.map((header) => (
                          <TableCell key={`${index}-${header}`}>
                            {String(row[header] || '-')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!error && data.length === 0 && (
          <Card className="mx-auto max-w-md text-center">
            <CardHeader>
              <CardTitle>Tidak ada data</CardTitle>
              <CardDescription>
                Google Sheet kosong atau belum ada data yang tersedia
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}


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
import { RefreshButton } from '@/components/refresh-button';
import { DataDetailDialog } from '@/components/data-detail-dialog';
import { AddDataDialog } from '@/components/add-data-dialog';
import { Database } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Helper to calculate age from various date formats
function calculateAge(dateString: string): string {
  if (!dateString) return '-';

  try {
    // Handle Indonesian month names
    const monthMap: { [key: string]: string } = {
      'Januari': 'January', 'Februari': 'February', 'Maret': 'March',
      'April': 'April', 'Mei': 'May', 'Juni': 'June',
      'Juli': 'July', 'Agustus': 'August', 'September': 'September',
      'Oktober': 'October', 'November': 'November', 'Desember': 'December'
    };

    let processedDate = dateString;
    Object.keys(monthMap).forEach(indoMonth => {
      if (dateString.includes(indoMonth)) {
        processedDate = dateString.replace(indoMonth, monthMap[indoMonth]);
      }
    });

    const birthDate = new Date(processedDate);
    if (isNaN(birthDate.getTime())) return dateString; // Return original if parse fails

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  } catch (e) {
    return dateString;
  }
}

export default async function Home() {
  let data: SheetRow[] = [];
  let error: string | null = null;
  let headers: string[] = [];

  try {
    const rawData = await getSheetData();
    
    if (rawData.length > 0) {
      // Calculate Age for each row
      data = rawData.map(row => {
        const tanggalLahir = String(row['Tanggal Lahir'] || '');
        // Only override 'Umur' if 'Tanggal Lahir' is present
        if (tanggalLahir.trim()) {
           return {
             ...row,
             'Umur': calculateAge(tanggalLahir)
           };
        }
        // Otherwise keep original 'Umur' from sheet
        return row;
      });
      headers = Object.keys(data[0]);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch data from Google Sheets';
    console.error('Error:', err);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-sans">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-xl shadow-indigo-100/50 dark:bg-slate-900 dark:shadow-none mb-4 ring-1 ring-slate-100 dark:ring-slate-800">
            <Database className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
            Google Sheets Dashboard
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Platform monitoring data real-time yang terintegrasi langsung dengan Google Sheets Anda. Cepat, akurat, dan mudah digunakan.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mx-auto mb-8 max-w-2xl border-l-4 border-l-red-500 border-y-0 border-r-0 shadow-lg bg-white dark:bg-slate-900">
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
                  <li>Pastikan Service Account sudah dibuat di Google Cloud Console</li>
                  <li>Cek kembali file <code className="rounded bg-red-200/50 px-1.5 py-0.5 font-mono text-xs">.env.local</code></li>
                  <li>Undang email service account sebagai <strong>Editor</strong> di Google Sheet</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        {!error && data.length > 0 && (
          <Card className="mx-auto shadow-2xl shadow-indigo-200/50 dark:shadow-none border-0 ring-1 ring-slate-100 dark:ring-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-6 py-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">Live Data Overview</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2 justify-center sm:justify-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Menampilkan {data.length} baris data terbaru
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <AddDataDialog headers={headers} />
                  <RefreshButton />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900">
                      <TableHead className="w-[50px] text-center font-bold text-slate-900 dark:text-slate-200">#</TableHead>
                      {headers.map((header) => (
                        <TableHead key={header} className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">
                          {header}
                        </TableHead>
                      ))}
                      <TableHead className="w-[80px] text-center font-bold text-slate-900 dark:text-slate-200">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, index) => (
                      <TableRow
                        key={index}
                        className="group transition-all hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border-b border-slate-50 dark:border-slate-800/50"
                      >
                        <TableCell className="text-center font-medium text-slate-500 dark:text-slate-500 bg-slate-50/30 dark:bg-slate-900/30 group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-950/10">
                          {index + 1}
                        </TableCell>
                        {headers.map((header) => (
                          <TableCell key={`${index}-${header}`} className="font-medium text-slate-700 dark:text-slate-300">
                            {String(row[header] || '-')}
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <DataDetailDialog row={row} title={`Detail Data #${index + 1}`} />
                        </TableCell>
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Database className="h-10 w-10 text-slate-400" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Belum Ada Data</h3>
             <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                Google Sheet Anda sepertinya masih kosong. Silahkan isi data terlebih dahulu.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}

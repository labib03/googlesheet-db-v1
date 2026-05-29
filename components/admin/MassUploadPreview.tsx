"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, AlertCircle, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { processKeteranganAction } from "@/lib/keterangan-actions";
import { desaData } from "@/lib/constants";
import { isFuzzyNameMatch } from "@/lib/helper";

interface MassUploadPreviewProps {
  data: Record<string, string>[];
  existingData: Record<string, any>[];
  onSave: (data: Record<string, string>[]) => void;
  isSaving: boolean;
  onCancel: () => void;
}

function isValidDate(dateString: string) {
  if (!dateString) return false;
  // match dd/mm/yyyy or dd-mm-yyyy
  const regex = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
  const match = String(dateString).trim().match(regex);
  if (!match) return false;
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  
  if (month < 1 || month > 12) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;
  
  return true;
}

export function MassUploadPreview({ data, existingData, onSave, isSaving, onCancel }: MassUploadPreviewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "invalid">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [overrideSet, setOverrideSet] = useState<Set<number>>(new Set());

  const handleToggleOverride = (index: number) => {
    setOverrideSet(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  const handleTabChange = (tab: "all" | "invalid") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const requiredFields = [
    "NAMA LENGKAP",
    "JENIS KELAMIN",
    "TEMPAT LAHIR",
    "TANGGAL LAHIR",
    "NOMOR HP",
    "DESA",
    "KELOMPOK",
    "NAMA AYAH",
    "NAMA IBU"
  ];

  type ProcessedRow = Record<string, any> & {
    _originalIndex: number;
    _errors: string[];
    _isInvalid: boolean;
    _action: import("@/lib/keterangan-actions").KeteranganAction;
    _isUpdate: boolean;
    _isNew: boolean;
    _matchedExistingRow?: Record<string, any>;
    _overrideToNew?: boolean;
  };

  const existingByKelompok = new Map<string, Record<string, any>[]>();
  existingData.forEach((row) => {
    const kelompok = String(row["KELOMPOK"] || "").trim().toLowerCase();
    if (kelompok) {
      if (!existingByKelompok.has(kelompok)) existingByKelompok.set(kelompok, []);
      existingByKelompok.get(kelompok)!.push(row);
    }
  });

  const allColumns = data.length > 0 ? Object.keys(data[0]) : [];

  // Process data to identify invalid rows and actions
  const processedData: ProcessedRow[] = data.map((row, index) => {
    const missingFields = requiredFields.filter((field) => {
      const val = row[field];
      return val === undefined || val === null || String(val).trim() === "";
    });

    let isInvalid = missingFields.length > 0;
    const errors: string[] = [...missingFields.map(f => `Kosong: ${f}`)];

    const action = processKeteranganAction(row["KETERANGAN"], row);
    
    // validate date
    const dob = row["TANGGAL LAHIR"];
    if (dob && !isValidDate(dob)) {
      isInvalid = true;
      errors.push(`Format Tanggal Lahir salah (harus DD/MM/YYYY)`);
    }

    // validate desa kelompok
    const desa = String(row["DESA"] || "").trim();
    const kelompok = String(row["KELOMPOK"] || "").trim();
    if (desa && kelompok) {
      const foundDesaKey = Object.keys(desaData).find(d => d.toLowerCase() === desa.toLowerCase());
      if (!foundDesaKey) {
        isInvalid = true;
        errors.push(`Desa "${desa}" tidak valid`);
      } else {
        const validKelompoks = desaData[foundDesaKey];
        if (!validKelompoks.find(k => k.toLowerCase() === kelompok.toLowerCase())) {
          isInvalid = true;
          errors.push(`Kelompok "${kelompok}" bukan bagian dari Desa "${desa}"`);
        }
      }
    }

    // A row is invalid if missing required fields, EXCEPT if the action is HAPUS_DATA 
    // where maybe we only need NAMA LENGKAP and KELOMPOK.
    if (action === "HAPUS_DATA") {
        const missingKey = ["NAMA LENGKAP", "KELOMPOK"].filter((field) => !row[field]?.trim());
        isInvalid = missingKey.length > 0;
        
        if (!isInvalid) {
          errors.length = 0; // Clear all other errors if hapus data has keys
        } else {
          errors.length = 0;
          errors.push(`Kosong: ${missingKey.join(", ")}`);
        }
    }

    let isUpdate = false;
    let isNew = false;
    let matchedRow: Record<string, any> | undefined = undefined;
    
    if (!isInvalid && action !== "HAPUS_DATA") {
      const nama = String(row["NAMA LENGKAP"] || "").trim();
      const kelompokInput = String(row["KELOMPOK"] || "").trim().toLowerCase();
      
      const possibleMatches = existingByKelompok.get(kelompokInput) || [];
      for (const exRow of possibleMatches) {
        const exNama = String(exRow["NAMA LENGKAP"] || exRow["NAMA"] || "").trim();
        if (isFuzzyNameMatch(nama, exNama)) {
          isUpdate = true;
          matchedRow = exRow;
          break;
        }
      }

      if (!isUpdate) {
         isNew = true;
      }
    }

    const isOverride = overrideSet.has(index);

    return {
      ...row,
      _originalIndex: index,
      _errors: errors,
      _isInvalid: isInvalid,
      _action: action,
      _isUpdate: isUpdate && !isOverride,
      _isNew: isNew || (isUpdate && isOverride),
      _matchedExistingRow: matchedRow,
      _overrideToNew: isOverride,
    };
  });

  const invalidRows = processedData.filter((r) => r._isInvalid);
  const validRows = processedData.filter((r) => !r._isInvalid);
  
  const toDelete = processedData.filter(r => !r._isInvalid && r._action === "HAPUS_DATA").length;
  const toInsert = processedData.filter(r => r._isNew).length;
  const toUpdate = processedData.filter(r => r._isUpdate).length;

  const displayData = activeTab === "invalid" ? invalidRows : processedData;
  const totalPages = Math.ceil(displayData.length / itemsPerPage);
  const paginatedData = displayData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSave = () => {
    // Pass only valid rows to the API
    onSave(validRows.map(r => {
      const { _originalIndex, _errors, _isInvalid, _action, _isUpdate, _isNew, ...cleanRow } = r;
      return cleanRow;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-indigo-600">{processedData.length}</span>
            <span className="text-xs text-slate-500 font-semibold uppercase mt-1">Total Baris</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-emerald-600">{toInsert}</span>
            <span className="text-xs text-slate-500 font-semibold uppercase mt-1">Data Baru</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-blue-600">{toUpdate}</span>
            <span className="text-xs text-slate-500 font-semibold uppercase mt-1">Update Data</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-rose-600">{toDelete}</span>
            <span className="text-xs text-slate-500 font-semibold uppercase mt-1">Hapus Data</span>
          </CardContent>
        </Card>
        <Card className={invalidRows.length > 0 ? "border-amber-500 bg-amber-50" : ""}>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className={`text-3xl font-black ${invalidRows.length > 0 ? "text-amber-600" : "text-slate-600"}`}>
              {invalidRows.length}
            </span>
            <span className="text-xs text-slate-500 font-semibold uppercase mt-1">Tidak Valid</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Preview Data</CardTitle>
              <CardDescription>Periksa kembali data Anda sebelum disimpan.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === "all" ? "default" : "outline"}
                onClick={() => handleTabChange("all")}
                size="sm"
                className="rounded-full"
              >
                Semua Data
              </Button>
              <Button
                variant={activeTab === "invalid" ? "default" : "outline"}
                onClick={() => handleTabChange("invalid")}
                size="sm"
                className="rounded-full"
              >
                Tidak Valid ({invalidRows.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-white dark:bg-slate-950 z-20 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Status</TableHead>
                  <TableHead className="sticky left-[90px] bg-white dark:bg-slate-950 z-20 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[150px] max-w-[200px] whitespace-normal break-words">Info Detail</TableHead>
                  {allColumns.map(col => (
                    <TableHead key={col} className="min-w-[150px] max-w-[250px] whitespace-normal break-words">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={allColumns.length + 2} className="h-24 text-center text-slate-500">
                      Tidak ada data yang ditampilkan.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => (
                    <TableRow key={row._originalIndex} className={row._isInvalid ? "bg-amber-50/50 hover:bg-amber-50/50" : ""}>
                      <TableCell className="sticky left-0 bg-white dark:bg-slate-950 z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        {row._isInvalid ? (
                          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Invalid
                          </Badge>
                        ) : row._action === "HAPUS_DATA" ? (
                          <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-200">
                             <Trash2 className="w-3 h-3 mr-1" />
                             Hapus
                          </Badge>
                        ) : row._isNew ? (
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Baru
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Update
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="sticky left-[90px] bg-white dark:bg-slate-950 z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[150px] max-w-[200px] align-top whitespace-normal break-words">
                        {row._isInvalid ? (
                          <span className="text-xs text-amber-600 flex flex-col gap-1">
                            {row._errors.map((e, idx) => (
                               <span key={idx} className="flex items-start gap-1">
                                  <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  <span>{e}</span>
                               </span>
                            ))}
                          </span>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <span className="text-xs text-slate-400">Ok</span>
                            {row._matchedExistingRow && (
                              <div className="p-2 bg-slate-50 border border-slate-100 rounded-md">
                                <p className="text-[10px] text-slate-500 font-semibold mb-1">Mungkin Ganda Dengan:</p>
                                <p className="text-xs font-medium text-slate-700">{row._matchedExistingRow["NAMA LENGKAP"] || row._matchedExistingRow["NAMA"]}</p>
                                <p className="text-[10px] text-slate-500">{row._matchedExistingRow["KELOMPOK"]}</p>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full mt-2 h-7 text-[10px]"
                                  onClick={() => handleToggleOverride(row._originalIndex)}
                                >
                                  {row._overrideToNew ? "Kembalikan (Update)" : "Jadikan Baru (Insert)"}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      {allColumns.map(col => (
                        <TableCell key={col} className="min-w-[150px] max-w-[250px] whitespace-normal break-words align-top">
                          {row[col] ? (
                            col === "KETERANGAN" ? (
                                <span className="inline-block px-2 py-1 bg-slate-100 text-xs rounded font-semibold text-slate-600">
                                  {row[col]}
                                </span>
                            ) : row[col]
                          ) : "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {displayData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-2 gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, displayData.length)} dari {displayData.length} data
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Per halaman:</span>
                  <select 
                    className="border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 py-1 px-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          Batal
        </Button>
        <Button onClick={handleSave} disabled={isSaving || validRows.length === 0} className="bg-indigo-600 hover:bg-indigo-700">
          {isSaving ? "Menyimpan..." : `Simpan ${validRows.length} Data Valid`}
        </Button>
      </div>
    </div>
  );
}

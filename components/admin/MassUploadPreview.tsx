"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, AlertCircle, Trash2, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [activeTab, setActiveTab] = useState<"all" | "insert" | "update" | "aktif" | "tidak_aktif" | "invalid">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [overrideSet, setOverrideSet] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedSet, setSelectedSet] = useState<Set<number>>(() => {
    const initialSelected = new Set<number>();
    data.forEach((row, index) => {
      const missing = ["NAMA LENGKAP", "JENIS KELAMIN", "DESA", "KELOMPOK"].filter(
        f => !row[f] && !row[f === "NAMA LENGKAP" ? "Nama Lengkap" : f === "JENIS KELAMIN" ? "Jenis Kelamin" : f === "DESA" ? "Desa" : "Kelompok"]
      );
      if (missing.length === 0) {
        initialSelected.add(index);
      }
    });
    return initialSelected;
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [modalCategory, setModalCategory] = useState<"insert" | "update" | "trash" | "bypassed" | null>(null);

  const handleToggleOverride = (index: number) => {
    setOverrideSet(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  const handleTabChange = (tab: "all" | "insert" | "update" | "aktif" | "tidak_aktif" | "invalid") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleToggleSelectRow = (index: number, isInvalid: boolean) => {
    if (isInvalid) return;
    setSelectedSet(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Only key identifier fields are strictly required
  const requiredFields = [
    "NAMA LENGKAP",
    "JENIS KELAMIN",
    "DESA",
    "KELOMPOK"
  ];

  type ProcessedRow = Record<string, any> & {
    _originalIndex: number;
    _errors: string[];
    _isInvalid: boolean;
    _action: import("@/lib/keterangan-actions").KeteranganAction;
    _isUpdate: boolean;
    _isNew: boolean;
    _isAktif: boolean;
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

  // Helper to determine if Keterangan value indicates active vs inactive
  const isRowAktif = (keteranganVal: any, action: string): boolean => {
    if (action === "HAPUS_DATA" || action === "SUDAH_MENIKAH") return false;
    if (!keteranganVal) return true;
    const str = String(keteranganVal).trim().toLowerCase();
    if (
      str.includes("tidak") ||
      str.includes("non") ||
      str.includes("pindah") ||
      str.includes("menikah") ||
      str.includes("hapus") ||
      str.includes("keluar") ||
      str.includes("alumni") ||
      str.includes("off")
    ) {
      return false;
    }
    return true;
  };

  // Process data to identify invalid rows and actions
  const processedData: ProcessedRow[] = data.map((row, index) => {
    const missingFields = requiredFields.filter((field) => {
      const val = row[field];
      return val === undefined || val === null || String(val).trim() === "";
    });

    let isInvalid = missingFields.length > 0;
    const errors: string[] = [...missingFields.map(f => `Kosong: ${f}`)];

    const keteranganVal = row["KETERANGAN"] || row["Keterangan"];
    const action = processKeteranganAction(keteranganVal, row);
    const isAktif = isRowAktif(keteranganVal, action);

    // validate date ONLY if non-empty
    const dob = row["TANGGAL LAHIR"] || row["Tanggal Lahir"];
    if (dob && String(dob).trim() !== "" && !isValidDate(dob)) {
      isInvalid = true;
      errors.push(`Format Tanggal Lahir salah (harus DD/MM/YYYY)`);
    }

    // validate desa kelompok
    const desa = String(row["DESA"] || row["Desa"] || "").trim();
    const kelompok = String(row["KELOMPOK"] || row["Kelompok"] || "").trim();
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
    if (action === "HAPUS_DATA") {
        const missingKey = ["NAMA LENGKAP", "KELOMPOK"].filter((field) => !row[field]?.trim());
        isInvalid = missingKey.length > 0;
        
        if (!isInvalid) {
          errors.length = 0;
        } else {
          errors.length = 0;
          errors.push(`Kosong: ${missingKey.join(", ")}`);
        }
    }

    let isUpdate = false;
    let isNew = false;
    let matchedRow: Record<string, any> | undefined = undefined;
    
    if (!isInvalid) {
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

      if (!isUpdate && action !== "HAPUS_DATA") {
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
      _isAktif: isAktif,
      _isUpdate: action !== "HAPUS_DATA" && isUpdate && !isOverride,
      _isNew: action !== "HAPUS_DATA" && (isNew || (isUpdate && isOverride)),
      _matchedExistingRow: matchedRow,
      _overrideToNew: isOverride,
    };
  });

  const invalidRows = processedData.filter((r) => r._isInvalid);
  const validRows = processedData.filter((r) => !r._isInvalid);
  const aktifRows = processedData.filter((r) => !r._isInvalid && r._isAktif);
  const tidakAktifRows = processedData.filter((r) => !r._isInvalid && !r._isAktif);
  const insertRows = processedData.filter((r) => r._isNew);
  const updateRows = processedData.filter((r) => r._isUpdate);
  
  const toDelete = processedData.filter(r => !r._isInvalid && r._action === "HAPUS_DATA").length;
  const toInsert = insertRows.length;
  const toUpdate = updateRows.length;

  let displayData = processedData;
  if (activeTab === "insert") displayData = insertRows;
  else if (activeTab === "update") displayData = updateRows;
  else if (activeTab === "aktif") displayData = aktifRows;
  else if (activeTab === "tidak_aktif") displayData = tidakAktifRows;
  else if (activeTab === "invalid") displayData = invalidRows;

  // Filter displayData by search query
  if (searchQuery.trim() !== "") {
    const q = searchQuery.trim().toLowerCase();
    displayData = displayData.filter((row) => {
      const nama = String(row["NAMA LENGKAP"] || row["Nama Lengkap"] || "").toLowerCase();
      const desa = String(row["DESA"] || row["Desa"] || "").toLowerCase();
      const kelompok = String(row["KELOMPOK"] || row["Kelompok"] || "").toLowerCase();
      const tempatLahir = String(row["TEMPAT LAHIR"] || row["Tempat Lahir"] || "").toLowerCase();
      return nama.includes(q) || desa.includes(q) || kelompok.includes(q) || tempatLahir.includes(q);
    });
  }

  const totalPages = Math.ceil(displayData.length / itemsPerPage);
  const paginatedData = displayData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Select All logic for current displayData
  const validDisplayRows = displayData.filter(r => !r._isInvalid);
  const allValidDisplaySelected = validDisplayRows.length > 0 && validDisplayRows.every(r => selectedSet.has(r._originalIndex));
  const someValidDisplaySelected = validDisplayRows.some(r => selectedSet.has(r._originalIndex)) && !allValidDisplaySelected;

  const handleToggleSelectAll = () => {
    if (allValidDisplaySelected) {
      setSelectedSet(prev => {
        const next = new Set(prev);
        validDisplayRows.forEach(r => next.delete(r._originalIndex));
        return next;
      });
    } else {
      setSelectedSet(prev => {
        const next = new Set(prev);
        validDisplayRows.forEach(r => next.add(r._originalIndex));
        return next;
      });
    }
  };

  const selectedValidRows = validRows.filter(r => selectedSet.has(r._originalIndex));
  const selectedInsertRows = selectedValidRows.filter(r => r._isNew);
  const selectedUpdateRows = selectedValidRows.filter(r => r._isUpdate);
  const selectedTrashRows = selectedValidRows.filter(r => r._action === "HAPUS_DATA" && r._matchedExistingRow);
  const selectedBypassedRows = selectedValidRows.filter(r => r._action === "HAPUS_DATA" && !r._matchedExistingRow);

  const selectedInsertCount = selectedInsertRows.length;
  const selectedUpdateCount = selectedUpdateRows.length;
  const selectedTrashCount = selectedTrashRows.length;
  const selectedBypassedCount = selectedBypassedRows.length;

  let modalCategoryRows: ProcessedRow[] = [];
  let modalCategoryTitle = "";
  let modalCategoryTargetTab: "all" | "insert" | "update" | "aktif" | "tidak_aktif" | "invalid" = "all";

  if (modalCategory === "insert") {
    modalCategoryRows = selectedInsertRows;
    modalCategoryTitle = "Data Baru (Insert)";
    modalCategoryTargetTab = "insert";
  } else if (modalCategory === "update") {
    modalCategoryRows = selectedUpdateRows;
    modalCategoryTitle = "Update Data";
    modalCategoryTargetTab = "update";
  } else if (modalCategory === "trash") {
    modalCategoryRows = selectedTrashRows;
    modalCategoryTitle = "Pindah ke Trash";
    modalCategoryTargetTab = "tidak_aktif";
  } else if (modalCategory === "bypassed") {
    modalCategoryRows = selectedBypassedRows;
    modalCategoryTitle = "Diabaikan / Skip";
    modalCategoryTargetTab = "tidak_aktif";
  }

  const handleSave = () => {
    // Pass only valid AND selected rows to the API
    onSave(selectedValidRows.map(r => {
      const { _originalIndex, _errors, _isInvalid, _action, _isUpdate, _isNew, _isAktif, _matchedExistingRow, _overrideToNew, ...cleanRow } = r;
      return cleanRow;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:scale-[1.02] ${activeTab === "all" ? "ring-2 ring-indigo-500 shadow-md" : ""}`}
          onClick={() => handleTabChange("all")}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-indigo-600">{processedData.length}</span>
            <span className="text-xs text-slate-500 font-semibold uppercase mt-1">Total Baris</span>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:scale-[1.02] ${activeTab === "insert" ? "ring-2 ring-emerald-500 shadow-md" : ""}`}
          onClick={() => handleTabChange("insert")}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-emerald-600">{toInsert}</span>
            <span className="text-xs text-slate-500 font-semibold uppercase mt-1">Data Baru (Insert)</span>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:scale-[1.02] ${activeTab === "update" ? "ring-2 ring-blue-500 shadow-md" : ""}`}
          onClick={() => handleTabChange("update")}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-blue-600">{toUpdate}</span>
            <span className="text-xs text-slate-500 font-semibold uppercase mt-1">Update Data</span>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:scale-[1.02] ${activeTab === "tidak_aktif" ? "ring-2 ring-amber-500 shadow-md" : ""}`}
          onClick={() => handleTabChange("tidak_aktif")}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-amber-600">{tidakAktifRows.length}</span>
            <span className="text-xs text-slate-500 font-semibold uppercase mt-1">Tidak Aktif</span>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:scale-[1.02] ${activeTab === "invalid" ? "ring-2 ring-rose-500 shadow-md bg-amber-50/50" : invalidRows.length > 0 ? "border-amber-500 bg-amber-50" : ""}`}
          onClick={() => handleTabChange("invalid")}
        >
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Preview Data</CardTitle>
              <CardDescription>
                Filter aktif: <span className="font-bold text-slate-700 dark:text-slate-200 uppercase">{activeTab.replace("_", " ")}</span> ({displayData.length} data, <span className="text-emerald-600 font-semibold">{selectedValidRows.length} terpilih</span>)
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, desa, kelompok..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-9 py-1.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-white dark:bg-slate-950 z-20 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-[45px] min-w-[45px] text-center">
                    <input
                      type="checkbox"
                      checked={allValidDisplaySelected}
                      ref={el => { if (el) el.indeterminate = someValidDisplaySelected; }}
                      onChange={handleToggleSelectAll}
                      disabled={validDisplayRows.length === 0}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </TableHead>
                  <TableHead className="sticky left-[45px] bg-white dark:bg-slate-950 z-20 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[90px]">Status</TableHead>
                  <TableHead className="sticky left-[135px] bg-white dark:bg-slate-950 z-20 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[150px] max-w-[200px] whitespace-normal break-words">Info Detail</TableHead>
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
                    <TableCell colSpan={allColumns.length + 3} className="h-24 text-center text-slate-500">
                      Tidak ada data yang ditampilkan.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => (
                    <TableRow key={row._originalIndex} className={row._isInvalid ? "bg-amber-50/50 hover:bg-amber-50/50" : selectedSet.has(row._originalIndex) ? "bg-indigo-50/20" : ""}>
                      <TableCell className="sticky left-0 bg-white dark:bg-slate-950 z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-center">
                        <input
                          type="checkbox"
                          checked={selectedSet.has(row._originalIndex)}
                          disabled={row._isInvalid}
                          onChange={() => handleToggleSelectRow(row._originalIndex, row._isInvalid)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      </TableCell>
                      <TableCell className="sticky left-[45px] bg-white dark:bg-slate-950 z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
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
                      <TableCell className="sticky left-[135px] bg-white dark:bg-slate-950 z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[150px] max-w-[200px] align-top whitespace-normal break-words">
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
        <Button onClick={() => setShowConfirmDialog(true)} disabled={isSaving || selectedValidRows.length === 0} className="bg-indigo-600 hover:bg-indigo-700">
          {isSaving ? "Menyimpan..." : `Simpan ${selectedValidRows.length} Data Terpilih`}
        </Button>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-600" />
              Konfirmasi Mass Upload
            </DialogTitle>
            <DialogDescription>
              Tinjau ringkasan data sebelum disimpan. Klik pada setiap kartu untuk melihat detail nama data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Data Terpilih</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{selectedValidRows.length} Baris</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div 
                className={`p-3 bg-emerald-50 border rounded-lg text-emerald-900 cursor-pointer transition-all hover:scale-[1.02] ${modalCategory === "insert" ? "ring-2 ring-emerald-500 border-emerald-400 shadow-md" : "border-emerald-200"}`}
                onClick={() => setModalCategory(modalCategory === "insert" ? null : "insert")}
              >
                <div className="flex items-center justify-between text-emerald-700 font-semibold text-xs uppercase mb-1">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Data Baru
                  </span>
                  <span className="text-[10px] underline">
                    {modalCategory === "insert" ? "Tutup" : "Klik Detail"}
                  </span>
                </div>
                <span className="text-2xl font-black text-emerald-700">{selectedInsertCount}</span>
              </div>

              <div 
                className={`p-3 bg-blue-50 border rounded-lg text-blue-900 cursor-pointer transition-all hover:scale-[1.02] ${modalCategory === "update" ? "ring-2 ring-blue-500 border-blue-400 shadow-md" : "border-blue-200"}`}
                onClick={() => setModalCategory(modalCategory === "update" ? null : "update")}
              >
                <div className="flex items-center justify-between text-blue-700 font-semibold text-xs uppercase mb-1">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Update Data
                  </span>
                  <span className="text-[10px] underline">
                    {modalCategory === "update" ? "Tutup" : "Klik Detail"}
                  </span>
                </div>
                <span className="text-2xl font-black text-blue-700">{selectedUpdateCount}</span>
              </div>

              <div 
                className={`p-3 bg-rose-50 border rounded-lg text-rose-900 cursor-pointer transition-all hover:scale-[1.02] ${modalCategory === "trash" ? "ring-2 ring-rose-500 border-rose-400 shadow-md" : "border-rose-200"}`}
                onClick={() => setModalCategory(modalCategory === "trash" ? null : "trash")}
              >
                <div className="flex items-center justify-between text-rose-700 font-semibold text-xs uppercase mb-1">
                  <span className="flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                    Ke Trash
                  </span>
                  <span className="text-[10px] underline">
                    {modalCategory === "trash" ? "Tutup" : "Klik Detail"}
                  </span>
                </div>
                <span className="text-2xl font-black text-rose-700">{selectedTrashCount}</span>
              </div>

              <div 
                className={`p-3 bg-slate-100 border rounded-lg text-slate-700 cursor-pointer transition-all hover:scale-[1.02] ${modalCategory === "bypassed" ? "ring-2 ring-slate-400 border-slate-300 shadow-md" : "border-slate-200"}`}
                onClick={() => setModalCategory(modalCategory === "bypassed" ? null : "bypassed")}
              >
                <div className="flex items-center justify-between text-slate-600 font-semibold text-xs uppercase mb-1">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Diabaikan / Skip
                  </span>
                  <span className="text-[10px] underline">
                    {modalCategory === "bypassed" ? "Tutup" : "Klik Detail"}
                  </span>
                </div>
                <span className="text-2xl font-black text-slate-700">{selectedBypassedCount}</span>
              </div>
            </div>

            {modalCategory && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">
                    Detail: {modalCategoryTitle} ({modalCategoryRows.length})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 px-2 py-0"
                    onClick={() => {
                      handleTabChange(modalCategoryTargetTab);
                      setShowConfirmDialog(false);
                    }}
                  >
                    Buka di Tabel Preview →
                  </Button>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                  {modalCategoryRows.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">Tidak ada data dalam kategori ini.</p>
                  ) : (
                    modalCategoryRows.map((r, idx) => (
                      <div key={idx} className="pt-1.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[260px]">
                          {String(r["NAMA LENGKAP"] || r["Nama Lengkap"] || "-")}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {String(r["KELOMPOK"] || r["Kelompok"] || "-")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {selectedTrashCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Peringatan:</span> Terdapat <strong>{selectedTrashCount} data</strong> yang ditandai "Tidak Aktif" / "Hapus Data". Data asli dari spreadsheet akan dipindahkan ke sheet <strong>Trash</strong>.
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              onClick={() => {
                setShowConfirmDialog(false);
                handleSave();
              }}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSaving ? "Menyimpan..." : "Konfirmasi & Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

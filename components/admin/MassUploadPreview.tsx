"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  X,
  Users,
  FileSpreadsheet
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  processKeteranganAction, 
  isKeteranganInactive, 
  inferTrashMetadata 
} from "@/lib/keterangan-actions";
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
  const [selectedKelompok, setSelectedKelompok] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [overrideSet, setOverrideSet] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Inactive / Trash metadata state (IsMarried and IsPindahSambung)
  const [trashMetadataState, setTrashMetadataState] = useState<
    Record<number, { isMarried: boolean; isPindahSambung: boolean }>
  >(() => {
    const initialMap: Record<number, { isMarried: boolean; isPindahSambung: boolean }> = {};
    data.forEach((row, index) => {
      const ket = row["KETERANGAN"] || row["Keterangan"];
      initialMap[index] = inferTrashMetadata(ket);
    });
    return initialMap;
  });

  const handleToggleTrashMeta = (index: number, field: "isMarried" | "isPindahSambung") => {
    setTrashMetadataState((prev) => {
      const current = prev[index] || { isMarried: false, isPindahSambung: false };
      return {
        ...prev,
        [index]: {
          ...current,
          [field]: !current[field],
        },
      };
    });
  };

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
    _fileName?: string;
    _trashMeta: { isMarried: boolean; isPindahSambung: boolean };
  };

  const existingByKelompok = new Map<string, Record<string, any>[]>();
  existingData.forEach((row) => {
    const kelompok = String(row["KELOMPOK"] || "").trim().toLowerCase();
    if (kelompok) {
      if (!existingByKelompok.has(kelompok)) existingByKelompok.set(kelompok, []);
      existingByKelompok.get(kelompok)!.push(row);
    }
  });

  // Exclude internal underscore-prefixed fields from generic column rendering
  const allColumns = data.length > 0 ? Object.keys(data[0]).filter(k => !k.startsWith("_")) : [];

  // Helper to determine if Keterangan value indicates active vs inactive
  const isRowAktif = (keteranganVal: any, action: string): boolean => {
    if (action === "HAPUS_DATA" || action === "SUDAH_MENIKAH") return false;
    return !isKeteranganInactive(keteranganVal);
  };

  // Process data to identify invalid rows and actions
  const processedData: ProcessedRow[] = useMemo(() => {
    return data.map((row, index) => {
      const missingFields = requiredFields.filter((field) => {
        const val = row[field];
        return val === undefined || val === null || String(val).trim() === "";
      });

      let isInvalid = missingFields.length > 0;
      const errors: string[] = [...missingFields.map(f => `Kosong: ${f}`)];

      const keteranganVal = row["KETERANGAN"] || row["Keterangan"];
      const action = processKeteranganAction(keteranganVal, row);
      const isAktif = isRowAktif(keteranganVal, action);
      const isInactiveAction = action === "HAPUS_DATA" || action === "SUDAH_MENIKAH" || !isAktif;

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

      // A row is invalid if missing required fields, EXCEPT if the action is inactive/hapus
      if (isInactiveAction) {
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

        if (!isUpdate && !isInactiveAction) {
          isNew = true;
        }
      }

      const isOverride = overrideSet.has(index);
      const trashMeta = trashMetadataState[index] || inferTrashMetadata(keteranganVal);

      return {
        ...row,
        _originalIndex: index,
        _errors: errors,
        _isInvalid: isInvalid,
        _action: action,
        _isAktif: isAktif,
        _isUpdate: !isInactiveAction && isUpdate && !isOverride,
        _isNew: !isInactiveAction && (isNew || (isUpdate && isOverride)),
        _matchedExistingRow: matchedRow,
        _overrideToNew: isOverride,
        _fileName: row._fileName,
        _trashMeta: trashMeta,
      };
    });
  }, [data, existingData, overrideSet, trashMetadataState]);

  const invalidRows = useMemo(() => processedData.filter((r) => r._isInvalid), [processedData]);
  const validRows = useMemo(() => processedData.filter((r) => !r._isInvalid), [processedData]);
  const aktifRows = useMemo(() => processedData.filter((r) => !r._isInvalid && r._isAktif), [processedData]);
  const tidakAktifRows = useMemo(() => processedData.filter((r) => !r._isInvalid && !r._isAktif), [processedData]);
  const insertRows = useMemo(() => processedData.filter((r) => r._isNew), [processedData]);
  const updateRows = useMemo(() => processedData.filter((r) => r._isUpdate), [processedData]);
  
  const toInsert = insertRows.length;
  const toUpdate = updateRows.length;

  // Compute rows matching current active status tab
  const currentStatusRows = useMemo(() => {
    if (activeTab === "insert") return insertRows;
    if (activeTab === "update") return updateRows;
    if (activeTab === "aktif") return aktifRows;
    if (activeTab === "tidak_aktif") return tidakAktifRows;
    if (activeTab === "invalid") return invalidRows;
    return processedData;
  }, [activeTab, insertRows, updateRows, aktifRows, tidakAktifRows, invalidRows, processedData]);

  // Extract unique Kelompok list and calculate dynamic counts based on current status tab
  const kelompokSummary = useMemo(() => {
    // 1. Get all unique kelompoks from all data
    const allKelompoks = new Set<string>();
    processedData.forEach((row) => {
      const k = String(row["KELOMPOK"] || row["Kelompok"] || "").trim();
      allKelompoks.add(k || "Tanpa Kelompok");
    });

    // 2. Count occurrences within currentStatusRows
    const activeMap = new Map<string, number>();
    currentStatusRows.forEach((row) => {
      const k = String(row["KELOMPOK"] || row["Kelompok"] || "").trim();
      const key = k || "Tanpa Kelompok";
      activeMap.set(key, (activeMap.get(key) || 0) + 1);
    });

    const list: { name: string; count: number }[] = [];
    allKelompoks.forEach((name) => {
      const count = activeMap.get(name) || 0;
      list.push({ name, count });
    });

    // Sort alphabetically, with Tanpa Kelompok at the end
    list.sort((a, b) => {
      if (a.name === "Tanpa Kelompok") return 1;
      if (b.name === "Tanpa Kelompok") return -1;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [processedData, currentStatusRows]);

  let displayData = currentStatusRows;

  // Filter by Kelompok
  if (selectedKelompok !== "all") {
    displayData = displayData.filter((row) => {
      const k = String(row["KELOMPOK"] || row["Kelompok"] || "").trim();
      if (selectedKelompok === "Tanpa Kelompok") {
        return !k;
      }
      return k.toLowerCase() === selectedKelompok.toLowerCase();
    });
  }

  // Filter displayData by search query
  if (searchQuery.trim() !== "") {
    const q = searchQuery.trim().toLowerCase();
    displayData = displayData.filter((row) => {
      const nama = String(row["NAMA LENGKAP"] || row["Nama Lengkap"] || "").toLowerCase();
      const desa = String(row["DESA"] || row["Desa"] || "").toLowerCase();
      const kelompok = String(row["KELOMPOK"] || row["Kelompok"] || "").toLowerCase();
      const tempatLahir = String(row["TEMPAT LAHIR"] || row["Tempat Lahir"] || "").toLowerCase();
      const fileName = String(row._fileName || "").toLowerCase();
      return nama.includes(q) || desa.includes(q) || kelompok.includes(q) || tempatLahir.includes(q) || fileName.includes(q);
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
  const selectedTrashRows = selectedValidRows.filter(r => !r._isAktif && r._matchedExistingRow);
  const selectedBypassedRows = selectedValidRows.filter(r => !r._isAktif && !r._matchedExistingRow);

  const selectedInsertCount = selectedInsertRows.length;
  const selectedUpdateCount = selectedUpdateRows.length;
  const selectedTrashCount = selectedTrashRows.length;
  const selectedBypassedCount = selectedBypassedRows.length;

  const selectedTrashMarriedCount = selectedTrashRows.filter(r => r._trashMeta?.isMarried).length;
  const selectedTrashPindahCount = selectedTrashRows.filter(r => r._trashMeta?.isPindahSambung).length;

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
    // Pass only valid AND selected rows to the API, stripping internal metadata keys
    onSave(selectedValidRows.map(r => {
      const cleanRow: Record<string, any> = {};
      Object.keys(r).forEach(key => {
        if (!key.startsWith("_")) {
          cleanRow[key] = r[key];
        }
      });
      if (!r._isAktif || r._action === "HAPUS_DATA" || r._action === "SUDAH_MENIKAH") {
        cleanRow["IsMarried"] = r._trashMeta?.isMarried ? 1 : 0;
        cleanRow["IsPindahSambung"] = r._trashMeta?.isPindahSambung ? 1 : 0;
      }
      return cleanRow;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:scale-[1.01] ${activeTab === "all" ? "ring-2 ring-indigo-500 shadow-md bg-indigo-50/20 dark:bg-indigo-950/20" : "bg-white dark:bg-slate-900"}`}
          onClick={() => handleTabChange("all")}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{processedData.length}</span>
            <span className="text-xs text-slate-500 font-semibold uppercase mt-1">Total Baris</span>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:scale-[1.01] ${activeTab === "insert" ? "ring-2 ring-emerald-500 shadow-md bg-emerald-50/20 dark:bg-emerald-950/20" : "bg-white dark:bg-slate-900"}`}
          onClick={() => handleTabChange("insert")}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{toInsert}</span>
            <span className="text-xs text-slate-500 font-semibold uppercase mt-1">Data Baru (Insert)</span>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:scale-[1.01] ${activeTab === "update" ? "ring-2 ring-blue-500 shadow-md bg-blue-50/20 dark:bg-blue-950/20" : "bg-white dark:bg-slate-900"}`}
          onClick={() => handleTabChange("update")}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">{toUpdate}</span>
            <span className="text-xs text-slate-500 font-semibold uppercase mt-1">Update Data</span>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:scale-[1.01] ${activeTab === "tidak_aktif" ? "ring-2 ring-amber-500 shadow-md bg-amber-50/20 dark:bg-amber-950/20" : "bg-white dark:bg-slate-900"}`}
          onClick={() => handleTabChange("tidak_aktif")}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{tidakAktifRows.length}</span>
            <span className="text-xs text-slate-500 font-semibold uppercase mt-1">Tidak Aktif</span>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:scale-[1.01] ${activeTab === "invalid" ? "ring-2 ring-rose-500 shadow-md bg-rose-50/20 dark:bg-rose-950/20" : invalidRows.length > 0 ? "border-amber-400 bg-amber-50/30" : "bg-white dark:bg-slate-900"}`}
          onClick={() => handleTabChange("invalid")}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className={`text-2xl sm:text-3xl font-black ${invalidRows.length > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-600 dark:text-slate-400"}`}>
              {invalidRows.length}
            </span>
            <span className="text-xs text-slate-500 font-semibold uppercase mt-1">Tidak Valid</span>
          </CardContent>
        </Card>
      </div>

      {/* Main Preview Card with Unified Header Toolbar */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left Title & Status Indicator */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Preview Data Upload
                </CardTitle>
                <Badge variant="outline" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 text-xs">
                  Status: {activeTab === "all" ? "Semua Status" : activeTab === "insert" ? "Data Baru" : activeTab === "update" ? "Update Data" : activeTab === "tidak_aktif" ? "Tidak Aktif" : "Tidak Valid"}
                </Badge>
                {selectedKelompok !== "all" && (
                  <Badge className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-semibold px-2 py-0.5 text-xs flex items-center gap-1">
                    Kelompok: {selectedKelompok}
                    <button 
                      onClick={() => { setSelectedKelompok("all"); setCurrentPage(1); }}
                      className="ml-0.5 hover:text-indigo-900 dark:hover:text-white"
                      title="Hapus filter kelompok"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs text-slate-500">
                Menampilkan <span className="font-semibold text-slate-700 dark:text-slate-300">{displayData.length}</span> baris data (<span className="text-emerald-600 dark:text-emerald-400 font-semibold">{selectedValidRows.length} data terpilih</span> untuk disimpan)
              </CardDescription>
            </div>

            {/* Right Controls: Kelompok Select + Search Bar */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {/* Kelompok Combobox / Select with dynamic counts */}
              <div className="relative w-full sm:w-auto min-w-[200px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Users className="w-4 h-4" />
                </div>
                <select
                  value={selectedKelompok}
                  onChange={(e) => {
                    setSelectedKelompok(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-56 pl-9 pr-8 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer appearance-none"
                >
                  <option value="all">
                    Semua Kelompok ({currentStatusRows.length})
                  </option>
                  {kelompokSummary.map((k) => (
                    <option key={k.name} value={k.name}>
                      {k.name} ({k.count})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, kelompok, file..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-9 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
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
                  <TableHead className="sticky left-[135px] bg-white dark:bg-slate-950 z-20 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[190px] max-w-[240px] whitespace-normal break-words">Info & Sumber</TableHead>
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
                        ) : !row._isAktif || row._action === "HAPUS_DATA" || row._action === "SUDAH_MENIKAH" ? (
                          <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-200">
                             <Trash2 className="w-3 h-3 mr-1" />
                             Trash
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
                      <TableCell className="sticky left-[135px] bg-white dark:bg-slate-950 z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[190px] max-w-[240px] align-top whitespace-normal break-words">
                        <div className="flex flex-col gap-2">
                          {/* File source badge */}
                          {row._fileName && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[210px]" title={row._fileName}>
                              <FileSpreadsheet className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{row._fileName}</span>
                            </span>
                          )}

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
                              {/* Inactive / Trash metadata inline controls */}
                              {(!row._isAktif || row._action === "HAPUS_DATA" || row._action === "SUDAH_MENIKAH") && (
                                <div className="p-2 bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-lg space-y-1.5">
                                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                    Status Trash:
                                  </span>
                                  <div className="flex flex-col gap-1">
                                    <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600">
                                      <input
                                        type="checkbox"
                                        checked={row._trashMeta?.isMarried ?? false}
                                        onChange={() => handleToggleTrashMeta(row._originalIndex, "isMarried")}
                                        className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                      />
                                      <span>Sudah Menikah</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600">
                                      <input
                                        type="checkbox"
                                        checked={row._trashMeta?.isPindahSambung ?? false}
                                        onChange={() => handleToggleTrashMeta(row._originalIndex, "isPindahSambung")}
                                        className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                      />
                                      <span>Pindah Sambung</span>
                                    </label>
                                  </div>
                                </div>
                              )}

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
                        </div>
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

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          Batal
        </Button>
        <Button onClick={() => setShowConfirmDialog(true)} disabled={isSaving || selectedValidRows.length === 0} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20">
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
                        <div className="flex items-center gap-2 truncate max-w-[260px]">
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {String(r["NAMA LENGKAP"] || r["Nama Lengkap"] || "-")}
                          </span>
                          {r._fileName && (
                            <span className="text-[9px] text-slate-400 truncate">({r._fileName})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {r._trashMeta?.isMarried && (
                            <span className="text-[9px] bg-rose-100 text-rose-700 px-1 py-0.5 rounded font-semibold">
                              Menikah
                            </span>
                          )}
                          {r._trashMeta?.isPindahSambung && (
                            <span className="text-[9px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded font-semibold">
                              Pindah
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {String(r["KELOMPOK"] || r["Kelompok"] || "-")}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {selectedTrashCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div>
                    <span className="font-bold">Peringatan:</span> Terdapat <strong>{selectedTrashCount} data</strong> yang ditandai "Tidak Aktif" / "Hapus Data". Data asli dari spreadsheet akan dipindahkan ke sheet <strong>Trash</strong>.
                  </div>
                  <div className="text-[11px] text-amber-800">
                    Status Metadata: <strong>{selectedTrashMarriedCount} Sudah Menikah</strong>, <strong>{selectedTrashPindahCount} Pindah Sambung</strong>.
                  </div>
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



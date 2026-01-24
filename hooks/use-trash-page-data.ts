"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import { SheetRow } from "@/lib/google-sheets";
import { COLUMNS, desaData } from "@/lib/constants";
import { useDebounceValue } from "usehooks-ts";
import { parse, compareDesc } from "date-fns";
import { getCellValue } from "@/lib/helper";

interface UseTrashPageDataProps {
  initialTrashData: SheetRow[];
}

export function useTrashPageData({ initialTrashData }: UseTrashPageDataProps) {
  // Local States for Trash Page
  const [filterDesa, setFilterDesa] = useState<string[]>([]);
  const [filterKelompok, setFilterKelompok] = useState<string[]>([]);
  const [filterGender, setFilterGender] = useState("");
  const [filterJenjangKelas, setFilterJenjangKelas] = useState<string[]>([]);
  const [filterNama, setFilterNama] = useState("");
  const [showDuplicates, setShowDuplicates] = useState(false); // Not used for trash but needed for component props
  const [filterOutOfCategory, setFilterOutOfCategory] = useState(false);
  const [filterNoDob, setFilterNoDob] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [debouncedValue] = useDebounceValue(filterNama, 1000);
  const [isPending, startTransition] = useTransition();
  const [keepShowingSkeleton, setKeepShowingSkeleton] = useState(true);

  const isVisualPending = isPending || keepShowingSkeleton;

  useEffect(() => {
    if (!isPending) {
      const timer = setTimeout(() => {
        setKeepShowingSkeleton(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isPending]);

  const handleStartTransition = (fn: () => void) => {
    setKeepShowingSkeleton(true);
    startTransition(fn);
  };

  const desaOptions = useMemo(() => Object.keys(desaData).sort(), []);
  const kelompokOptions = useMemo(() => {
    return Object.values(desaData)
      .flat()
      .sort((a, b) => a.localeCompare(b, "id", { sensitivity: "base" }));
  }, []);

  const filteredData = useMemo(() => {
    const formatString = "dd/MM/yyyy HH:mm:ss";

    return initialTrashData
      .filter((row) => {
        const rowDesa = getCellValue(row, COLUMNS.DESA);
        const rowKelompok = getCellValue(row, COLUMNS.KELOMPOK);
        const rowGender = getCellValue(row, COLUMNS.GENDER);
        const rowNama = getCellValue(row, COLUMNS.NAMA);
        const rowJenjang = getCellValue(row, COLUMNS.JENJANG);

        const matchDesa = filterDesa.length > 0
          ? filterDesa.some(d => d.toLowerCase() === rowDesa.toLowerCase())
          : true;
        const matchKelompok = filterKelompok.length > 0
          ? filterKelompok.some(k => k.toLowerCase() === rowKelompok.toLowerCase())
          : true;
        const matchGender = filterGender
          ? rowGender.toLowerCase() === filterGender.toLowerCase()
          : true;
        const matchNama = debouncedValue
          ? rowNama.toLowerCase().includes(debouncedValue.toLowerCase())
          : true;
        const matchJenjangKelas = filterJenjangKelas.length > 0
          ? filterJenjangKelas.some(j => j.toLowerCase() === rowJenjang.toLowerCase())
          : true;

        // Audit Filters
        let matchAudit = true;
        
        if (filterOutOfCategory || filterNoDob) {
          const dob = getCellValue(row, COLUMNS.TANGGAL_LAHIR);
          const age = getCellValue(row, COLUMNS.UMUR);
          
          let isNoDob = false;
          if (!dob) {
            isNoDob = true;
          } else {
            // Check for invalid date
            const parsed = parse(dob, "dd/MM/yyyy", new Date());
            if (isNaN(parsed.getTime())) {
              isNoDob = true;
            }
          }

          const isOutOfCategory = rowJenjang === "-" || (!!age && Number(age) < 5);

          if (filterOutOfCategory && filterNoDob) {
            matchAudit = isOutOfCategory || isNoDob;
          } else if (filterOutOfCategory) {
            matchAudit = isOutOfCategory;
          } else if (filterNoDob) {
            matchAudit = isNoDob;
          }
        }

        return matchDesa && matchKelompok && matchGender && matchNama && matchJenjangKelas && matchAudit;
      })
      .sort((a, b) => {
        const tsA = getCellValue(a, COLUMNS.TIMESTAMP);
        const tsB = getCellValue(b, COLUMNS.TIMESTAMP);
        const dateA = tsA ? parse(tsA, formatString, new Date()) : new Date(0);
        const dateB = tsB ? parse(tsB, formatString, new Date()) : new Date(0);
        return compareDesc(dateA, dateB);
      });
  }, [initialTrashData, filterDesa, filterKelompok, filterGender, debouncedValue, filterJenjangKelas, filterOutOfCategory, filterNoDob]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredData, currentPage, pageSize]);

  const isFiltered = filterDesa.length > 0 || filterKelompok.length > 0 || filterGender !== "" || debouncedValue !== "" || filterJenjangKelas.length > 0 || filterOutOfCategory || filterNoDob;

  const resetFilters = () => {
    handleStartTransition(() => {
      setFilterDesa([]);
      setFilterKelompok([]);
      setFilterGender("");
      setFilterJenjangKelas([]);
      setFilterNama("");
      setFilterOutOfCategory(false);
      setFilterNoDob(false);
      setCurrentPage(1);
    });
  };

  return {
    filters: {
      filterDesa, setFilterDesa,
      filterKelompok, setFilterKelompok,
      filterGender, setFilterGender,
      filterJenjangKelas, setFilterJenjangKelas,
      filterNama, setFilterNama,
      showDuplicates, setShowDuplicates,
      filterOutOfCategory, setFilterOutOfCategory,
      filterNoDob, setFilterNoDob,
    },
    pagination: {
      currentPage, setCurrentPage,
      pageSize, setPageSize,
      totalPages,
    },
    status: {
      isPending, isVisualPending, isFiltered,
    },
    data: {
      filteredData, paginatedData,
    },
    options: {
      desaOptions, kelompokOptions,
    },
    actions: {
      handleStartTransition, resetFilters,
    }
  };
}

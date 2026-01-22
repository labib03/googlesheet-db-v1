"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import { SheetRow } from "@/lib/google-sheets";
import { COLUMNS, Gender, desaData, kelas } from "@/lib/constants";
import { useDebounceValue } from "usehooks-ts";
import { parse, compareDesc } from "date-fns";
import { getCellValue } from "@/lib/helper";

interface UseDashboardDataProps {
  initialData: SheetRow[];
}

export function useDashboardData({ initialData }: UseDashboardDataProps) {
  const [filterDesa, setFilterDesa] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterJenjangKelas, setFilterJenjangKelas] = useState("");
  const [filterNama, setFilterNama] = useState("");
  const [debouncedValue] = useDebounceValue(filterNama, 1000);

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [keepShowingSkeleton, setKeepShowingSkeleton] = useState(true);

  // Derived state to show skeleton if either transition is pending or we are still in "cooldown"
  const isVisualPending = isPending || keepShowingSkeleton;

  useEffect(() => {
    if (!isPending) {
      const timer = setTimeout(() => {
        setKeepShowingSkeleton(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPending]);

  const handleStartTransition = (fn: () => void) => {
    setKeepShowingSkeleton(true);
    startTransition(fn);
  };

  // Option lists
  const desaOptions = useMemo(() => Object.keys(desaData).sort(), []);

  const kelompokOptions = useMemo(() => {
    return Object.values(desaData)
      .flat()
      .sort((a, b) => a.localeCompare(b, "id", { sensitivity: "base" }));
  }, []);

  // Filter Data
  const filteredData = useMemo(() => {
    const formatString = "dd/MM/yyyy HH:mm:ss";

    return initialData
      .filter((row) => {
        const rowDesa = getCellValue(row, COLUMNS.DESA);
        const rowKelompok = getCellValue(row, COLUMNS.KELOMPOK);
        const rowGender = getCellValue(row, COLUMNS.GENDER);
        const rowNama = getCellValue(row, COLUMNS.NAMA);
        const rowJenjang = getCellValue(row, COLUMNS.JENJANG);

        const matchDesa = filterDesa
          ? rowDesa.toLowerCase() === filterDesa.toLowerCase()
          : true;
        const matchKelompok = filterKelompok
          ? rowKelompok.toLowerCase() === filterKelompok.toLowerCase()
          : true;
        const matchGender = filterGender
          ? rowGender.toLowerCase() === filterGender.toLowerCase()
          : true;
        const matchNama = debouncedValue
          ? rowNama.toLowerCase().includes(debouncedValue.toLowerCase())
          : true;
        const matchJenjangKelas = filterJenjangKelas
          ? rowJenjang.toLowerCase() === filterJenjangKelas.toLowerCase()
          : true;

        return (
          matchDesa &&
          matchKelompok &&
          matchGender &&
          matchNama &&
          matchJenjangKelas
        );
      })
      .sort((a, b) => {
        const tsA = getCellValue(a, COLUMNS.TIMESTAMP);
        const tsB = getCellValue(b, COLUMNS.TIMESTAMP);
        
        const dateA = tsA ? parse(tsA, formatString, new Date()) : new Date(0);
        const dateB = tsB ? parse(tsB, formatString, new Date()) : new Date(0);
        return compareDesc(dateA, dateB);
      });
  }, [
    initialData,
    filterDesa,
    filterKelompok,
    filterGender,
    debouncedValue,
    filterJenjangKelas,
  ]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  
  const paginatedData = useMemo(() => {
     return filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredData, currentPage, pageSize]);

  const isFiltered =
    filterDesa !== "" ||
    filterKelompok !== "" ||
    filterGender !== "" ||
    debouncedValue !== "" ||
    filterJenjangKelas !== "";

  const resetFilters = () => {
    handleStartTransition(() => {
      setFilterDesa("");
      setFilterKelompok("");
      setFilterGender("");
      setFilterJenjangKelas("");
      setFilterNama("");
      setCurrentPage(1);
    });
  };

  return {
    filters: {
      filterDesa,
      filterKelompok,
      filterGender,
      filterJenjangKelas,
      filterNama,
      setFilterDesa,
      setFilterKelompok,
      setFilterGender,
      setFilterJenjangKelas,
      setFilterNama,
    },
    pagination: {
      currentPage,
      setCurrentPage,
      pageSize,
      setPageSize,
      totalPages,
    },
    status: {
      isPending,
      isVisualPending,
      isFiltered,
    },
    data: {
      filteredData,
      paginatedData,
    },
    options: {
      desaOptions,
      kelompokOptions,
    },
    actions: {
      handleStartTransition,
      resetFilters,
    }
  };
}

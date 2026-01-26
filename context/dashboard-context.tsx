"use client";

import React, { createContext, useContext, useState, useTransition, useEffect, useCallback } from "react";
import { SheetRow } from "@/lib/google-sheets";
import { getSheetDataAction } from "@/app/actions";

interface DashboardContextType {
  // Data
  data: SheetRow[];
  headers: string[];
  isLoading: boolean;
  isPending: boolean;
  refreshData: (silent?: boolean) => Promise<void>;

  // Filter State
  filterDesa: string[];
  setFilterDesa: React.Dispatch<React.SetStateAction<string[]>>;
  filterKelompok: string[];
  setFilterKelompok: React.Dispatch<React.SetStateAction<string[]>>;
  filterGender: string;
  setFilterGender: React.Dispatch<React.SetStateAction<string>>;
  filterJenjangKelas: string[];
  setFilterJenjangKelas: React.Dispatch<React.SetStateAction<string[]>>;
  filterNama: string;
  setFilterNama: React.Dispatch<React.SetStateAction<string>>;
  showDuplicates: boolean;
  setShowDuplicates: React.Dispatch<React.SetStateAction<boolean>>;
  filterNoDob: boolean;
  setFilterNoDob: React.Dispatch<React.SetStateAction<boolean>>;

  // Pagination State
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;

  // Scroll Position
  scrollPosition: number;
  setScrollPosition: (pos: number) => void;

  // Age Filter
  filterAgeRange: { min: number; max: number };
  setFilterAgeRange: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ 
  children, 
  initialData = [], 
  initialHeaders = [] 
}: { 
  children: React.ReactNode;
  initialData?: SheetRow[];
  initialHeaders?: string[];
}) {
  const [data, setData] = useState<SheetRow[]>(initialData);
  const [headers, setHeaders] = useState<string[]>(initialHeaders);
  const [isLoading, setIsLoading] = useState(initialData.length === 0);
  const [isPending] = useTransition();

  // Persisted View States
  const [filterDesa, setFilterDesa] = useState<string[]>([]);
  const [filterKelompok, setFilterKelompok] = useState<string[]>([]);
  const [filterGender, setFilterGender] = useState("");
  const [filterJenjangKelas, setFilterJenjangKelas] = useState<string[]>([]);
  const [filterNama, setFilterNama] = useState("");
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [filterNoDob, setFilterNoDob] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [filterAgeRange, setFilterAgeRange] = useState<{ min: number; max: number }>({ min: 0, max: 100 });

  const refreshData = useCallback(async (silent: boolean = false) => {
    if (!silent) setIsLoading(true);
    try {
      const result = await getSheetDataAction();
      if (result.success && result.data) {
        setData(result.data);
        if (result.data.length > 0) {
           setHeaders(Object.keys(result.data[0]).filter(
             (k) => k !== "_index" && k !== "Timestamp" && k !== "Umur"
           ));
        }
      }
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Update data and headers if initialData changes (hydration)
  useEffect(() => {
    if (initialData.length > 0) {
      setData(initialData);
    }
    if (initialHeaders.length > 0) {
      setHeaders(initialHeaders);
    }
  }, [initialData, initialHeaders]);

  useEffect(() => {
    if (data.length === 0) {
      refreshData();
    }
  }, [data.length, refreshData]);

  const value = {
    data,
    headers,
    isLoading,
    isPending,
    refreshData,
    filterDesa,
    setFilterDesa,
    filterKelompok,
    setFilterKelompok,
    filterGender,
    setFilterGender,
    filterJenjangKelas,
    setFilterJenjangKelas,
    filterNama,
    setFilterNama,
    showDuplicates,
    setShowDuplicates,
    filterNoDob,
    setFilterNoDob,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    scrollPosition,
    setScrollPosition,
    filterAgeRange,
    setFilterAgeRange,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

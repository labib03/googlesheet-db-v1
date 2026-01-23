"use client";

import React, { createContext, useContext, useState, useTransition, useEffect, useCallback } from "react";
import { SheetRow } from "@/lib/google-sheets";
import { getSheetDataAction } from "@/app/actions";

interface DashboardContextType {
  data: SheetRow[];
  headers: string[];
  isLoading: boolean;
  isPending: boolean;
  refreshData: () => Promise<void>;
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
  const [isPending, startTransition] = useTransition();

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getSheetDataAction();
      if (result.success && result.data) {
        setData(result.data);
        if (result.data.length > 0) {
           // We might need to recalculate headers here if they changed
           // But for simplicity, we keep existing or update if empty
           setHeaders(Object.keys(result.data[0]).filter(
             (k) => k !== "_index" && k !== "Timestamp" && k !== "Umur"
           ));
        }
      }
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialData.length === 0) {
      refreshData();
    }
  }, [initialData.length, refreshData]);

  return (
    <DashboardContext.Provider value={{ data, headers, isLoading, isPending, refreshData }}>
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

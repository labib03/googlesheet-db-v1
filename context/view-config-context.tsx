"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getGlobalConfig } from "@/app/actions";
import { CONFIG_KEYS } from "@/lib/constants";

export interface ViewConfig {
  tableColumns: string[];
  cardFields: string[];
  detailFields: string[];
}

interface ViewConfigContextType {
  config: ViewConfig;
  updateConfig: (key: keyof ViewConfig, fields: string[]) => void;
  resetConfig: () => void;
  isCustomized: (key: keyof ViewConfig) => boolean;
}

const ViewConfigContext = createContext<ViewConfigContextType | undefined>(undefined);

export function ViewConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ViewConfig>({
    tableColumns: [], 
    cardFields: [],
    detailFields: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("view-config");
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse view config", e);
      }
    }
    setIsLoaded(true);

    // Fetch Global Config
    getGlobalConfig().then((result) => {
      if (result.success && result.data) {
        setConfig((prev) => {
          const next = { ...prev };
          // Strict sync: if key missing in server, default to []
          next.tableColumns = result.data[CONFIG_KEYS.VIEW_TABLE_COLS] || [];
          next.cardFields = result.data[CONFIG_KEYS.VIEW_CARD_FIELDS] || [];
          next.detailFields = result.data[CONFIG_KEYS.VIEW_DETAIL_FIELDS] || [];
          
          localStorage.setItem("view-config", JSON.stringify(next));
          return next;
        });
      }
    });
  }, []);

  const updateConfig = (key: keyof ViewConfig, fields: string[]) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: fields };
      localStorage.setItem("view-config", JSON.stringify(next));
      return next;
    });
  };

  const resetConfig = () => {
    const defaults = { tableColumns: [], cardFields: [], detailFields: [] };
    setConfig(defaults);
    localStorage.removeItem("view-config");
  };

  const isCustomized = (key: keyof ViewConfig) => {
    return config[key].length > 0;
  };

  // Prevent flash of default content if needed, though for view configs often default is "Show All" which is fine
  if (!isLoaded) {
     // Optional: return null or loading if strict
  }

  return (
    <ViewConfigContext.Provider value={{ config, updateConfig, resetConfig, isCustomized }}>
      {children}
    </ViewConfigContext.Provider>
  );
}

export function useViewConfig() {
  const context = useContext(ViewConfigContext);
  if (!context) throw new Error("useViewConfig must be used within ViewConfigProvider");
  return context;
}

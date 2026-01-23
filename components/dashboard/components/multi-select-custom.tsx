"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelectCustom({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter((v) => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  const removeValue = (option: string) => {
    onChange(value.filter((v) => v !== option));
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "min-h-11 w-full border rounded-xl text-sm px-3 py-2 flex items-center flex-wrap gap-2 transition-all outline-none cursor-pointer",
          disabled 
            ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900/50" 
            : "bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700",
          isOpen && "ring-2 ring-indigo-500/20 border-indigo-500",
          value.length > 0 && "bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-800/60 shadow-sm shadow-indigo-100/20 dark:shadow-none"
        )}
      >
        {value.length === 0 ? (
          <span className="text-slate-500 dark:text-slate-400 font-medium">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {value.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold"
              >
                {v}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-indigo-900 dark:hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeValue(v);
                  }}
                />
              </span>
            ))}
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
           {value.length > 0 && (
             <X 
               className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors"
               onClick={(e) => {
                 e.stopPropagation();
                 onChange([]);
               }}
             />
           )}
           <ChevronDown className={cn("w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform", isOpen && "rotate-180")} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-3 bg-slate-50 dark:bg-slate-950 border-none text-sm rounded-lg focus:ring-0 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <ScrollArea className="h-48">
            <div className="p-1">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option}
                    onClick={() => toggleOption(option)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors",
                      value.includes(option)
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                      value.includes(option)
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-slate-300 dark:border-slate-600"
                    )}>
                      {value.includes(option) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    {option}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

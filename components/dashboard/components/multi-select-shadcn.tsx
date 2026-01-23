"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MultiSelectShadcnProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelectShadcn({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  disabled = false,
}: MultiSelectShadcnProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item: string) => {
    onChange(value.filter((i) => i !== item));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          className={cn(
            "min-h-11 w-full border rounded-xl text-sm px-3 py-2 flex items-center justify-between transition-all outline-none bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed",
            value.length > 0 && "bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-800/60"
          )}
        >
          <div className="flex flex-wrap gap-1">
            {value.length > 0 ? (
              value.map((item) => (
                <Badge
                  variant="secondary"
                  key={item}
                  className="bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/80 border-none px-2 py-0.5 rounded-md text-xs font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnselect(item);
                  }}
                >
                  {item}
                  <X className="ml-1 h-3 w-3 text-indigo-500 hover:text-indigo-700 cursor-pointer" />
                </Badge>
              ))
            ) : (
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {placeholder}
              </span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 text-slate-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command className="bg-white dark:bg-slate-900 border-none">
          <CommandInput placeholder="Search options..." className="h-9" />
          <CommandList className="max-h-64 scrollbar-hide">
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => {
                    onChange(
                      value.includes(option)
                        ? value.filter((v) => v !== option)
                        : [...value, option]
                    );
                  }}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded border border-slate-300 dark:border-slate-600",
                      value.includes(option)
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "opacity-50"
                    )}
                  >
                    {value.includes(option) && <Check className="h-3 w-3" />}
                  </div>
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

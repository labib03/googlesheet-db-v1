"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { updateData } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2 } from "lucide-react";
import { SheetRow } from "@/lib/google-sheets";

interface EditDataDialogProps {
  row: SheetRow;
  rowIndex: number; // 0-based index from data array, mapping to sheet index handled in action/lib
  children?: React.ReactNode;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Menyimpan...
        </>
      ) : (
        "Simpan Perubahan"
      )}
    </Button>
  );
}

import { desaData, Gender } from "@/lib/constants";
import { format, parseISO } from "date-fns";

export function EditDataDialog({
  row,
  rowIndex,
  children,
}: EditDataDialogProps) {
  const [open, setOpen] = useState(false);
  // Initialize Desa from existing data
  const [selectedDesa, setSelectedDesa] = useState<string>(
    String(row["DESA"] || "")
  );

  // Sheet Row Index calculation
  const sheetRowIndex = rowIndex + 2;

  // Data mapping for Desa -> Kelompok
  // Moved to lib/constants.ts

  const handleSubmit = async (formData: FormData) => {
    const rawDate = formData.get("TANGGAL LAHIR") as string; // contoh: "2026-01-22"

    if (rawDate) {
      const parsed = parseISO(rawDate);
      const formatted = format(parsed, "dd/MM/yyyy"); // ubah sesuai kebutuhan
      formData.set("TANGGAL LAHIR", formatted);
    }

    const result = await updateData(sheetRowIndex, null, formData);
    if (result.success) {
      setOpen(false);
    } else {
      alert(`Gagal: ${result.message}`);
    }
  };

  // Helper to convert display date (e.g. "20 Maret 2010" or "2010-03-20") to YYYY-MM-DD for input
  const getFormattedDateForInput = (dateString: string) => {
    if (!dateString) return "";

    // Check if already in YYYY-MM-DD format (simple check)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

    // Try parsing Indonesian format
    const monthMap: { [key: string]: string } = {
      Januari: "01",
      Februari: "02",
      Maret: "03",
      April: "04",
      Mei: "05",
      Juni: "06",
      Juli: "07",
      Agustus: "08",
      September: "09",
      Oktober: "10",
      November: "11",
      Desember: "12",
    };

    // Attempt to replace month name with number
    let processedString = dateString;
    Object.keys(monthMap).forEach((monthName) => {
      if (dateString.includes(monthName)) {
        // "20 Maret 2010" -> replace "Maret" with "March" for Date constructor?
        // no, let's just create a valid date object
        // If the format is strictly "DD MMMM YYYY"
        const parts = dateString.split(" ");
        if (parts.length === 3) {
          const day = parts[0].padStart(2, "0");
          const month = monthMap[parts[1]] || "01";
          const year = parts[2];
          processedString = `${year}-${month}-${day}`;
        }
      }
    });

    // Fallback: Use Date parser if replacement didn't produce YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(processedString)) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    }

    return processedString;
  };

  const renderInput = (header: string, isRequired: boolean) => {
    const currentValue = String(row[header] || "");

    // 1. TANGGAL LAHIR -> Date Input
    if (header === "TANGGAL LAHIR") {
      return (
        <Input
          id={header}
          name={header}
          type="date"
          defaultValue={getFormattedDateForInput(currentValue)}
          className="col-span-3"
          required={isRequired}
        />
      );
    }

    // 2. Desa -> Dropdown
    if (header === "DESA") {
      return (
        <select
          id={header}
          name={header}
          className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required={isRequired}
          value={selectedDesa}
          onChange={(e) => {
            setSelectedDesa(e.target.value);
          }}
        >
          <option value="">Pilih Desa</option>
          {Object.keys(desaData).map((desa) => (
            <option key={desa} value={desa}>
              {desa}
            </option>
          ))}
        </select>
      );
    }

    // 3. KELOMPOK -> Dependent Dropdown
    if (header === "KELOMPOK") {
      const valueIsValid =
        selectedDesa && desaData[selectedDesa]?.includes(currentValue);
      return (
        <select
          id={header}
          name={header}
          className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required={isRequired}
          disabled={!selectedDesa}
          defaultValue={valueIsValid ? currentValue : ""}
        >
          <option value="">Pilih Kelompok</option>
          {selectedDesa &&
            desaData[selectedDesa]?.map((kelompok) => (
              <option key={kelompok} value={kelompok}>
                {kelompok}
              </option>
            ))}
        </select>
      );
    }

    // JENIS KELAMIN
    if (header === "JENIS KELAMIN") {
      return (
        <select
          id={header}
          name={header}
          className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required={isRequired}
          defaultValue={currentValue}
        >
          <option value="">Pilih Jenis Kelamin</option>
          {Gender?.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      );
    }

    // Default -> Text Input
    return (
      <Input
        id={header}
        name={header}
        defaultValue={currentValue}
        className="col-span-3"
        required={isRequired}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data</DialogTitle>
          <DialogDescription>
            Ubah data di bawah ini. Pastikan data yang dimasukkan benar.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            {Object.keys(row)
              .filter(
                (header) =>
                  header !== "_index" &&
                  header !== "Timestamp" &&
                  header !== "Umur"
              )
              .map((header) => {
                const optionalFields = ["HOBI", "SKILL / CITA-CITA"];
                const isRequired = !optionalFields.includes(header);

                return (
                  <div
                    key={header}
                    className="grid grid-cols-4 items-center gap-4"
                  >
                    <Label
                      htmlFor={header}
                      className="text-right capitalize flex justify-end items-center gap-1"
                    >
                      {header}
                      {isRequired && <span className="text-red-500">*</span>}
                    </Label>
                    {renderInput(header, isRequired)}
                  </div>
                );
              })}
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

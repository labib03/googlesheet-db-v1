"use client";

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { addData } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddDataDialogProps {
  headers: string[];
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Menyimpan...
        </>
      ) : (
        'Simpan Data'
      )}
    </Button>
  );
}

export function AddDataDialog({ headers }: AddDataDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDesa, setSelectedDesa] = useState<string>("");

  // Data mapping for Desa -> Kelompok
  const desaData: { [key: string]: string[] } = {
    "Budi Agung": ["Budi Agung 1", "Budi Agung 2", "Cilebut 1", "Cilebut 2", "Cimanggu", "Kebon Pedes"],
    "Ciparigi": ["Ciparigi 1", "Ciparigi 2", "Warung Jambu"],
    "Cipayung": ["Al-Badar", "Al-Ubaidah", "Ciawi", "Tapos"],
    "Gunung Gede": ["Ciapus", "Cikaret", "Green Arofah", "Gunung Gede", "Pakuan", "Pondok Rumput", "Tajur"],
    "Gunung Sindur": ["CIP 1", "CIP 2", "GIS", "Mutiara"],
    "Margajaya": ["Cibanteng", "Cibungbulang", "Ciherang", "Ciomas", "Dewi Sartika", "Margajaya 1", "Margajaya 2"],
    "Salabenda": ["Parakan Jaya", "Permata Sari", "Pura Bojong", "Salabenda", "Yasmin"],
    "Sawangan": ["BSI", "Ciseeng", "Inkopad", "Muara Barokah", "Sawangan"]
  };

  const handleSubmit = async (formData: FormData) => {
    // Basic validation
    // If 'Kelompok' is needed but disabled/empty, we might want to ensure it's handled, 
    // but the required attribute on the select should handle empty submissions if enabled.
    
    // Show loading toast or state if desired (not implemented here for simplicity, using form status pending)
    
    const result = await addData(null, formData);
    if (result.success) {
      setOpen(false);
      setSelectedDesa(""); // Reset desa
      toast.success(result.message);
    } else {
        toast.error(`Gagal: ${result.message}`);
    }
  };

  const renderInput = (header: string) => {
    // 1. Tanggal Lahir -> Date Input
    if (header === 'Tanggal Lahir') {
      return (
        <Input
          id={header}
          name={header}
          type="date"
          className="col-span-3"
          required
        />
      );
    }

    // 2. isMarried -> Dropdown (1/0)
    if (header === 'isMarried') {
      return (
        <select
          id={header}
          name={header}
          className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="">Pilih Status</option>
          <option value="1">Sudah</option>
          <option value="0">Belum</option>
        </select>
      );
    }

    // 3. Desa -> Dropdown
    if (header === 'Desa') {
      return (
        <select
          id={header}
          name={header}
          className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
          value={selectedDesa}
          onChange={(e) => setSelectedDesa(e.target.value)}
        >
          <option value="">Pilih Desa</option>
          {Object.keys(desaData).map((desa) => (
            <option key={desa} value={desa}>{desa}</option>
          ))}
        </select>
      );
    }

    // 4. Kelompok -> Dependent Dropdown
    if (header === 'Kelompok') {
      return (
        <select
          id={header}
          name={header}
          className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
          disabled={!selectedDesa}
        >
          <option value="">Pilih Kelompok</option>
          {selectedDesa && desaData[selectedDesa]?.map((kelompok) => (
            <option key={kelompok} value={kelompok}>{kelompok}</option>
          ))}
        </select>
      );
    }

    // Default -> Text Input
    return (
      <Input
        id={header}
        name={header}
        placeholder={`Isi ${header}...`}
        className="col-span-3"
        required
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
          <PlusCircle className="h-4 w-4" />
          Tambah Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Data Baru</DialogTitle>
          <DialogDescription>
            Isi formulir berikut untuk menambahkan baris baru ke Google Sheet.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            {headers.map((header) => (
              <div key={header} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={header} className="text-right capitalize">
                  {header}
                </Label>
                {renderInput(header)}
              </div>
            ))}
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

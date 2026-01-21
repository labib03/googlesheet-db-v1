"use client";

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateData } from '@/app/actions';
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
import { Pencil, Loader2 } from 'lucide-react';
import { SheetRow } from '@/lib/google-sheets';

interface EditDataDialogProps {
  row: SheetRow;
  rowIndex: number; // 0-based index from data array, mapping to sheet index handled in action/lib
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700 text-white">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Menyimpan...
        </>
      ) : (
        'Simpan Perubahan'
      )}
    </Button>
  );
}

export function EditDataDialog({ row, rowIndex }: EditDataDialogProps) {
  const [open, setOpen] = useState(false);
  
  // Sheet Row Index calculation:
  // Array index 0 -> Sheet Row 2.
  // So Sheet Row = Array Index + 2.
  const sheetRowIndex = rowIndex + 2;

  const handleSubmit = async (formData: FormData) => {
    const result = await updateData(sheetRowIndex, null, formData);
    if (result.success) {
      setOpen(false);
    } else {
      alert(`Gagal: ${result.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Data</DialogTitle>
          <DialogDescription>
            Ubah data di bawah ini. Pastikan data yang dimasukkan benar.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            {Object.keys(row).map((header) => (
              <div key={header} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={header} className="text-right capitalize">
                  {header}
                </Label>
                <Input
                  id={header}
                  name={header}
                  defaultValue={String(row[header])}
                  className="col-span-3"
                  readOnly={header === 'Umur'} // Umur calculated automatically
                />
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

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

  async function clientAction(prevState: any, formData: FormData) {
    const result = await addData(prevState, formData);
    if (result.success) {
      setOpen(false);
      // Optional: Add toast notification here if you have a toast library installed
      // alert('Data berhasil ditambahkan!'); 
    } else {
      alert(result.message);
    }
    return result;
  }

  // Using a simple wrapper since useFormState might need newer React/Next versions config
  const handleSubmit = async (formData: FormData) => {
    // For simplicity in this demo, we'll just call the action directly
    // Ideally use useFormState for better error handling
    const result = await addData(null, formData);
    if (result.success) {
      setOpen(false);
    } else {
      alert(`Gagal: ${result.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
          <PlusCircle className="h-4 w-4" />
          Tambah Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
                <Input
                  id={header}
                  name={header}
                  placeholder={`Isi ${header}...`}
                  className="col-span-3"
                  required
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

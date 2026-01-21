'use server';

import { appendSheetData, SheetRow } from '@/lib/google-sheets';
import { revalidatePath } from 'next/cache';

export async function addData(prevState: any, formData: FormData) {
  try {
    const rawData: SheetRow = {};
    
    // Convert FormData to SheetRow object
    // Exclude special fields if any (like next-action IDs)
    for (const [key, value] of formData.entries()) {
      if (!key.startsWith('$')) {
        rawData[key] = value.toString();
      }
    }

    await appendSheetData(rawData);
    revalidatePath('/');
    
    return { success: true, message: 'Data berhasil ditambahkan!' };
  } catch (error) {
    console.error('Failed to add data:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Gagal menambahkan data' 
    };
  }
}

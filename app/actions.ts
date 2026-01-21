'use server';

import { appendSheetData, updateSheetData, deleteSheetData, SheetRow } from '@/lib/google-sheets';
import { revalidatePath } from 'next/cache';

export async function addData(prevState: any, formData: FormData) {
  try {
    const rawData: SheetRow = {};
    
    // Convert FormData to SheetRow object
    // Exclude special fields if any
    for (const [key, value] of formData.entries()) {
      if (!key.startsWith('$')) {
        rawData[key] = value.toString();
      }
    }

    // Auto-add Timestamp with current date and time
    const now = new Date();
    const timestamp = now.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    rawData['Timestamp'] = timestamp;

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

export async function updateData(rowIndex: number, prevState: any, formData: FormData) {
  try {
    const rawData: SheetRow = {};
    
    for (const [key, value] of formData.entries()) {
      if (!key.startsWith('$')) {
        rawData[key] = value.toString();
      }
    }

    // Auto-update Timestamp with current date and time
    const now = new Date();
    const timestamp = now.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    rawData['Timestamp'] = timestamp;

    await updateSheetData(rowIndex, rawData);
    revalidatePath('/');
    
    return { success: true, message: 'Data berhasil diperbarui!' };
  } catch (error) {
    console.error('Failed to update data:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Gagal memperbarui data' 
    };
  }
}

export async function deleteData(rowIndex: number) {
  try {
    await deleteSheetData(rowIndex);
    revalidatePath('/');
    return { success: true, message: 'Data berhasil dihapus!' };
  } catch (error) {
    console.error('Failed to delete data:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Gagal menghapus data' 
    };
  }
}

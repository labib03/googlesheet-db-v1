import { google } from 'googleapis';
import { getAuth, escapeSheetName } from './google-sheets';

export interface UserRow {
  Username: string;
  Password: string; // Hashed version
  Name: string;
  Role: 'Admin' | 'Viewer';
  Desa: string; // Filter context
}

const USER_SHEET_NAME = 'Users';

/**
 * Fetches all users from the "Users" sheet
 */
export async function getUsers(): Promise<UserRow[]> {
  try {
    const auth = await getAuth();
    const sheetId = process.env.GOOGLE_SHEET_ID!;
    const sheets = google.sheets({ version: 'v4', auth });

    const escapedName = escapeSheetName(USER_SHEET_NAME);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: escapedName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    const headers = rows[0] as string[];
    
    return rows.slice(1).map((row) => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj as UserRow;
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * Finds a specific user by username
 */
export async function findUserByUsername(username: string): Promise<UserRow | null> {
  const users = await getUsers();
  return users.find(u => u.Username === username) || null;
}

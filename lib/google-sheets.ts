import { google } from 'googleapis';

export interface SheetRow {
  [key: string]: string | number | boolean;
}

/**
 * Fetches data from a Google Sheet
 * @param sheetName - The name of the sheet/tab to read from (e.g., "Sheet1")
 * @param range - Optional range in A1 notation (e.g., "A1:D10"). If not provided, reads all data.
 * @returns Array of objects where keys are column headers
 */
export async function getSheetData(
  sheetName: string = 'Sheet1',
  range?: string
): Promise<SheetRow[]> {
  try {
    // Get credentials from environment variables
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      throw new Error(
        'Missing required environment variables: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, or GOOGLE_SHEET_ID'
      );
    }

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Construct the range
    const fullRange = range ? `${sheetName}!${range}` : sheetName;

    // Fetch data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: fullRange,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return [];
    }

    // First row is headers
    const headers = rows[0] as string[];
    
    // Convert remaining rows to objects
    const data: SheetRow[] = rows.slice(1).map((row) => {
      const obj: SheetRow = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    return data;
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}

/**
 * Gets all sheet names from the spreadsheet
 * @returns Array of sheet names
 */
export async function getSheetNames(): Promise<string[]> {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      throw new Error(
        'Missing required environment variables'
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    return response.data.sheets?.map((sheet) => sheet.properties?.title || '') || [];
  } catch (error) {
    console.error('Error fetching sheet names:', error);
    throw error;
  }
}

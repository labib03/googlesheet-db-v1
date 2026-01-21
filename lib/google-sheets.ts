import { google } from 'googleapis';

export interface SheetRow {
  [key: string]: string | number | boolean;
}

// Get default sheet name from environment variable, fallback to "Sheet1"
const DEFAULT_SHEET_NAME =
  (process.env.GOOGLE_SHEET_NAME && process.env.GOOGLE_SHEET_NAME.trim()) || 'Sheet1';

/**
 * Fetches data from a Google Sheet
 * @param sheetName - The name of the sheet/tab to read from (e.g., "Sheet1")
 * @param range - Optional range in A1 notation (e.g., "A1:D10"). If not provided, reads all data.
 * @returns Array of objects where keys are column headers
 */
export async function getSheetData(
  sheetName: string = DEFAULT_SHEET_NAME,
  range?: string
): Promise<SheetRow[]> {
  try {
    // Get credentials from environment variables
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    // Handle various formatting issues with Vercel environment variables
    // 1. Unescape newlines (\n -> actual newline)
    // 2. Remove surrounding quotes if accidentally pasted
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ?.replace(/\\n/g, '\n')
      .replace(/^"|"$/g, '');
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
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
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
    // Same robust handling for getSheetNames
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ?.replace(/\\n/g, '\n')
      .replace(/^"|"$/g, '');
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

/**
 * Appends a new row of data to the sheet
 * @param rowData - Object containing the data to append. Keys must match headers.
 * @param sheetName - The name of the sheet/tab
 */
export async function appendSheetData(
  rowData: SheetRow,
  sheetName: string = DEFAULT_SHEET_NAME
): Promise<void> {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ?.replace(/\\n/g, '\n')
      .replace(/^"|"$/g, '');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      throw new Error('Missing required environment variables');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Get current headers to map object values to correct order
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!1:1`, // First row
    });

    const headers = headerResponse.data.values?.[0] as string[];
    if (!headers || headers.length === 0) {
      throw new Error('Sheet is empty or missing headers');
    }

    // 2. Map rowData object to array based on headers
    const values = headers.map((header) => rowData[header] || '');

    // 3. Append data
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: sheetName,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });

  } catch (error) {
    console.error('Error appending data:', error);
    throw error;
  }
}

/**
 * Updates a specific row in the sheet
 * @param rowIndex - The 1-based row index in the sheet (e.g., 2 for the first data row)
 * @param rowData - The new data for the row
 * @param sheetName - The sheet name
 */
export async function updateSheetData(
  rowIndex: number,
  rowData: SheetRow,
  sheetName: string = DEFAULT_SHEET_NAME
): Promise<void> {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ?.replace(/\\n/g, '\n')
      .replace(/^"|"$/g, '');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      throw new Error('Missing required environment variables');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Get headers to ensure correct column order
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!1:1`,
    });

    const headers = headerResponse.data.values?.[0] as string[];
    if (!headers || headers.length === 0) {
      throw new Error('Sheet is empty or missing headers');
    }

    // 2. Map data
    const values = headers.map((header) => rowData[header] || '');

    // 3. Update
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetName}!A${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });
  } catch (error) {
    console.error('Error updating data:', error);
    throw error;
  }
}

/**
 * Deletes a specific row from the sheet
 * @param rowIndex - The 1-based row index to delete
 * @param sheetName - The sheet name
 */
export async function deleteSheetData(
  rowIndex: number,
  sheetName: string = DEFAULT_SHEET_NAME
): Promise<void> {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ?.replace(/\\n/g, '\n')
      .replace(/^"|"$/g, '');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      throw new Error('Missing required environment variables');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Find the sheetId logic (integer ID) for the given sheetName
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });
    
    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === sheetName
    );

    if (!sheet || typeof sheet.properties?.sheetId !== 'number') {
      throw new Error(`Sheet "${sheetName}" not found or invalid`);
    }

    const gridId = sheet.properties.sheetId;

    // 2. Perform delete operation
    // Note: deleteDimension uses 0-based index. 
    // rowIndex param is 1-based.
    // To delete Row X (1-based), we start at index X-1 and end at X.
    const startIndex = rowIndex - 1;
    const endIndex = rowIndex;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: gridId,
                dimension: 'ROWS',
                startIndex: startIndex,
                endIndex: endIndex,
              },
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error('Error deleting data:', error);
    throw error;
  }
}

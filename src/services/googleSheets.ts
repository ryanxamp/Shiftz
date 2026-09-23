import { getAccessToken } from '../lib/firebase';

export interface SheetMetadata {
  spreadsheetId: string;
  title: string;
  sheets: {
    sheetId: number;
    title: string;
  }[];
}

export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  // Check if it's a full Google Sheets URL
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // Otherwise assume it's the raw ID
  return trimmed;
}

export async function fetchSpreadsheetMetadata(spreadsheetId: string): Promise<SheetMetadata> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Please sign in with Google first to access your Google Sheets.');
  }

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties(sheetId,title)`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to fetch spreadsheet (${response.status})`);
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || 'Google Sheet',
    sheets: (data.sheets || []).map((s: any) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
    })),
  };
}

export async function fetchSheetValues(spreadsheetId: string, sheetTitle: string): Promise<string[][]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Please sign in with Google first to access your Google Sheets.');
  }

  const range = encodeURIComponent(`'${sheetTitle}'!A1:Z200`);
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to fetch sheet values (${response.status})`);
  }

  const data = await response.json();
  return data.values || [];
}

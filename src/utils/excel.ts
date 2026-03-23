export type SpreadsheetRow = Record<string, string>;

export function normalizeSpreadsheetKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function readSpreadsheetRows(file: File): Promise<SpreadsheetRow[]> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
  });
  const firstSheet = workbook.SheetNames[0];

  if (!firstSheet) {
    return [];
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheet], {
    defval: '',
    raw: false,
    dateNF: 'yyyy-mm-dd',
  });

  return rows
    .map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          normalizeSpreadsheetKey(key),
          String(value ?? '').trim(),
        ]),
      ),
    )
    .filter((row) => Object.values(row).some(Boolean));
}

export function getSpreadsheetValue(row: SpreadsheetRow, keys: string[]): string {
  for (const key of keys) {
    const match = row[normalizeSpreadsheetKey(key)];
    if (match) {
      return match;
    }
  }

  return '';
}

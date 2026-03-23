export async function downloadSpreadsheetTemplate(
  fileName: string,
  columns: string[],
  sampleRows: Array<Record<string, string>> = [],
) {
  const XLSX = await import('xlsx');
  const rows = [
    columns,
    ...sampleRows.map((row) => columns.map((column) => row[column] || '')),
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
}

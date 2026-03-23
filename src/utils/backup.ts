import { AppBackup } from '../types';

export const APP_BACKUP_VERSION = 1;

export async function readBackupFile(file: File): Promise<unknown> {
  const raw = await file.text();
  return JSON.parse(raw);
}

export function downloadBackupFile(filename: string, payload: AppBackup) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

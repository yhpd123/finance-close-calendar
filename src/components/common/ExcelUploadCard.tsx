import { useState } from 'react';

interface ExcelUploadCardProps {
  title: string;
  description: string;
  columns: string[];
  onImport: (file: File) => Promise<string>;
  onDownloadTemplate: () => Promise<void>;
  templateLabel?: string;
}

export function ExcelUploadCard({
  title,
  description,
  columns,
  onImport,
  onDownloadTemplate,
  templateLabel = 'Download Template',
}: ExcelUploadCardProps) {
  const [message, setMessage] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  return (
    <article className="panel import-card">
      <span className="eyebrow">Excel Import</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="action-cluster import-actions">
        <button
          className="button button-secondary"
          type="button"
          disabled={isDownloading}
          onClick={async () => {
            setIsDownloading(true);
            try {
              await onDownloadTemplate();
              setMessage('Template downloaded successfully.');
            } catch (error) {
              setMessage(error instanceof Error ? error.message : 'Template download failed.');
            } finally {
              setIsDownloading(false);
            }
          }}
        >
          {isDownloading ? 'Preparing...' : templateLabel}
        </button>
      </div>
      <label className="upload-field">
        <span>{isImporting ? 'Importing...' : 'Upload .xlsx / .xls / .csv'}</span>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          disabled={isImporting}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }

            setIsImporting(true);
            try {
              const result = await onImport(file);
              setMessage(result);
            } catch (error) {
              setMessage(error instanceof Error ? error.message : 'Import failed.');
            } finally {
              event.target.value = '';
              setIsImporting(false);
            }
          }}
        />
      </label>
      <p className="import-columns">Expected columns: {columns.join(', ')}</p>
      {message ? <div className="import-status">{message}</div> : null}
    </article>
  );
}

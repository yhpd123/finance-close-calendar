import { useEffect, useState } from 'react';
import { FiscalPreviewTable } from '../components/fiscal/FiscalPreviewTable';
import { useAppData } from '../context/AppDataContext';
import { PERIOD_TYPE_OPTIONS, FiscalSettings } from '../types';
import { getFiscalPeriodsForYear } from '../utils';

export function FiscalSettingsPage() {
  const { fiscalSettings, saveFiscalSettings, restoreFiscalDefaults } = useAppData();
  const [draft, setDraft] = useState<FiscalSettings>(fiscalSettings);

  useEffect(() => {
    setDraft(fiscalSettings);
  }, [fiscalSettings]);

  const previewPeriods = getFiscalPeriodsForYear(draft, new Date());

  return (
    <div className="page-grid">
      <section className="panel">
        <span className="eyebrow">Fiscal Settings</span>
        <h2>Define fiscal year rules</h2>
        <p className="section-copy">
          Tune the fiscal year anchor and period structure, then review the live calendar preview before saving.
        </p>

        <div className="form-stack">
          <label className="field">
            <span>Fiscal Start Date</span>
            <input
              type="date"
              value={draft.fiscalStartDate}
              onChange={(event) =>
                setDraft((current) => ({ ...current, fiscalStartDate: event.target.value }))
              }
            />
          </label>

          <label className="field">
            <span>Period Type</span>
            <select
              value={draft.periodType}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  periodType: event.target.value as FiscalSettings['periodType'],
                }))
              }
            >
              {PERIOD_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="action-cluster form-actions">
          <button className="button" type="button" onClick={() => saveFiscalSettings(draft)}>
            Save Settings
          </button>
          <button className="button button-secondary" type="button" onClick={restoreFiscalDefaults}>
            Reset
          </button>
        </div>
      </section>

      <FiscalPreviewTable periods={previewPeriods} />
    </div>
  );
}

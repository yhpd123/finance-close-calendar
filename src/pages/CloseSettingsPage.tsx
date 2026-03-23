import { useEffect, useState } from 'react';
import { CloseTimeline } from '../components/close/CloseTimeline';
import { useAppData } from '../context/AppDataContext';
import { CLOSE_START_RULE_OPTIONS, CloseSettings } from '../types';
import {
  formatCloseOffsetLabel,
  formatMonthLabel,
  formatShortDate,
  getCloseCyclesForMonth,
  getCloseInfoByDate,
} from '../utils';

export function CloseSettingsPage() {
  const {
    fiscalSettings,
    closeSettings,
    saveCloseSettings,
    restoreCloseDefaults,
  } = useAppData();
  const [draft, setDraft] = useState<CloseSettings>(closeSettings);

  useEffect(() => {
    setDraft(closeSettings);
  }, [closeSettings]);

  const sampleCycles = getCloseCyclesForMonth(new Date(), fiscalSettings, draft);
  const todayCloseInfo = getCloseInfoByDate(new Date(), fiscalSettings, draft);

  return (
    <div className="page-grid">
      <section className="panel">
        <span className="eyebrow">Close Settings</span>
        <h2>Shape the close cycle</h2>
        <p className="section-copy">
          Define the closing anchor, then express the active close window as offsets like C - 5 through C + 5.
        </p>

        <div className="form-stack">
          <label className="field">
            <span>Closing Anchor</span>
            <select
              value={draft.closeStartRule}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  closeStartRule: event.target.value as CloseSettings['closeStartRule'],
                }))
              }
            >
              {CLOSE_START_RULE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small>
              {CLOSE_START_RULE_OPTIONS.find((option) => option.value === draft.closeStartRule)?.help}
            </small>
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Close From Offset</span>
              <input
                type="number"
                min={-15}
                max={15}
                value={draft.closeFromOffset}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    closeFromOffset: Number(event.target.value),
                  }))
                }
              />
              <small>Example: `-5` means start at C - 5.</small>
            </label>

            <label className="field">
              <span>Close To Offset</span>
              <input
                type="number"
                min={-15}
                max={15}
                value={draft.closeToOffset}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    closeToOffset: Number(event.target.value),
                  }))
                }
              />
              <small>Example: `5` means end at C + 5.</small>
            </label>
          </div>

          <label className="toggle-field">
            <input
              type="checkbox"
              checked={draft.showTimeline}
              onChange={(event) =>
                setDraft((current) => ({ ...current, showTimeline: event.target.checked }))
              }
            />
            <div>
              <strong>Show close timeline</strong>
              <p>Keep the close day band visible on supporting pages.</p>
            </div>
          </label>
        </div>

        <div className="action-cluster form-actions">
          <button className="button" type="button" onClick={() => saveCloseSettings(draft)}>
            Save Settings
          </button>
          <button className="button button-secondary" type="button" onClick={restoreCloseDefaults}>
            Reset
          </button>
        </div>
      </section>

      <section className="panel">
        <span className="eyebrow">Sample Mapping</span>
        <h2>{formatMonthLabel(new Date())}</h2>
        <div className="mapping-list">
          {sampleCycles.map((cycle) => (
            <article key={cycle.cycleStart} className="mapping-row">
              <div>
                <strong>{cycle.cycleLabel}</strong>
                <p>
                  {formatShortDate(cycle.cycleStart)} - {formatShortDate(cycle.cycleEnd)} • C on{' '}
                  {formatShortDate(cycle.closingDate)}
                </p>
              </div>
              <span className="badge badge-neutral">
                {formatCloseOffsetLabel(cycle.closeFromOffset)} to{' '}
                {formatCloseOffsetLabel(cycle.closeToOffset)}
              </span>
            </article>
          ))}
        </div>

        {draft.showTimeline ? <CloseTimeline closeInfo={todayCloseInfo} /> : null}
      </section>
    </div>
  );
}

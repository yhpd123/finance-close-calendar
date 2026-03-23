import { FiscalPeriodPreview } from '../../types';
import { formatShortDate } from '../../utils';

export function FiscalPreviewTable({ periods }: { periods: FiscalPeriodPreview[] }) {
  return (
    <div className="table-card">
      <div className="table-header">
        <div>
          <span className="eyebrow">Live Preview</span>
          <h3>Current fiscal calendar</h3>
        </div>
        <p>{periods.length} periods in the active fiscal year</p>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Quarter</th>
              <th>Start</th>
              <th>End</th>
              <th>Weeks</th>
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr key={period.label}>
                <td>{period.label}</td>
                <td>Q{period.quarter}</td>
                <td>{formatShortDate(period.start)}</td>
                <td>{formatShortDate(period.end)}</td>
                <td>{period.weeks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

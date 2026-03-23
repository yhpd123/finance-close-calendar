import { CloseInfo } from '../../types';
import {
  addDays,
  formatCloseOffsetLabel,
  formatDateKey,
  formatShortDate,
  parseDateKey,
} from '../../utils';

interface CloseTimelineProps {
  closeInfo: CloseInfo;
  activeDate?: string;
}

export function CloseTimeline({ closeInfo, activeDate }: CloseTimelineProps) {
  const closingDate = parseDateKey(closeInfo.closingDate);

  return (
    <div className="timeline-card">
      <div className="timeline-header">
        <div>
          <span className="eyebrow">Close Timeline</span>
          <h3>{closeInfo.cycleLabel}</h3>
        </div>
        <p>
          {formatShortDate(closeInfo.cycleStart)} - {formatShortDate(closeInfo.cycleEnd)} • C on{' '}
          {formatShortDate(closeInfo.closingDate)}
        </p>
      </div>
      <div className="timeline-days">
        {Array.from(
          { length: closeInfo.closeToOffset - closeInfo.closeFromOffset + 1 },
          (_, index) => {
            const offset = closeInfo.closeFromOffset + index;
            const currentDate = addDays(closingDate, offset);
            const dateKey = formatDateKey(currentDate);
            const isActive = activeDate === dateKey;

            return (
              <div key={dateKey} className={`timeline-day${isActive ? ' timeline-day-active' : ''}`}>
                <span>{formatCloseOffsetLabel(offset)}</span>
                <strong>{formatShortDate(currentDate)}</strong>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}

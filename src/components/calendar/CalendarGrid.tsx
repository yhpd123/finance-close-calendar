import { DayInfo } from '../../types';
import { weekdayLabels } from '../../utils';

interface CalendarGridProps {
  days: DayInfo[];
  onSelectDay: (day: DayInfo) => void;
}

export function CalendarGrid({ days, onSelectDay }: CalendarGridProps) {
  return (
    <section className="panel">
      <div className="calendar-weekdays">
        {weekdayLabels().map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day) => (
          <button
            key={day.isoDate}
            type="button"
            className={[
              'calendar-cell',
              day.isCurrentMonth ? '' : 'calendar-cell-muted',
              day.isToday ? 'calendar-cell-today' : '',
              day.isCloseDay ? 'calendar-cell-close' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onSelectDay(day)}
          >
            <div className="calendar-cell-top">
              <span>{day.dayOfMonth}</span>
              {day.taskCount > 0 ? <span className="task-dot">{day.taskCount}</span> : null}
            </div>
            <div className="calendar-cell-meta">
              <span>{day.periodInfo.periodLabel}</span>
              {day.isCloseDay ? (
                <strong>{day.closeInfo.closeOffsetLabel}</strong>
              ) : (
                <span>{day.tasks.length} tasks</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

import { DayInfo, TaskItem } from '../../types';
import { useAppData } from '../../context/AppDataContext';
import { formatLongDate, formatShortDate, getRoleName } from '../../utils';
import { EmptyState } from '../common/EmptyState';

interface DaySummaryModalProps {
  day: DayInfo | null;
  onClose: () => void;
  onCreateTask: (dateKey: string) => void;
  onEditTask: (task: TaskItem) => void;
}

export function DaySummaryModal({
  day,
  onClose,
  onCreateTask,
  onEditTask,
}: DaySummaryModalProps) {
  const { roles } = useAppData();

  if (!day) {
    return null;
  }

  return (
    <div className="overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-summary-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">Day Detail</span>
            <h2 id="day-summary-title">{formatLongDate(new Date(`${day.isoDate}T12:00:00`))}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-grid">
          <section className="panel inset-panel">
            <span className="eyebrow">Fiscal Snapshot</span>
            <h3>
              {day.periodInfo.fiscalYearLabel} • {day.periodInfo.periodLabel}
            </h3>
            <p>
              Quarter {day.periodInfo.fiscalQuarter} • Week {day.periodInfo.fiscalWeek}
            </p>
            <p>
              {formatShortDate(day.periodInfo.periodStart)} - {formatShortDate(day.periodInfo.periodEnd)}
            </p>
          </section>

          <section className="panel inset-panel">
            <span className="eyebrow">Close Snapshot</span>
            <h3>{day.closeInfo.cycleLabel}</h3>
            <p>
              {formatShortDate(day.closeInfo.cycleStart)} - {formatShortDate(day.closeInfo.cycleEnd)} • C on{' '}
              {formatShortDate(day.closeInfo.closingDate)}
            </p>
            <p>
              {day.closeInfo.isCloseDay
                ? `Closing day (${day.closeInfo.closeOffsetLabel})`
                : 'No active close day on this date'}
            </p>
          </section>
        </div>

        <section className="panel inset-panel">
          <div className="split-header">
            <div>
              <span className="eyebrow">Tasks</span>
              <h3>Work scheduled for this day</h3>
            </div>
            <button className="button" type="button" onClick={() => onCreateTask(day.isoDate)}>
              Add Task
            </button>
          </div>

          {day.tasks.length > 0 ? (
            <div className="task-list">
              {day.tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  className="task-row task-row-button"
                  onClick={() => onEditTask(task)}
                >
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.description}</p>
                    <p>{getRoleName(roles, task.roleId)}</p>
                  </div>
                  <div className="task-meta">
                    <span className={`badge badge-priority-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    <span className={`badge badge-status-${task.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {task.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No tasks on this date"
              message="Create a close activity or checklist item to make this date actionable."
            />
          )}
        </section>
      </div>
    </div>
  );
}

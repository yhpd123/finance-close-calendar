import { useState } from 'react';
import { CalendarGrid } from '../components/calendar/CalendarGrid';
import { DaySummaryModal } from '../components/calendar/DaySummaryModal';
import { CloseTimeline } from '../components/close/CloseTimeline';
import { TaskDrawer } from '../components/tasks/TaskDrawer';
import { useAppData } from '../context/AppDataContext';
import { DayInfo, TaskDraft, TaskItem } from '../types';
import {
  formatMonthLabel,
  getCloseInfoByDate,
  getMonthCalendarDays,
} from '../utils';

export function CalendarPage() {
  const {
    fiscalSettings,
    closeSettings,
    tasks,
    addTask,
    updateTask,
    deleteTask,
  } = useAppData();
  const [visibleMonth, setVisibleMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12));
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [createDate, setCreateDate] = useState<string | null>(null);

  const days = getMonthCalendarDays(visibleMonth.getFullYear(), visibleMonth.getMonth(), {
    fiscalSettings,
    closeSettings,
    tasks,
  });
  const timelineInfo = getCloseInfoByDate(
    selectedDay ? new Date(`${selectedDay.isoDate}T12:00:00`) : new Date(),
    fiscalSettings,
    closeSettings,
  );

  const handleSave = (draft: TaskDraft, id?: string) => {
    if (id) {
      updateTask(id, draft);
      return;
    }

    addTask(draft);
  };

  return (
    <div className="page-stack">
      <section className="panel calendar-header-panel">
        <div className="split-header">
          <div>
            <span className="eyebrow">Calendar</span>
            <h2>{formatMonthLabel(visibleMonth)}</h2>
          </div>
          <div className="action-cluster">
            <button
              className="button button-secondary"
              type="button"
              onClick={() =>
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1, 12),
                )
              }
            >
              Previous
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() =>
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1, 12),
                )
              }
            >
              Next
            </button>
          </div>
        </div>
        <p className="section-copy">
          Track the month view, highlight close days, and drill into day-level task details with one click.
        </p>
      </section>

      {closeSettings.showTimeline ? <CloseTimeline closeInfo={timelineInfo} activeDate={selectedDay?.isoDate} /> : null}

      <CalendarGrid days={days} onSelectDay={setSelectedDay} />

      <DaySummaryModal
        day={selectedDay}
        onClose={() => setSelectedDay(null)}
        onCreateTask={(dateKey) => {
          setSelectedDay(null);
          setEditingTask(null);
          setCreateDate(dateKey);
        }}
        onEditTask={(task) => {
          setSelectedDay(null);
          setCreateDate(null);
          setEditingTask(task);
        }}
      />

      <TaskDrawer
        isOpen={Boolean(editingTask || createDate)}
        task={editingTask}
        initialDate={createDate}
        onClose={() => {
          setEditingTask(null);
          setCreateDate(null);
        }}
        onSave={handleSave}
        onDelete={(id) => {
          deleteTask(id);
          setEditingTask(null);
          setCreateDate(null);
        }}
      />
    </div>
  );
}

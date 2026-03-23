import { CalendarSettingsBundle, DayInfo } from '../types';
import {
  addDays,
  formatDateKey,
  isSameDay,
  weekdayLabels,
} from './date';
import { getCloseInfoByDate } from './close';
import { getFiscalInfoByDate } from './fiscal';
import { getTasksForDate } from './tasks';

export function getMonthCalendarDays(
  year: number,
  month: number,
  settings: CalendarSettingsBundle,
): DayInfo[] {
  const firstOfMonth = new Date(year, month, 1, 12);
  const mondayIndex = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = addDays(firstOfMonth, -mondayIndex);
  const today = new Date();

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    const isoDate = formatDateKey(date);
    const tasks = getTasksForDate(settings.tasks, isoDate);
    const closeInfo = getCloseInfoByDate(
      date,
      settings.fiscalSettings,
      settings.closeSettings,
    );

    return {
      isoDate,
      dayOfMonth: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: isSameDay(date, today),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isCloseDay: closeInfo.isCloseDay,
      taskCount: tasks.length,
      tasks,
      periodInfo: getFiscalInfoByDate(date, settings.fiscalSettings),
      closeInfo,
    };
  });
}

export { weekdayLabels };

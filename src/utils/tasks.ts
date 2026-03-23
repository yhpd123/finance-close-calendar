import { TaskItem } from '../types';
import { formatDateKey, parseDateKey, toMiddayDate } from './date';

export function getTaskAnchorDate(task: TaskItem): string {
  return task.scheduledDate || task.dueDate;
}

export function isOverdue(task: TaskItem): boolean {
  const today = toMiddayDate(new Date());
  return task.status !== 'Done' && parseDateKey(task.dueDate) < today;
}

export function getTasksForDate(tasks: TaskItem[], dateKey: string): TaskItem[] {
  return tasks.filter(
    (task) => getTaskAnchorDate(task) === dateKey || task.dueDate === dateKey,
  );
}

export function sortTasks(tasks: TaskItem[]): TaskItem[] {
  return [...tasks].sort((left, right) => {
    const dueDiff = parseDateKey(left.dueDate).getTime() - parseDateKey(right.dueDate).getTime();
    if (dueDiff !== 0) {
      return dueDiff;
    }

    return left.title.localeCompare(right.title);
  });
}

export function countTodayTasks(tasks: TaskItem[]): number {
  const todayKey = formatDateKey(new Date());
  return getTasksForDate(tasks, todayKey).length;
}

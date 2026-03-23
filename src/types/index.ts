export type PeriodType = 'natural' | '445' | '454' | '544';
export type CloseStartRule = 'period-end' | 'next-day' | 'month-end';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface FiscalSettings {
  fiscalStartDate: string;
  periodType: PeriodType;
}

export interface CloseSettings {
  closeStartRule: CloseStartRule;
  closeFromOffset: number;
  closeToOffset: number;
  showTimeline: boolean;
}

export interface RoleItem {
  id: string;
  name: string;
  description: string;
  color: string;
}

export type RoleDraft = Omit<RoleItem, 'id'>;

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  scheduledDate: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  roleId: string;
  owner?: string;
}

export type TaskDraft = Omit<TaskItem, 'id'>;

export interface PeriodInfo {
  fiscalYear: number;
  fiscalYearLabel: string;
  fiscalPeriod: number;
  fiscalQuarter: number;
  fiscalWeek: number;
  periodType: PeriodType;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
}

export interface CloseInfo {
  cycleLabel: string;
  cycleStart: string;
  cycleEnd: string;
  isCloseDay: boolean;
  closeDayNumber: number | null;
  closeDurationDays: number;
  closingDate: string;
  closeFromOffset: number;
  closeToOffset: number;
  closeOffset: number | null;
  closeOffsetLabel: string | null;
  referenceDate: string;
}

export interface DayInfo {
  isoDate: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isCloseDay: boolean;
  taskCount: number;
  tasks: TaskItem[];
  periodInfo: PeriodInfo;
  closeInfo: CloseInfo;
}

export interface FiscalPeriodPreview {
  fiscalPeriod: number;
  label: string;
  quarter: number;
  start: string;
  end: string;
  weeks: number;
}

export interface CalendarSettingsBundle {
  fiscalSettings: FiscalSettings;
  closeSettings: CloseSettings;
  tasks: TaskItem[];
}

export interface AppBackup {
  app: 'finance-close-calendar';
  version: number;
  exportedAt: string;
  fiscalSettings: FiscalSettings;
  closeSettings: CloseSettings;
  roles: RoleItem[];
  tasks: TaskItem[];
}

export const TASK_STATUS_OPTIONS: TaskStatus[] = ['Not Started', 'In Progress', 'Done'];
export const TASK_PRIORITY_OPTIONS: TaskPriority[] = ['Low', 'Medium', 'High'];
export const PERIOD_TYPE_OPTIONS: PeriodType[] = ['natural', '445', '454', '544'];
export const CLOSE_START_RULE_OPTIONS: Array<{
  value: CloseStartRule;
  label: string;
  help: string;
}> = [
  {
    value: 'period-end',
    label: 'Fiscal Period End',
    help: 'Use the fiscal period end date as the closing anchor C.',
  },
  {
    value: 'next-day',
    label: 'Day After Period End',
    help: 'Use the day after fiscal period end as the closing anchor C.',
  },
  {
    value: 'month-end',
    label: 'Month End',
    help: 'Use the calendar month end as the closing anchor C.',
  },
];

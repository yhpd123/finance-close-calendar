import { CloseInfo, CloseSettings, FiscalSettings } from '../types';
import {
  addDays,
  diffInCalendarDays,
  formatDateKey,
  formatMonthLabel,
  getMonthEnd,
  getMonthStart,
  isWithinInclusive,
  parseDateKey,
  toMiddayDate,
} from './date';
import { getFiscalInfoByDate } from './fiscal';

interface CloseWindow {
  cycleLabel: string;
  cycleStart: Date;
  cycleEnd: Date;
  closingDate: Date;
}

function normalizeCloseOffsets(closeSettings: CloseSettings) {
  return {
    from: Math.min(closeSettings.closeFromOffset, closeSettings.closeToOffset),
    to: Math.max(closeSettings.closeFromOffset, closeSettings.closeToOffset),
  };
}

export function formatCloseOffsetLabel(offset: number): string {
  if (offset === 0) {
    return 'C';
  }

  if (offset < 0) {
    return `C - ${Math.abs(offset)}`;
  }

  return `C + ${offset}`;
}

function formatCloseWindow(window: CloseWindow, date: Date, closeSettings: CloseSettings): CloseInfo {
  const offsets = normalizeCloseOffsets(closeSettings);
  const isCloseDay = isWithinInclusive(date, window.cycleStart, window.cycleEnd);
  const closeOffset = isCloseDay ? diffInCalendarDays(date, window.closingDate) : null;

  return {
    cycleLabel: window.cycleLabel,
    cycleStart: formatDateKey(window.cycleStart),
    cycleEnd: formatDateKey(window.cycleEnd),
    isCloseDay,
    closeDayNumber:
      closeOffset === null ? null : Math.max(1, closeOffset - offsets.from + 1),
    closeDurationDays: offsets.to - offsets.from + 1,
    closingDate: formatDateKey(window.closingDate),
    closeFromOffset: offsets.from,
    closeToOffset: offsets.to,
    closeOffset,
    closeOffsetLabel: closeOffset === null ? null : formatCloseOffsetLabel(closeOffset),
    referenceDate: formatDateKey(window.closingDate),
  };
}

function buildMonthEndWindow(date: Date, closeSettings: CloseSettings): CloseWindow {
  const monthEnd = getMonthEnd(date);
  const offsets = normalizeCloseOffsets(closeSettings);
  const closingDate =
    closeSettings.closeStartRule === 'next-day' ? addDays(monthEnd, 1) : monthEnd;
  const cycleStart = addDays(closingDate, offsets.from);
  const cycleEnd = addDays(closingDate, offsets.to);

  return {
    cycleLabel: `${formatMonthLabel(date)} Close`,
    cycleStart,
    cycleEnd,
    closingDate,
  };
}

function buildPeriodWindow(
  date: Date,
  fiscalSettings: FiscalSettings,
  closeSettings: CloseSettings,
): CloseWindow {
  const fiscalInfo = getFiscalInfoByDate(date, fiscalSettings);
  const periodEnd = parseDateKey(fiscalInfo.periodEnd);
  const offsets = normalizeCloseOffsets(closeSettings);
  const closingDate =
    closeSettings.closeStartRule === 'next-day' ? addDays(periodEnd, 1) : periodEnd;
  const cycleStart = addDays(closingDate, offsets.from);
  const cycleEnd = addDays(closingDate, offsets.to);

  return {
    cycleLabel: `${fiscalInfo.fiscalYearLabel} • ${fiscalInfo.periodLabel} Close`,
    cycleStart,
    cycleEnd,
    closingDate,
  };
}

export function getCloseInfoByDate(
  date: Date,
  fiscalSettings: FiscalSettings,
  closeSettings: CloseSettings,
): CloseInfo {
  const current = toMiddayDate(date);
  const lookback = Math.max(
    Math.abs(closeSettings.closeFromOffset),
    Math.abs(closeSettings.closeToOffset),
  ) + 2;

  if (closeSettings.closeStartRule === 'month-end') {
    const previousWindow = buildMonthEndWindow(
      addDays(current, -lookback),
      closeSettings,
    );
    const currentWindow = buildMonthEndWindow(current, closeSettings);
    const selected =
      [previousWindow, currentWindow].find((window) =>
        isWithinInclusive(current, window.cycleStart, window.cycleEnd),
      ) || currentWindow;

    return formatCloseWindow(selected, current, closeSettings);
  }

  const previousPeriodWindow = buildPeriodWindow(
    addDays(current, -lookback),
    fiscalSettings,
    closeSettings,
  );
  const currentPeriodWindow = buildPeriodWindow(current, fiscalSettings, closeSettings);
  const dedupedWindows = [previousPeriodWindow, currentPeriodWindow].filter(
    (window, index, array) =>
      array.findIndex((candidate) => candidate.cycleStart.getTime() === window.cycleStart.getTime()) ===
      index,
  );
  const selected =
    dedupedWindows.find((window) => isWithinInclusive(current, window.cycleStart, window.cycleEnd)) ||
    currentPeriodWindow;

  return formatCloseWindow(selected, current, closeSettings);
}

export function getCloseCyclesForMonth(
  referenceDate: Date,
  fiscalSettings: FiscalSettings,
  closeSettings: CloseSettings,
): CloseInfo[] {
  const monthStart = getMonthStart(referenceDate);
  const monthEnd = getMonthEnd(referenceDate);
  const cycles = new Map<string, CloseInfo>();
  const lookback = Math.max(
    Math.abs(closeSettings.closeFromOffset),
    Math.abs(closeSettings.closeToOffset),
  ) + 2;

  for (let index = -lookback; index <= monthEnd.getDate() + lookback; index += 1) {
    const date = addDays(monthStart, index);
    const closeInfo = getCloseInfoByDate(date, fiscalSettings, closeSettings);
    const cycleStart = parseDateKey(closeInfo.cycleStart);
    const cycleEnd = parseDateKey(closeInfo.cycleEnd);

    if (cycleEnd < monthStart || cycleStart > monthEnd) {
      continue;
    }

    cycles.set(closeInfo.cycleStart, closeInfo);
  }

  return Array.from(cycles.values()).sort((left, right) =>
    left.cycleStart.localeCompare(right.cycleStart),
  );
}

import {
  FiscalPeriodPreview,
  FiscalSettings,
  PeriodInfo,
  PeriodType,
} from '../types';
import {
  addDays,
  addMonths,
  createRecurringDate,
  diffInCalendarDays,
  formatDateKey,
  parseDateKey,
  toMiddayDate,
} from './date';

const WEEKLY_PERIOD_PATTERNS: Record<Exclude<PeriodType, 'natural'>, number[]> = {
  '445': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5],
  '454': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4],
  '544': [5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4],
};

function getFiscalAnchorParts(settings: FiscalSettings) {
  const anchor = parseDateKey(settings.fiscalStartDate);
  return {
    month: anchor.getMonth(),
    day: anchor.getDate(),
  };
}

export function getFiscalYearStart(date: Date, settings: FiscalSettings): Date {
  const current = toMiddayDate(date);
  const anchor = getFiscalAnchorParts(settings);

  let fiscalYearStart = createRecurringDate(current.getFullYear(), anchor.month, anchor.day);
  if (current < fiscalYearStart) {
    fiscalYearStart = createRecurringDate(current.getFullYear() - 1, anchor.month, anchor.day);
  }

  return fiscalYearStart;
}

function getNextFiscalYearStart(fiscalYearStart: Date, settings: FiscalSettings): Date {
  const anchor = getFiscalAnchorParts(settings);
  return createRecurringDate(fiscalYearStart.getFullYear() + 1, anchor.month, anchor.day);
}

function buildWeeklyPattern(
  fiscalYearStart: Date,
  nextFiscalYearStart: Date,
  periodType: Exclude<PeriodType, 'natural'>,
) {
  const basePattern = [...WEEKLY_PERIOD_PATTERNS[periodType]];
  const yearLength = diffInCalendarDays(nextFiscalYearStart, fiscalYearStart);
  const extraWeeks = Math.max(0, Math.round((yearLength - 364) / 7));
  basePattern[basePattern.length - 1] += extraWeeks;
  return basePattern;
}

export function getFiscalPeriodsForYear(
  settings: FiscalSettings,
  referenceDate = new Date(),
): FiscalPeriodPreview[] {
  const fiscalYearStart = getFiscalYearStart(referenceDate, settings);
  const nextFiscalYearStart = getNextFiscalYearStart(fiscalYearStart, settings);

  if (settings.periodType === 'natural') {
    return Array.from({ length: 12 }, (_, index) => {
      const start = index === 0 ? fiscalYearStart : addMonths(fiscalYearStart, index);
      const nextStart = index === 11 ? nextFiscalYearStart : addMonths(fiscalYearStart, index + 1);
      const end = addDays(nextStart, -1);
      const weeks = Math.max(1, Math.round((diffInCalendarDays(nextStart, start) || 1) / 7));

      return {
        fiscalPeriod: index + 1,
        label: `P${String(index + 1).padStart(2, '0')}`,
        quarter: Math.ceil((index + 1) / 3),
        start: formatDateKey(start),
        end: formatDateKey(end),
        weeks,
      };
    });
  }

  const pattern = buildWeeklyPattern(
    fiscalYearStart,
    nextFiscalYearStart,
    settings.periodType,
  );

  let cumulativeWeeks = 0;
  return pattern.map((weeks, index) => {
    const start = addDays(fiscalYearStart, cumulativeWeeks * 7);
    cumulativeWeeks += weeks;
    const end = addDays(fiscalYearStart, cumulativeWeeks * 7 - 1);

    return {
      fiscalPeriod: index + 1,
      label: `P${String(index + 1).padStart(2, '0')}`,
      quarter: Math.ceil((index + 1) / 3),
      start: formatDateKey(start),
      end: formatDateKey(end),
      weeks,
    };
  });
}

export function getFiscalInfoByDate(date: Date, settings: FiscalSettings): PeriodInfo {
  const current = toMiddayDate(date);
  const fiscalYearStart = getFiscalYearStart(current, settings);
  const nextFiscalYearStart = getNextFiscalYearStart(fiscalYearStart, settings);
  const fiscalYearEnd = addDays(nextFiscalYearStart, -1);
  const periods = getFiscalPeriodsForYear(settings, current);
  const fiscalWeek = Math.floor(diffInCalendarDays(current, fiscalYearStart) / 7) + 1;

  const activePeriod =
    periods.find((period) => {
      const start = parseDateKey(period.start);
      const end = parseDateKey(period.end);
      return current >= start && current <= end;
    }) || periods[periods.length - 1];

  return {
    fiscalYear: fiscalYearEnd.getFullYear(),
    fiscalYearLabel: `FY ${fiscalYearEnd.getFullYear()}`,
    fiscalPeriod: activePeriod.fiscalPeriod,
    fiscalQuarter: activePeriod.quarter,
    fiscalWeek,
    periodType: settings.periodType,
    periodLabel: activePeriod.label,
    periodStart: activePeriod.start,
    periodEnd: activePeriod.end,
  };
}

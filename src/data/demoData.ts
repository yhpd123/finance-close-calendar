import {
  CloseSettings,
  FiscalSettings,
  RoleItem,
  TaskDraft,
  TaskItem,
} from '../types';
import { addDays, formatDateKey, toMiddayDate } from '../utils/date';
import { findRoleByName } from '../utils/roles';

export function createDemoRoles(): RoleItem[] {
  return [
    {
      id: 'role-revenue',
      name: 'Revenue',
      description: 'Revenue recognition, cut-off, and order-to-cash checks.',
      color: '#d85e31',
    },
    {
      id: 'role-inventory',
      name: 'Inventory',
      description: 'Inventory valuation, counts, reserves, and COGS support.',
      color: '#b86f2d',
    },
    {
      id: 'role-intercompany',
      name: 'Intercompany',
      description: 'Intercompany agreements, settlements, and eliminations.',
      color: '#0d7a6f',
    },
    {
      id: 'role-cash',
      name: 'Cash',
      description: 'Bank recs, treasury controls, and cash movement sign-off.',
      color: '#2563eb',
    },
    {
      id: 'role-tax',
      name: 'Tax',
      description: 'Tax provision, indirect tax accruals, and compliance support.',
      color: '#c2410c',
    },
    {
      id: 'role-fpa',
      name: 'FP&A',
      description: 'Flash reporting, variance review, and leadership pack prep.',
      color: '#0284c7',
    },
  ];
}

export function createDemoFiscalSettings(referenceDate = new Date()): FiscalSettings {
  return {
    fiscalStartDate: formatDateKey(new Date(referenceDate.getFullYear(), 0, 1, 12)),
    periodType: 'natural',
  };
}

export function createDemoCloseSettings(): CloseSettings {
  return {
    closeStartRule: 'next-day',
    closeFromOffset: -5,
    closeToOffset: 5,
    showTimeline: true,
  };
}

function getDemoRoleId(roles: RoleItem[], roleName: string): string {
  return findRoleByName(roles, roleName)?.id || roles[0]?.id || '';
}

export function createDemoTasks(
  roles: RoleItem[] = createDemoRoles(),
  referenceDate = new Date(),
): TaskItem[] {
  const today = toMiddayDate(referenceDate);

  const demoDrafts: TaskDraft[] = [
    {
      title: 'Bank reconciliation',
      description: 'Tie out daily cash balances and clear unmatched transactions before the close window opens.',
      scheduledDate: formatDateKey(addDays(today, -1)),
      dueDate: formatDateKey(today),
      status: 'In Progress',
      priority: 'High',
      roleId: getDemoRoleId(roles, 'Cash'),
    },
    {
      title: 'AP accrual review',
      description: 'Review unbooked invoices and prepare the period-end accrual entry.',
      scheduledDate: formatDateKey(today),
      dueDate: formatDateKey(addDays(today, 1)),
      status: 'Not Started',
      priority: 'High',
      roleId: getDemoRoleId(roles, 'Revenue'),
    },
    {
      title: 'Revenue cut-off validation',
      description: 'Confirm shipment timing and deferred revenue treatment with operations.',
      scheduledDate: formatDateKey(addDays(today, 1)),
      dueDate: formatDateKey(addDays(today, 2)),
      status: 'Not Started',
      priority: 'High',
      roleId: getDemoRoleId(roles, 'Revenue'),
    },
    {
      title: 'Payroll journal posting',
      description: 'Validate payroll file and post the monthly payroll journal batch.',
      scheduledDate: formatDateKey(addDays(today, 2)),
      dueDate: formatDateKey(addDays(today, 3)),
      status: 'Not Started',
      priority: 'Medium',
      roleId: getDemoRoleId(roles, 'FP&A'),
    },
    {
      title: 'Fixed asset rollforward',
      description: 'Update additions and disposals, then reconcile the capex clearing account.',
      scheduledDate: formatDateKey(addDays(today, -5)),
      dueDate: formatDateKey(addDays(today, -1)),
      status: 'Not Started',
      priority: 'Medium',
      roleId: getDemoRoleId(roles, 'Inventory'),
    },
    {
      title: 'Tax provision checkpoint',
      description: 'Review book-to-tax adjustments and confirm the current provision estimate.',
      scheduledDate: formatDateKey(addDays(today, -2)),
      dueDate: formatDateKey(today),
      status: 'Done',
      priority: 'Medium',
      roleId: getDemoRoleId(roles, 'Tax'),
    },
    {
      title: 'Executive flash pack',
      description: 'Prepare the first-pass KPI flash deck for leadership review.',
      scheduledDate: formatDateKey(addDays(today, 3)),
      dueDate: formatDateKey(addDays(today, 4)),
      status: 'Not Started',
      priority: 'High',
      roleId: getDemoRoleId(roles, 'FP&A'),
    },
    {
      title: 'Intercompany eliminations',
      description: 'Validate intercompany balances and resolve unsupported variances.',
      scheduledDate: formatDateKey(addDays(today, 5)),
      dueDate: formatDateKey(addDays(today, 6)),
      status: 'Not Started',
      priority: 'Low',
      roleId: getDemoRoleId(roles, 'Intercompany'),
    },
  ];

  return demoDrafts.map((task) => ({
    id: crypto.randomUUID(),
    ...task,
  }));
}

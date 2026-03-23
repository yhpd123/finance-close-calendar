import { RoleItem, TaskDraft, TaskPriority, TaskStatus } from '../types';
import { formatDateKey } from './date';
import { SpreadsheetRow, getSpreadsheetValue } from './excel';
import { createRoleItem, findRoleByName } from './roles';

function normalizeImportedDate(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return formatDateKey(parsed);
}

function normalizeTaskStatus(value: string): TaskStatus {
  const lookup = value.trim().toLowerCase();

  if (lookup === 'done' || lookup === 'complete' || lookup === 'completed') {
    return 'Done';
  }

  if (lookup === 'in progress' || lookup === 'inprogress' || lookup === 'active') {
    return 'In Progress';
  }

  return 'Not Started';
}

function normalizeTaskPriority(value: string): TaskPriority {
  const lookup = value.trim().toLowerCase();

  if (lookup === 'high' || lookup === 'h') {
    return 'High';
  }

  if (lookup === 'low' || lookup === 'l') {
    return 'Low';
  }

  return 'Medium';
}

export function parseRoleImportRows(rows: SpreadsheetRow[], existingRoles: RoleItem[]) {
  const mergedRoles = [...existingRoles];
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  rows.forEach((row, index) => {
    const name = getSpreadsheetValue(row, ['name', 'role', 'rolename', 'team']);
    if (!name) {
      skipped += 1;
      return;
    }

    const description = getSpreadsheetValue(row, ['description', 'details', 'notes']);
    const color = getSpreadsheetValue(row, ['color', 'hex']);
    const existing = findRoleByName(mergedRoles, name);

    if (existing) {
      mergedRoles[mergedRoles.findIndex((role) => role.id === existing.id)] = {
        ...existing,
        description: description || existing.description,
        color: color || existing.color,
      };
      updated += 1;
      return;
    }

    mergedRoles.push(
      createRoleItem(
        {
          name,
          description,
          color,
        },
        index,
      ),
    );
    imported += 1;
  });

  return {
    roles: mergedRoles,
    imported,
    updated,
    skipped,
  };
}

export function parseTaskImportRows(rows: SpreadsheetRow[], existingRoles: RoleItem[]) {
  const rolePool = [...existingRoles];
  const createdRoles: RoleItem[] = [];
  const tasks: TaskDraft[] = [];
  let imported = 0;
  let skipped = 0;
  const fallbackDate = formatDateKey(new Date());

  rows.forEach((row, index) => {
    const title = getSpreadsheetValue(row, ['title', 'task', 'taskname']);
    if (!title) {
      skipped += 1;
      return;
    }

    const roleName =
      getSpreadsheetValue(row, ['role', 'team', 'owner', 'function']) || rolePool[0]?.name || '';
    let role = roleName ? findRoleByName(rolePool, roleName) : undefined;

    if (!role && roleName) {
      role = createRoleItem(
        {
          name: roleName,
          description: '',
          color: '',
        },
        rolePool.length + index,
      );
      rolePool.push(role);
      createdRoles.push(role);
    }

    const scheduledDate = normalizeImportedDate(
      getSpreadsheetValue(row, ['scheduleddate', 'scheduled', 'date', 'startdate']),
      fallbackDate,
    );
    const dueDate = normalizeImportedDate(
      getSpreadsheetValue(row, ['duedate', 'due', 'deadline', 'enddate']),
      scheduledDate,
    );

    tasks.push({
      title,
      description: getSpreadsheetValue(row, ['description', 'details', 'notes']),
      scheduledDate,
      dueDate,
      status: normalizeTaskStatus(getSpreadsheetValue(row, ['status', 'state'])),
      priority: normalizeTaskPriority(getSpreadsheetValue(row, ['priority', 'prio', 'severity'])),
      roleId: role?.id || rolePool[0]?.id || '',
      owner: getSpreadsheetValue(row, ['ownername', 'person']),
    });
    imported += 1;
  });

  return {
    tasks,
    createdRoles,
    imported,
    skipped,
  };
}

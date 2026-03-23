import { RoleDraft, RoleItem } from '../types';

const ROLE_COLOR_PALETTE = [
  '#0d7a6f',
  '#d85e31',
  '#2563eb',
  '#b86f2d',
  '#0284c7',
  '#2f855a',
  '#c05621',
  '#2b6cb0',
];

export function normalizeLookupValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getRoleColor(index: number): string {
  return ROLE_COLOR_PALETTE[index % ROLE_COLOR_PALETTE.length];
}

export function normalizeRoleColor(value: string, index = 0): string {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
    ? value.trim()
    : getRoleColor(index);
}

export function createRoleItem(draft: RoleDraft, index = 0): RoleItem {
  return {
    id: crypto.randomUUID(),
    name: draft.name.trim(),
    description: draft.description.trim(),
    color: normalizeRoleColor(draft.color, index),
  };
}

export function findRoleByName(roles: RoleItem[], name: string): RoleItem | undefined {
  const lookup = normalizeLookupValue(name);
  return roles.find((role) => normalizeLookupValue(role.name) === lookup);
}

export function getRoleById(roles: RoleItem[], roleId: string): RoleItem | undefined {
  return roles.find((role) => role.id === roleId);
}

export function getRoleName(roles: RoleItem[], roleId: string): string {
  return getRoleById(roles, roleId)?.name || 'Unassigned';
}

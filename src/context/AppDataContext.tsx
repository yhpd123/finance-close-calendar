import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { STORAGE_KEYS } from '../constants/storage';
import {
  createDemoCloseSettings,
  createDemoFiscalSettings,
  createDemoRoles,
  createDemoTasks,
} from '../data/demoData';
import {
  AppBackup,
  CloseSettings,
  FiscalSettings,
  RoleDraft,
  RoleItem,
  TaskDraft,
  TaskItem,
} from '../types';
import { formatDateKey, loadFromStorage, saveToStorage } from '../utils';
import { createRoleItem, findRoleByName } from '../utils/roles';

interface AppDataContextValue {
  fiscalSettings: FiscalSettings;
  closeSettings: CloseSettings;
  roles: RoleItem[];
  tasks: TaskItem[];
  exportBackup: () => AppBackup;
  importBackup: (payload: unknown) => { roleCount: number; taskCount: number };
  saveFiscalSettings: (settings: FiscalSettings) => void;
  restoreFiscalDefaults: () => void;
  saveCloseSettings: (settings: CloseSettings) => void;
  restoreCloseDefaults: () => void;
  saveRoles: (roles: RoleItem[]) => void;
  addRole: (role: RoleDraft) => void;
  deleteRole: (id: string) => void;
  restoreDemoRoles: () => void;
  addTask: (task: TaskDraft) => void;
  addTasks: (tasks: TaskDraft[]) => void;
  updateTask: (id: string, task: TaskDraft) => void;
  deleteTask: (id: string) => void;
  restoreDemoTasks: () => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeFiscalSettings(input: unknown): FiscalSettings {
  const fallback = createDemoFiscalSettings();
  if (!isRecord(input)) {
    return fallback;
  }

  return {
    fiscalStartDate:
      typeof input.fiscalStartDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.fiscalStartDate)
        ? input.fiscalStartDate
        : fallback.fiscalStartDate,
    periodType:
      input.periodType === 'natural' ||
      input.periodType === '445' ||
      input.periodType === '454' ||
      input.periodType === '544'
        ? input.periodType
        : fallback.periodType,
  };
}

function normalizeCloseSettings(input: unknown): CloseSettings {
  const fallback = createDemoCloseSettings();
  if (!isRecord(input)) {
    return fallback;
  }

  const closeFromOffset =
    typeof input.closeFromOffset === 'number'
      ? input.closeFromOffset
      : typeof input.closeDurationDays === 'number'
        ? 0
        : fallback.closeFromOffset;

  const closeToOffset =
    typeof input.closeToOffset === 'number'
      ? input.closeToOffset
      : typeof input.closeDurationDays === 'number'
        ? Math.max(0, input.closeDurationDays - 1)
        : fallback.closeToOffset;

  return {
    closeStartRule:
      input.closeStartRule === 'period-end' ||
      input.closeStartRule === 'next-day' ||
      input.closeStartRule === 'month-end'
        ? input.closeStartRule
        : fallback.closeStartRule,
    closeFromOffset,
    closeToOffset,
    showTimeline:
      typeof input.showTimeline === 'boolean' ? input.showTimeline : fallback.showTimeline,
  };
}

function normalizeRoles(input: unknown): RoleItem[] {
  if (!Array.isArray(input)) {
    return createDemoRoles();
  }

  const normalized = input
    .filter(isRecord)
    .map((role, index) => ({
      id: typeof role.id === 'string' ? role.id : crypto.randomUUID(),
      name:
        typeof role.name === 'string' && role.name.trim()
          ? role.name.trim()
          : `Role ${index + 1}`,
      description: typeof role.description === 'string' ? role.description : '',
      color:
        typeof role.color === 'string' && role.color.trim() ? role.color : createDemoRoles()[index % createDemoRoles().length]?.color || '#0d7a6f',
    }))
    .filter((role) => role.name);

  return normalized.length > 0 ? normalized : createDemoRoles();
}

function normalizeTasks(
  input: unknown,
  roles: RoleItem[],
  useDemoFallback: boolean,
): TaskItem[] {
  if (!Array.isArray(input)) {
    return useDemoFallback ? createDemoTasks(roles) : [];
  }

  const normalized = input.map((task, index) =>
    normalizeTask(isRecord(task) ? task : {}, roles, index),
  );

  if (normalized.length > 0 || !useDemoFallback) {
    return normalized;
  }

  return createDemoTasks(roles);
}

function normalizeTask(task: Partial<TaskItem>, roles: RoleItem[], index: number): TaskItem {
  const fallbackRoleId = roles[0]?.id || '';
  const matchedRole =
    roles.find((role) => role.id === task.roleId) ||
    (task.owner ? findRoleByName(roles, task.owner) : undefined);

  return {
    id: task.id || crypto.randomUUID(),
    title: task.title || `Task ${index + 1}`,
    description: task.description || '',
    scheduledDate: task.scheduledDate || task.dueDate || formatDateKey(new Date()),
    dueDate: task.dueDate || task.scheduledDate || formatDateKey(new Date()),
    status: task.status || 'Not Started',
    priority: task.priority || 'Medium',
    roleId: matchedRole?.id || fallbackRoleId,
    owner: task.owner || '',
  };
}

function buildInitialAppState() {
  const roles = normalizeRoles(loadFromStorage(STORAGE_KEYS.roles, createDemoRoles()));
  const fiscalSettings = normalizeFiscalSettings(loadFromStorage(
    STORAGE_KEYS.fiscalSettings,
    createDemoFiscalSettings(),
  ));
  const closeSettings = normalizeCloseSettings(loadFromStorage(
    STORAGE_KEYS.closeSettings,
    createDemoCloseSettings(),
  ));
  const storedTasks = loadFromStorage(STORAGE_KEYS.tasks, createDemoTasks(roles));
  const tasks = normalizeTasks(storedTasks, roles, true);

  return {
    fiscalSettings,
    closeSettings,
    roles,
    tasks,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const initialState = useRef(buildInitialAppState()).current;
  const [fiscalSettings, setFiscalSettings] = useState<FiscalSettings>(initialState.fiscalSettings);
  const [closeSettings, setCloseSettings] = useState<CloseSettings>(initialState.closeSettings);
  const [roles, setRoles] = useState<RoleItem[]>(initialState.roles);
  const [tasks, setTasks] = useState<TaskItem[]>(initialState.tasks);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.fiscalSettings, fiscalSettings);
  }, [fiscalSettings]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.closeSettings, closeSettings);
  }, [closeSettings]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.roles, roles);
  }, [roles]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.tasks, tasks);
  }, [tasks]);

  const value: AppDataContextValue = {
    fiscalSettings,
    closeSettings,
    roles,
    tasks,
    exportBackup: () => ({
      app: 'finance-close-calendar',
      version: 1,
      exportedAt: new Date().toISOString(),
      fiscalSettings,
      closeSettings,
      roles,
      tasks,
    }),
    importBackup: (payload) => {
      const source = isRecord(payload) ? payload : {};
      const nextRoles = normalizeRoles(source.roles);
      const nextFiscalSettings = normalizeFiscalSettings(source.fiscalSettings);
      const nextCloseSettings = normalizeCloseSettings(source.closeSettings);
      const nextTasks = normalizeTasks(source.tasks, nextRoles, false);

      setFiscalSettings(nextFiscalSettings);
      setCloseSettings(nextCloseSettings);
      setRoles(nextRoles);
      setTasks(nextTasks);

      return {
        roleCount: nextRoles.length,
        taskCount: nextTasks.length,
      };
    },
    saveFiscalSettings: setFiscalSettings,
    restoreFiscalDefaults: () => setFiscalSettings(createDemoFiscalSettings()),
    saveCloseSettings: setCloseSettings,
    restoreCloseDefaults: () => setCloseSettings(createDemoCloseSettings()),
    saveRoles: setRoles,
    addRole: (role) =>
      setRoles((current) => [...current, createRoleItem(role, current.length)]),
    deleteRole: (id) => {
      setRoles((currentRoles) => {
        if (currentRoles.length <= 1) {
          return currentRoles;
        }

        const nextRoles = currentRoles.filter((role) => role.id !== id);
        const fallbackRoleId = nextRoles[0]?.id || '';
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.roleId === id ? { ...task, roleId: fallbackRoleId } : task,
          ),
        );
        return nextRoles;
      });
    },
    restoreDemoRoles: () => {
      const demoRoles = createDemoRoles();
      setRoles(demoRoles);
      setTasks((currentTasks) =>
        currentTasks.map((task, index) => normalizeTask(task, demoRoles, index)),
      );
    },
    addTask: (task) =>
      setTasks((current) => [{ id: crypto.randomUUID(), ...task }, ...current]),
    addTasks: (newTasks) =>
      setTasks((current) => [
        ...newTasks.map((task) => ({ id: crypto.randomUUID(), ...task })),
        ...current,
      ]),
    updateTask: (id, task) =>
      setTasks((current) =>
        current.map((item) => (item.id === id ? { ...item, ...task, id } : item)),
      ),
    deleteTask: (id) => setTasks((current) => current.filter((item) => item.id !== id)),
    restoreDemoTasks: () => setTasks(createDemoTasks(roles)),
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppProvider');
  }

  return context;
}

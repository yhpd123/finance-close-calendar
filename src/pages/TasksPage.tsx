import { ChangeEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { TaskDrawer } from '../components/tasks/TaskDrawer';
import { useAppData } from '../context/AppDataContext';
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS, TaskDraft, TaskItem } from '../types';
import {
  downloadSpreadsheetTemplate,
  formatShortDate,
  getRoleName,
  isOverdue,
  parseTaskImportRows,
  readSpreadsheetRows,
  sortTasks,
} from '../utils';

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    roles,
    tasks,
    addTask,
    addTasks,
    saveRoles,
    updateTask,
    deleteTask,
    restoreDemoTasks,
  } = useAppData();
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isTemplateDownloading, setIsTemplateDownloading] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const orderedTasks = sortTasks(tasks);
  const roleFilter = searchParams.get('roleId') || 'All';
  const statusFilter = searchParams.get('status') || 'All';
  const priorityFilter = searchParams.get('priority') || 'All';
  const focusDateFilter = searchParams.get('focusDate') || '';
  const overdueOnly = searchParams.get('overdue') === '1';
  const inProgressCount = tasks.filter((task) => task.status === 'In Progress').length;
  const overdueCount = tasks.filter(isOverdue).length;

  const filteredTasks = orderedTasks.filter((task) => {
    const matchesRole = roleFilter === 'All' || task.roleId === roleFilter;
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesFocusDate =
      !focusDateFilter ||
      task.dueDate === focusDateFilter ||
      task.scheduledDate === focusDateFilter;
    const matchesOverdue = !overdueOnly || isOverdue(task);
    const lookup = `${task.title} ${task.description} ${getRoleName(roles, task.roleId)}`.toLowerCase();
    const matchesKeyword = !keyword.trim() || lookup.includes(keyword.trim().toLowerCase());

    return (
      matchesRole &&
      matchesStatus &&
      matchesPriority &&
      matchesFocusDate &&
      matchesOverdue &&
      matchesKeyword
    );
  });

  useEffect(() => {
    setKeyword(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    const taskId = searchParams.get('taskId');
    if (!taskId) {
      return;
    }

    const matchedTask = tasks.find((task) => task.id === taskId);
    if (matchedTask) {
      setEditingTask(matchedTask);
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('taskId');
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams, tasks]);

  const handleSave = (draft: TaskDraft, id?: string) => {
    if (id) {
      updateTask(id, draft);
      return;
    }

    addTask(draft);
  };

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'All') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setKeyword('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsImporting(true);
    try {
      const rows = await readSpreadsheetRows(file);
      const result = parseTaskImportRows(rows, roles);
      if (result.createdRoles.length > 0) {
        saveRoles([...roles, ...result.createdRoles]);
      }
      if (result.tasks.length > 0) {
        addTasks(result.tasks);
      }
      setImportMessage(
        `Imported ${result.imported} tasks, created ${result.createdRoles.length} roles, skipped ${result.skipped}.`,
      );
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : 'Import failed.');
    } finally {
      event.target.value = '';
      setIsImporting(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="panel tasks-toolbar-panel">
        <div className="split-header tasks-toolbar-header">
          <div>
            <span className="eyebrow">Tasks</span>
            <h2>Tasks</h2>
          </div>

          <div className="task-toolbar-actions">
            <span className="badge badge-neutral">{filteredTasks.length} matched</span>
            <span className="badge badge-neutral">{inProgressCount} in progress</span>
            <span className="badge badge-neutral">{overdueCount} overdue</span>
            <button
              className="button button-secondary button-small"
              type="button"
              onClick={restoreDemoTasks}
            >
              Reload Demo
            </button>
            <button
              className="button button-secondary button-small"
              type="button"
              onClick={() => setIsImportModalOpen(true)}
            >
              Excel Import
            </button>
            <button className="button button-small" type="button" onClick={() => setIsCreating(true)}>
              Add Task
            </button>
          </div>
        </div>

        <div className="compact-filter-grid">
          <label className="field compact-field">
            <span>Keyword</span>
            <input
              value={keyword}
              placeholder="Search title, role, description"
              onChange={(event) => {
                const nextValue = event.target.value;
                setKeyword(nextValue);
                const next = new URLSearchParams(searchParams);
                if (!nextValue.trim()) {
                  next.delete('q');
                } else {
                  next.set('q', nextValue);
                }
                setSearchParams(next, { replace: true });
              }}
            />
          </label>

          <label className="field compact-field">
            <span>Role</span>
            <select value={roleFilter} onChange={(event) => updateFilter('roleId', event.target.value)}>
              <option value="All">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field compact-field">
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => updateFilter('status', event.target.value)}>
              <option value="All">All Statuses</option>
              {TASK_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="field compact-field">
            <span>Priority</span>
            <select value={priorityFilter} onChange={(event) => updateFilter('priority', event.target.value)}>
              <option value="All">All Priorities</option>
              {TASK_PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          <label className="toggle-field compact-toggle">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(event) => updateFilter('overdue', event.target.checked ? '1' : '')}
            />
            <div>
              <strong>Overdue only</strong>
            </div>
          </label>
        </div>

        <div className="task-filter-meta">
          {focusDateFilter ? (
            <span className="badge badge-neutral">Focus Date: {formatShortDate(focusDateFilter)}</span>
          ) : null}
          {overdueOnly ? <span className="badge badge-warning">Overdue only</span> : null}
          <button className="button button-secondary button-small" type="button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </section>

      <section className="panel task-list-panel">
        {filteredTasks.length > 0 ? (
          <div className="task-list task-list-tight">
            {filteredTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                className={`task-row task-row-button${isOverdue(task) ? ' task-row-overdue' : ''}`}
                onClick={() => setEditingTask(task)}
              >
                <div>
                  <div className="task-row-heading">
                    <strong>{task.title}</strong>
                    {isOverdue(task) ? <span className="badge badge-warning">Overdue</span> : null}
                  </div>
                  <p>{task.description || 'No description yet.'}</p>
                  <div className="task-subline">
                    <span>Scheduled {formatShortDate(task.scheduledDate)}</span>
                    <span>Due {formatShortDate(task.dueDate)}</span>
                    <span>{getRoleName(roles, task.roleId)}</span>
                  </div>
                </div>
                <div className="task-meta">
                  <span className={`badge badge-priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                  <span className={`badge badge-status-${task.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {task.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No tasks matched"
            message="Adjust the filters, reload demo data, or add a new task to continue the analysis."
            action={
              <div className="action-cluster">
                <button className="button button-secondary" type="button" onClick={restoreDemoTasks}>
                  Load Demo Tasks
                </button>
                <button className="button" type="button" onClick={() => setIsCreating(true)}>
                  Add First Task
                </button>
              </div>
            }
          />
        )}
      </section>

      {isImportModalOpen ? (
        <div className="overlay" role="presentation" onClick={() => setIsImportModalOpen(false)}>
          <div
            className="modal-panel import-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-import-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">Excel Import</span>
                <h2 id="task-import-title">Import task file</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="section-copy">
              Download the template first, then choose an `.xlsx`, `.xls`, or `.csv` file to import.
            </p>

            <div className="import-modal-actions">
              <button
                className="button button-secondary"
                type="button"
                disabled={isTemplateDownloading}
                onClick={async () => {
                  setIsTemplateDownloading(true);
                  try {
                    await downloadSpreadsheetTemplate(
                      'task-upload-template.xlsx',
                      ['title', 'description', 'scheduledDate', 'dueDate', 'status', 'priority', 'role'],
                      [
                        {
                          title: 'Revenue cut-off validation',
                          description: 'Validate shipment cut-off and deferred revenue treatment',
                          scheduledDate: '2026-03-18',
                          dueDate: '2026-03-20',
                          status: 'Not Started',
                          priority: 'High',
                          role: 'Revenue',
                        },
                        {
                          title: 'Intercompany eliminations',
                          description: 'Review eliminations and clear unsupported variances',
                          scheduledDate: '2026-03-19',
                          dueDate: '2026-03-22',
                          status: 'In Progress',
                          priority: 'Medium',
                          role: 'Intercompany',
                        },
                      ],
                    );
                    setImportMessage('Template downloaded successfully.');
                  } catch (error) {
                    setImportMessage(
                      error instanceof Error ? error.message : 'Template download failed.',
                    );
                  } finally {
                    setIsTemplateDownloading(false);
                  }
                }}
              >
                {isTemplateDownloading ? 'Preparing template...' : 'Download Template'}
              </button>

              <label className="upload-field import-modal-upload">
                <span>{isImporting ? 'Importing...' : 'Choose File'}</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  disabled={isImporting}
                  onChange={(event) => void handleImportFile(event)}
                />
              </label>
            </div>

            <p className="import-columns">
              Expected columns: title, description, scheduledDate, dueDate, status, priority, role
            </p>
            {importMessage ? <div className="import-status">{importMessage}</div> : null}
          </div>
        </div>
      ) : null}

      <TaskDrawer
        isOpen={Boolean(editingTask || isCreating)}
        task={editingTask}
        onClose={() => {
          setEditingTask(null);
          setIsCreating(false);
        }}
        onSave={handleSave}
        onDelete={(id) => {
          deleteTask(id);
          setEditingTask(null);
          setIsCreating(false);
        }}
      />
    </div>
  );
}

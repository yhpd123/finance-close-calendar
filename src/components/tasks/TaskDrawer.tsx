import { FormEvent, useEffect, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import {
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  TaskDraft,
  TaskItem,
} from '../../types';
import { formatDateKey } from '../../utils';

interface TaskDrawerProps {
  isOpen: boolean;
  task?: TaskItem | null;
  initialDate?: string | null;
  onClose: () => void;
  onSave: (task: TaskDraft, id?: string) => void;
  onDelete: (id: string) => void;
}

function createInitialDraft(
  task?: TaskItem | null,
  initialDate?: string | null,
  fallbackRoleId?: string,
): TaskDraft {
  const fallbackDate = initialDate || formatDateKey(new Date());

  return {
    title: task?.title || '',
    description: task?.description || '',
    scheduledDate: task?.scheduledDate || fallbackDate,
    dueDate: task?.dueDate || fallbackDate,
    status: task?.status || 'Not Started',
    priority: task?.priority || 'Medium',
    roleId: task?.roleId || fallbackRoleId || '',
    owner: task?.owner || '',
  };
}

export function TaskDrawer({
  isOpen,
  task,
  initialDate,
  onClose,
  onSave,
  onDelete,
}: TaskDrawerProps) {
  const { roles } = useAppData();
  const [draft, setDraft] = useState<TaskDraft>(() =>
    createInitialDraft(task, initialDate, roles[0]?.id),
  );

  useEffect(() => {
    setDraft(createInitialDraft(task, initialDate, roles[0]?.id));
  }, [task, initialDate, isOpen, roles]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(draft, task?.id);
    onClose();
  };

  return (
    <div className="drawer-shell" role="presentation" onClick={onClose}>
      <aside className="drawer-panel" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="eyebrow">{task ? 'Edit Task' : 'New Task'}</span>
            <h2>{task ? task.title : 'Create close activity'}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="drawer-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Task Title</span>
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Ex: Accrual review"
              required
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              rows={4}
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Capture the close step, support needed, and expected outcome."
            />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Scheduled Date</span>
              <input
                type="date"
                value={draft.scheduledDate}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, scheduledDate: event.target.value }))
                }
                required
              />
            </label>

            <label className="field">
              <span>Due Date</span>
              <input
                type="date"
                value={draft.dueDate}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, dueDate: event.target.value }))
                }
                required
              />
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Status</span>
              <select
                value={draft.status}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    status: event.target.value as TaskDraft['status'],
                  }))
                }
              >
                {TASK_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Role</span>
              <select
                value={draft.roleId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    roleId: event.target.value,
                  }))
                }
                required
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Priority</span>
              <select
                value={draft.priority}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    priority: event.target.value as TaskDraft['priority'],
                  }))
                }
              >
                {TASK_PRIORITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="drawer-actions">
            {task ? (
              <button className="button button-danger" type="button" onClick={() => onDelete(task.id)}>
                Delete
              </button>
            ) : (
              <span />
            )}
            <div className="action-cluster">
              <button className="button button-secondary" type="button" onClick={onClose}>
                Cancel
              </button>
              <button className="button" type="submit">
                Save Task
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}

import { CSSProperties } from 'react';
import { RoleItem, TaskItem } from '../../types';
import { getRoleName, isOverdue } from '../../utils';

interface DashboardInsightsProps {
  roles: RoleItem[];
  tasks: TaskItem[];
  onDrillDown: (filters: {
    status?: string;
    priority?: string;
    roleId?: string;
    overdue?: boolean;
  }) => void;
}

function percentage(value: number, total: number): number {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

export function DashboardInsights({ roles, tasks, onDrillDown }: DashboardInsightsProps) {
  const totalTasks = tasks.length;
  const doneCount = tasks.filter((task) => task.status === 'Done').length;
  const inProgressCount = tasks.filter((task) => task.status === 'In Progress').length;
  const notStartedCount = tasks.filter((task) => task.status === 'Not Started').length;
  const overdueCount = tasks.filter(isOverdue).length;
  const completionRate = percentage(doneCount, totalTasks);

  const statusSegments = [
    { label: 'Done', value: doneCount, color: '#2f855a' },
    { label: 'In Progress', value: inProgressCount, color: '#0d7a6f' },
    { label: 'Not Started', value: notStartedCount, color: '#d85e31' },
  ];

  const prioritySegments = [
    {
      label: 'High',
      value: tasks.filter((task) => task.priority === 'High').length,
      color: '#d85e31',
    },
    {
      label: 'Medium',
      value: tasks.filter((task) => task.priority === 'Medium').length,
      color: '#0d7a6f',
    },
    {
      label: 'Low',
      value: tasks.filter((task) => task.priority === 'Low').length,
      color: '#2f855a',
    },
  ];

  const roleProgress = roles
    .map((role) => {
      const roleTasks = tasks.filter((task) => task.roleId === role.id);
      const roleDone = roleTasks.filter((task) => task.status === 'Done').length;
      const roleOverdue = roleTasks.filter(isOverdue).length;

      return {
        role,
        total: roleTasks.length,
        done: roleDone,
        overdue: roleOverdue,
        completion: percentage(roleDone, roleTasks.length),
      };
    })
    .filter((item) => item.total > 0)
    .sort((left, right) => right.total - left.total);

  const healthCards = [
    {
      label: 'Completion',
      value: `${completionRate}%`,
      meta: `${doneCount}/${totalTasks || 0} tasks done`,
    },
    {
      label: 'In Progress Ratio',
      value: `${percentage(inProgressCount, totalTasks)}%`,
      meta: `${inProgressCount} tasks in flight`,
    },
    {
      label: 'Overdue Ratio',
      value: `${percentage(overdueCount, totalTasks)}%`,
      meta: `${overdueCount} overdue tasks`,
    },
  ];

  return (
    <section className="analytics-grid">
      <article className="panel chart-card">
        <div className="split-header">
          <div>
            <span className="eyebrow">Execution Health</span>
            <h3>Close pulse</h3>
          </div>
        </div>
        <div className="chart-health">
          <div
            className="chart-ring"
            style={
              {
                background: `conic-gradient(#0d7a6f 0 ${completionRate}%, rgba(13, 122, 111, 0.12) ${completionRate}% 100%)`,
              } as CSSProperties
            }
          >
            <div className="chart-ring-center">
              <strong>{completionRate}%</strong>
              <span>Done</span>
            </div>
          </div>
          <div className="chart-health-metrics">
            {healthCards.map((card) => (
              <button
                key={card.label}
                type="button"
                className="mini-stat chart-action-button"
                onClick={() =>
                  onDrillDown(
                    card.label === 'Overdue Ratio'
                      ? { overdue: true }
                      : card.label === 'In Progress Ratio'
                        ? { status: 'In Progress' }
                        : { status: 'Done' },
                  )
                }
              >
                <div>
                  <span>{card.label}</span>
                  <p>{card.meta}</p>
                </div>
                <strong>{card.value}</strong>
              </button>
            ))}
          </div>
        </div>
      </article>

      <article className="panel chart-card">
        <span className="eyebrow">Status Mix</span>
        <h3>Not started, in progress, done</h3>
        <div className="segmented-bar">
          {statusSegments.map((segment) => (
            <div
              key={segment.label}
              className="segmented-bar-piece"
              style={{
                width: `${Math.max(percentage(segment.value, totalTasks), segment.value > 0 ? 8 : 0)}%`,
                background: segment.color,
              }}
            />
          ))}
        </div>
        <div className="segment-legend">
          {statusSegments.map((segment) => (
            <button
              key={segment.label}
              type="button"
              className="segment-legend-row chart-action-button"
              onClick={() => onDrillDown({ status: segment.label })}
            >
              <span className="segment-swatch" style={{ background: segment.color }} />
              <strong>{segment.label}</strong>
              <span>{segment.value}</span>
              <span>{percentage(segment.value, totalTasks)}%</span>
            </button>
          ))}
        </div>
      </article>

      <article className="panel chart-card">
        <span className="eyebrow">Priority Mix</span>
        <h3>High, medium, low load</h3>
        <div className="segmented-bar">
          {prioritySegments.map((segment) => (
            <div
              key={segment.label}
              className="segmented-bar-piece"
              style={{
                width: `${Math.max(percentage(segment.value, totalTasks), segment.value > 0 ? 8 : 0)}%`,
                background: segment.color,
              }}
            />
          ))}
        </div>
        <div className="segment-legend">
          {prioritySegments.map((segment) => (
            <button
              key={segment.label}
              type="button"
              className="segment-legend-row chart-action-button"
              onClick={() => onDrillDown({ priority: segment.label })}
            >
              <span className="segment-swatch" style={{ background: segment.color }} />
              <strong>{segment.label}</strong>
              <span>{segment.value}</span>
              <span>{percentage(segment.value, totalTasks)}%</span>
            </button>
          ))}
        </div>
      </article>

      <article className="panel chart-card">
        <span className="eyebrow">Progress By Team</span>
        <h3>Role ownership and completion</h3>
        <div className="role-progress-list">
          {roleProgress.map((item) => (
            <button
              key={item.role.id}
              type="button"
              className="role-progress-row chart-action-button"
              onClick={() => onDrillDown({ roleId: item.role.id })}
            >
              <div className="role-progress-head">
                <div className="role-progress-title">
                  <span className="role-swatch" style={{ background: item.role.color }} />
                  <strong>{getRoleName(roles, item.role.id)}</strong>
                </div>
                <span>
                  {item.done}/{item.total} done
                </span>
              </div>
              <div className="role-progress-track">
                <div
                  className="role-progress-fill"
                  style={{
                    width: `${item.completion}%`,
                    background: item.role.color,
                  }}
                />
              </div>
              <div className="role-progress-meta">
                <span>{item.completion}% complete</span>
                <span>{item.overdue} overdue</span>
              </div>
            </button>
          ))}
        </div>
      </article>
    </section>
  );
}

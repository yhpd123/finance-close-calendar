import { ChangeEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardInsights } from '../components/dashboard/DashboardInsights';
import { CloseTimeline } from '../components/close/CloseTimeline';
import { EmptyState } from '../components/common/EmptyState';
import { StatCard } from '../components/common/StatCard';
import { useAppData } from '../context/AppDataContext';
import {
  countTodayTasks,
  downloadBackupFile,
  formatDateKey,
  formatLongDate,
  formatShortDate,
  getCloseInfoByDate,
  getFiscalInfoByDate,
  isOverdue,
  parseDateKey,
  readBackupFile,
  sortTasks,
} from '../utils';

export function DashboardPage() {
  const navigate = useNavigate();
  const { fiscalSettings, closeSettings, roles, tasks, exportBackup, importBackup } = useAppData();
  const backupInputRef = useRef<HTMLInputElement | null>(null);
  const [dataMessage, setDataMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const today = new Date();
  const todayKey = formatDateKey(today);
  const todayDate = new Date(`${todayKey}T12:00:00`);
  const fiscalInfo = getFiscalInfoByDate(today, fiscalSettings);
  const closeInfo = getCloseInfoByDate(today, fiscalSettings, closeSettings);
  const overdueCount = tasks.filter(isOverdue).length;
  const todayTaskCount = countTodayTasks(tasks);
  const upcomingTasks = sortTasks(
    tasks.filter((task) => task.status !== 'Done' && parseDateKey(task.dueDate) >= todayDate),
  ).slice(0, 5);

  const handleBackupDownload = () => {
    const backup = exportBackup();
    downloadBackupFile(
      `finance-close-calendar-backup-${todayKey}.json`,
      backup,
    );
    setDataMessage({
      tone: 'success',
      text: `Backup downloaded with ${backup.tasks.length} tasks and ${backup.roles.length} roles.`,
    });
  };

  const handleBackupImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const payload = await readBackupFile(file);
      const result = importBackup(payload);
      setDataMessage({
        tone: 'success',
        text: `Backup restored with ${result.taskCount} tasks and ${result.roleCount} roles.`,
      });
    } catch (error) {
      setDataMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Unable to restore backup.',
      });
    } finally {
      event.target.value = '';
    }
  };

  const goToTasks = (filters: {
    status?: string;
    priority?: string;
    roleId?: string;
    overdue?: boolean;
    focusDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters.status) {
      params.set('status', filters.status);
    }
    if (filters.priority) {
      params.set('priority', filters.priority);
    }
    if (filters.roleId) {
      params.set('roleId', filters.roleId);
    }
    if (filters.overdue) {
      params.set('overdue', '1');
    }
    if (filters.focusDate) {
      params.set('focusDate', filters.focusDate);
    }

    navigate({
      pathname: '/tasks',
      search: params.toString() ? `?${params.toString()}` : '',
    });
  };

  return (
    <div className="page-stack">
      <section className="hero-grid">
        <article className="hero-card">
          <span className="eyebrow">Today Card</span>
          <h2>{formatLongDate(today)}</h2>
          <p>
            {closeInfo.isCloseDay
              ? `Closing day (${closeInfo.closeOffsetLabel}) is live now.`
              : `Next close window tracks ${closeInfo.cycleLabel}.`}
          </p>
          <div className="hero-tags">
            <span className="badge badge-accent">{fiscalInfo.fiscalYearLabel}</span>
            <span className="badge badge-neutral">{fiscalInfo.periodType.toUpperCase()} periods</span>
            <span className="badge badge-neutral">{roles.length} teams</span>
            <span className="badge badge-neutral">Local browser data</span>
          </div>
        </article>

        <article className="panel action-panel">
          <div className="split-header">
            <div>
              <span className="eyebrow">Quick Actions</span>
              <h3>Keep the close moving</h3>
            </div>
          </div>
          <div className="quick-actions">
            <button className="button" type="button" onClick={() => navigate('/tasks')}>
              Open Tasks
            </button>
            <button className="button button-secondary" type="button" onClick={() => navigate('/calendar')}>
              Open Calendar
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => navigate('/fiscal-settings')}
            >
              Tune Fiscal Rules
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => navigate('/close-settings')}
            >
              Adjust Close Rules
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => navigate('/role-settings')}
            >
              Manage Roles
            </button>
          </div>

          <div className="action-section">
            <div>
              <span className="eyebrow">Local Data</span>
              <h3>Backup and restore</h3>
              <p className="section-copy">
                Save a JSON backup before sharing devices or moving to another laptop.
              </p>
            </div>
            <div className="quick-actions">
              <button className="button button-secondary" type="button" onClick={handleBackupDownload}>
                Download Backup
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => backupInputRef.current?.click()}
              >
                Restore Backup
              </button>
              <input
                ref={backupInputRef}
                className="hidden-input"
                type="file"
                accept=".json"
                onChange={(event) => void handleBackupImport(event)}
              />
            </div>
            {dataMessage ? (
              <div
                className={`status-banner${dataMessage.tone === 'error' ? ' status-banner-error' : ''}`}
              >
                {dataMessage.text}
              </div>
            ) : null}
          </div>
        </article>
      </section>

      <section className="stats-grid">
        <StatCard label="Fiscal Year" value={fiscalInfo.fiscalYearLabel} />
        <StatCard label="Current Period" value={fiscalInfo.periodLabel} />
        <StatCard label="Current Quarter" value={`Q${fiscalInfo.fiscalQuarter}`} />
        <StatCard label="Fiscal Week" value={`W${fiscalInfo.fiscalWeek}`} />
        <StatCard
          label="Current Close Day"
          value={
            closeInfo.isCloseDay
              ? closeInfo.closeOffsetLabel || 'C'
              : 'Outside window'
          }
          meta={`${closeInfo.cycleLabel} • C on ${formatShortDate(closeInfo.closingDate)}`}
          tone={closeInfo.isCloseDay ? 'accent' : 'default'}
        />
        <StatCard
          label="Today Task Count"
          value={`${todayTaskCount}`}
          onClick={() => goToTasks({ focusDate: todayKey })}
        />
        <StatCard
          label="Overdue Count"
          value={`${overdueCount}`}
          meta={overdueCount > 0 ? 'Needs attention' : 'All caught up'}
          tone={overdueCount > 0 ? 'warning' : 'default'}
          onClick={() => goToTasks({ overdue: true })}
        />
      </section>

      {closeSettings.showTimeline ? (
        <CloseTimeline closeInfo={closeInfo} activeDate={closeInfo.isCloseDay ? todayKey : undefined} />
      ) : null}

      <DashboardInsights roles={roles} tasks={tasks} onDrillDown={goToTasks} />

      <section className="panel">
        <div className="split-header">
          <div>
            <span className="eyebrow">Upcoming Tasks</span>
            <h3>Next finance activities</h3>
          </div>
        </div>

        {upcomingTasks.length > 0 ? (
          <div className="task-list">
            {upcomingTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                className="task-row task-row-button"
                onClick={() =>
                  navigate({
                    pathname: '/tasks',
                    search: `?taskId=${task.id}`,
                  })
                }
              >
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.description}</p>
                </div>
                <div className="task-meta">
                  <span className="task-date">Due {formatShortDate(task.dueDate)}</span>
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
            title="No upcoming tasks"
            message="Use the Tasks page to create checklist items, owners, and due dates for the next close."
            action={
              <button className="button" type="button" onClick={() => navigate('/tasks')}>
                Create your first task
              </button>
            }
          />
        )}
      </section>
    </div>
  );
}

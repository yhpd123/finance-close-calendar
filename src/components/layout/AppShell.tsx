import { ReactNode, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { formatLongDate, formatTimeLabel } from '../../utils';

const workspaceNavigation = [
  { to: '/', label: 'Dashboard' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/tasks', label: 'Tasks' },
];

const settingsNavigation = [
  { to: '/fiscal-settings', label: 'Fiscal Settings' },
  { to: '/close-settings', label: 'Close Settings' },
  { to: '/role-settings', label: 'Role Settings' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="workspace-title">
          <h1>Finance Close Calendar</h1>
          <p>Finance close workspace for daily execution and local planning.</p>
        </div>
        <div className="topbar-actions">
          <div className="topbar-date-time">
            <div className="topbar-date">{formatLongDate(now)}</div>
            <div className="topbar-time">{formatTimeLabel(now)}</div>
          </div>
          {canInstall ? (
            <button className="button button-secondary" type="button" onClick={() => void promptInstall()}>
              Install App
            </button>
          ) : null}
        </div>
      </header>

      <nav className="nav-bar" aria-label="Primary">
        <div className="nav-group" aria-label="Workspace modules">
          {workspaceNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="nav-separator" aria-hidden="true" />
        <div className="nav-group nav-group-settings" aria-label="Admin modules">
          {settingsNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="page-shell">{children}</main>
      <footer className="app-footer">
        <span>© 2026 Finance Close Calendar Prototype</span>
        <span>Author: James</span>
        <a
          href="https://github.com/yhpd123/finance-close-calendar/issues"
          target="_blank"
          rel="noreferrer"
        >
          GitHub Issues
        </a>
        <a
          href="https://github.com/yhpd123/finance-close-calendar/discussions"
          target="_blank"
          rel="noreferrer"
        >
          GitHub Discussions
        </a>
      </footer>
    </div>
  );
}

import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { CalendarPage } from './pages/CalendarPage';
import { CloseSettingsPage } from './pages/CloseSettingsPage';
import { DashboardPage } from './pages/DashboardPage';
import { FiscalSettingsPage } from './pages/FiscalSettingsPage';
import { RoleSettingsPage } from './pages/RoleSettingsPage';
import { TasksPage } from './pages/TasksPage';

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/fiscal-settings" element={<FiscalSettingsPage />} />
        <Route path="/close-settings" element={<CloseSettingsPage />} />
        <Route path="/role-settings" element={<RoleSettingsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

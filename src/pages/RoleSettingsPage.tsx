import { FormEvent, useState } from 'react';
import { ExcelUploadCard } from '../components/common/ExcelUploadCard';
import { useAppData } from '../context/AppDataContext';
import { RoleDraft } from '../types';
import { downloadSpreadsheetTemplate, parseRoleImportRows, readSpreadsheetRows } from '../utils';

const initialDraft: RoleDraft = {
  name: '',
  description: '',
  color: '#0d7a6f',
};

export function RoleSettingsPage() {
  const { roles, addRole, deleteRole, restoreDemoRoles, saveRoles } = useAppData();
  const [draft, setDraft] = useState<RoleDraft>(initialDraft);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      return;
    }

    addRole(draft);
    setDraft(initialDraft);
  };

  return (
    <div className="page-grid">
      <section className="panel">
        <span className="eyebrow">Role Settings</span>
        <h2>Manage finance ownership roles</h2>
        <p className="section-copy">
          Create reusable ownership teams such as Revenue, Inventory, or Intercompany. Tasks will use this role list as the accountable owner.
        </p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Role Name</span>
            <input
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              placeholder="Ex: Revenue"
              required
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Short note for what this team owns during close."
            />
          </label>

          <label className="field">
            <span>Color</span>
            <input
              type="color"
              value={draft.color}
              onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value }))}
            />
          </label>

          <div className="action-cluster">
            <button className="button" type="submit">
              Add Role
            </button>
            <button className="button button-secondary" type="button" onClick={restoreDemoRoles}>
              Reset Demo Roles
            </button>
          </div>
        </form>
      </section>

      <div className="page-stack">
        <ExcelUploadCard
          title="Upload roles from Excel"
          description="Import a role list from the first sheet. Existing roles with the same name will be updated."
          columns={['name', 'description', 'color']}
          onDownloadTemplate={() =>
            downloadSpreadsheetTemplate('role-upload-template.xlsx', ['name', 'description', 'color'], [
              {
                name: 'Revenue',
                description: 'Revenue recognition and close support',
                color: '#d85e31',
              },
              {
                name: 'Intercompany',
                description: 'Eliminations and cross-entity settlements',
                color: '#0d7a6f',
              },
            ])
          }
          onImport={async (file) => {
            const rows = await readSpreadsheetRows(file);
            const result = parseRoleImportRows(rows, roles);
            saveRoles(result.roles);
            return `Imported ${result.imported} roles, updated ${result.updated}, skipped ${result.skipped}.`;
          }}
        />

        <section className="panel">
          <div className="split-header">
            <div>
              <span className="eyebrow">Current Roles</span>
              <h3>{roles.length} active ownership groups</h3>
            </div>
          </div>

          <div className="role-list">
            {roles.map((role) => (
              <article key={role.id} className="role-card">
                <div className="role-card-head">
                  <div className="role-progress-title">
                    <span className="role-swatch" style={{ background: role.color }} />
                    <strong>{role.name}</strong>
                  </div>
                  <button
                    className="button button-secondary"
                    type="button"
                    disabled={roles.length <= 1}
                    onClick={() => deleteRole(role.id)}
                  >
                    Delete
                  </button>
                </div>
                <p>{role.description || 'No description yet.'}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

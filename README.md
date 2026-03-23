# Finance Close Calendar

Finance Close Calendar is a production-style MVP prototype for finance teams that need a lightweight close management workspace without standing up a backend.

It combines fiscal calendar setup, close window planning, task tracking, role ownership, calendar visualization, Excel import, and offline-first local usage in a single web app and installable PWA.

## Who This Is For

- Finance controllership teams running monthly, quarterly, or year-end close
- Accounting operations teams that need a lightweight local task register
- Product or design teams prototyping close orchestration workflows
- Internal tool builders who want a frontend-only finance close starter

## What Problems It Solves

- Define fiscal year rules and preview fiscal periods
- Configure close day windows such as `C - 5` to `C + 5`
- Organize close tasks by role, priority, status, and due date
- Track overdue items and in-progress execution from a dashboard
- Drill down from dashboard insights into filtered task views
- Import tasks and role masters from Excel templates
- Use the app offline with local browser storage and PWA install support

## Core Modules

### Workspace Modules

- **Dashboard**
  - Today card
  - Fiscal period and close context
  - Upcoming task visibility
  - Status and priority insights
  - Team or role-based progress views
  - Drill-down into filtered task lists

- **Calendar**
  - Monthly calendar view
  - Current day highlight
  - Close day highlight
  - Task badges by day
  - Daily task detail lookup

- **Tasks**
  - Compact task register optimized for list-first review
  - Add, edit, and delete tasks
  - Filter by keyword, role, status, priority, and overdue state
  - Excel import with template download

### Admin / Setup Modules

- **Fiscal Settings**
  - Fiscal start date
  - Period type: `natural`, `445`, `454`, `544`
  - Live fiscal calendar preview

- **Close Settings**
  - Configurable close offsets such as `C - n` to `C + n`
  - Close timeline visibility toggle
  - Close window mapping preview

- **Role Settings**
  - Maintain role master such as Revenue, Inventory, Intercompany
  - Excel import with template download
  - Use roles as task ownership selection

## Product Characteristics

- Frontend-only architecture
- No backend
- No cloud dependency
- No login required
- Browser local storage persistence
- Demo data is seeded on first launch
- PWA install support
- Offline open support through service worker

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- CSS
- `xlsx` for spreadsheet import and template generation

## Getting Started

### Requirements

- Node.js 20+ recommended
- npm

### Install

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How To Use

### 1. Set up fiscal rules

Go to **Fiscal Settings** and choose:

- fiscal start date
- fiscal period model

The preview panel updates immediately so users can validate the fiscal calendar outcome before saving.

### 2. Configure the close window

Go to **Close Settings** and define:

- close start rule
- close range from `C - n` to `C + n`
- whether the close timeline should be visible on supporting pages

### 3. Maintain role ownership

Go to **Role Settings** and create roles manually or import from Excel.

Example roles:

- Revenue
- Inventory
- Intercompany
- Accounts Payable
- Fixed Assets

### 4. Add or import tasks

Go to **Tasks** and either:

- add tasks one by one
- download the import template and upload an Excel file

Supported task fields include:

- title
- description
- scheduled date
- due date
- status
- priority
- role

### 5. Monitor execution

Use **Dashboard** to:

- review today’s execution context
- see progress by role
- analyze overdue and in-progress ratios
- click into specific task slices for drill-down review

## Excel Import

Both **Tasks** and **Role Settings** include template download before import so users can see the expected format first.

Typical task import columns:

- `title`
- `description`
- `scheduledDate`
- `dueDate`
- `status`
- `priority`
- `role`

Typical role import columns:

- `name`
- `description`
- `color`

## PWA and Offline Usage

This project includes:

- web app manifest
- service worker
- install prompt support
- offline open support

After running the app in a supported browser, users can install it and continue using locally stored data even when disconnected.

## Project Structure

```text
src/
  components/      shared UI building blocks
  context/         local app data state and persistence
  data/            demo seed data
  hooks/           install prompt and reusable hooks
  pages/           Dashboard, Calendar, Tasks, Fiscal Settings, Close Settings, Role Settings
  pwa/             service worker registration
  styles/          theme and application styles
  types/           core domain types
  utils/           fiscal, close, calendar, storage, Excel, import helpers
public/
  manifest.webmanifest
  sw.js
  offline.html
```

## Target User Journey

1. Open the app and review the seeded demo setup
2. Adjust fiscal settings and close window rules
3. Create or import finance roles
4. Create or import task registers
5. Use Dashboard and Calendar to monitor execution
6. Drill into filtered task views for issue analysis

## Future Enterprise Expansion

This MVP is intentionally local-first and backend-free. To evolve it into an enterprise product, the next steps would typically be:

- multi-entity and multi-ledger support
- approval workflow and sign-off checkpoints
- ERP and data warehouse integrations
- SSO and role-based access control
- audit log and version history
- notifications and SLA tracking
- shared collaboration and comments
- analytics for bottlenecks and close performance

## License

This repository is currently provided as a prototype / internal demonstration project. Add your preferred license before broader distribution.

# Changelog

All notable changes to this project will be documented in this file.

## [0.1.2] - 2026-03-23

### Added

- Dashboard backup and restore actions for local JSON export and import
- Portable `START-HERE.html` guide for non-technical users
- Portable launchers for macOS and Windows with clearer onboarding instructions

### Changed

- Portable mode now hides the PWA install button to reduce confusion
- Portable distribution guidance now recommends launcher scripts instead of opening files directly

## [0.1.1] - 2026-03-23

### Added

- Portable ZIP packaging for non-technical users who want to unzip and open the app directly
- File-mode compatibility using hash routing for local portable usage
- README guidance covering demo plus PWA, portable ZIP, and npm usage paths

### Changed

- Service worker registration now skips file protocol mode to avoid portable runtime issues

## [0.1.0] - 2026-03-23

### Added

- Initial production-style MVP for finance close planning and execution
- Dashboard with today context, close context, role progress, and drill-down analysis
- Fiscal Settings with support for `natural`, `445`, `454`, and `544` period models
- Close Settings with configurable close-day offsets such as `C - n` to `C + n`
- Calendar month view with task badges and close-day highlighting
- Tasks workspace with compact list-first design and multidimensional filters
- Role Settings with role master maintenance for finance ownership
- Task and role Excel import with template download
- PWA manifest, service worker, offline open support, and install prompt
- Local storage persistence with demo data seeding and schema migration support

### Changed

- Refined navigation to separate workspace modules from admin settings
- Improved README to better document product intent, target users, setup, and roadmap

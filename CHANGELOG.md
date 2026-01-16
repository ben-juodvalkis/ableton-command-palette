# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Public launch preparation (README, CONTRIBUTING, etc.)

## [0.2.0] - 2026-01-15

### Added
- Floating palette window with proper keyboard capture
- textedit integration for real-time character input
- 50 new commands (Device, Clip, Scene categories)
- Context-aware command filtering

### Changed
- Migrated from jsui to v8ui for ES6+ support
- Refactored commands into separate CommonJS modules
- Improved fuzzy matching algorithm with scoring bonuses

### Technical
- Resolved keyboard passthrough to Live using textedit focus
- Implemented window positioning via screensize object
- Added ADRs for architectural decisions

## [0.1.0] - 2026-01-12

### Added
- Initial prototype with 25 commands
- Fuzzy search matching
- v8 JavaScript runtime support
- Transport commands (Play, Stop, Record, etc.)
- Track commands (Mute, Solo, Arm, Create, Delete)
- Navigation commands (Next/Previous Track, Device, Scene)

### Technical
- CommonJS module architecture (Max v8 requirement)
- v8ui for palette rendering
- Live Object Model (LOM) integration

## [0.0.1] - 2026-01-10

### Added
- Proof of concept prototype
- Basic command execution
- 10 hardcoded commands for validation

---

## Version History Summary

| Version | Date | Commands | Highlights |
|---------|------|----------|------------|
| 0.2.0 | 2026-01-15 | 74 | Floating window, keyboard capture, context filtering |
| 0.1.0 | 2026-01-12 | 25 | Core architecture, fuzzy search, v8 modules |
| 0.0.1 | 2026-01-10 | 10 | Proof of concept |

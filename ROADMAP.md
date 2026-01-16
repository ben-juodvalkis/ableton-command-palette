# Roadmap

This document outlines the development plan for Ableton Command Palette.

## Vision

Make Ableton Live as keyboard-accessible as VS Code. Every action you can do with a mouse should be doable with a keyboard command.

## Current Status

**Phase 2 Complete** - 74 commands implemented, floating window with keyboard capture.

---

## Phase 3: Enhanced Commands (In Progress)

Expand the command library with smarter features.

### Parameterized Commands
Commands that accept input values:
- [ ] Set Tempo (e.g., "tempo 128" sets BPM to 128)
- [ ] Set Volume (e.g., "vol -6" sets to -6dB)
- [ ] Set Pan
- [ ] Send levels

### Track Name Matching
Target tracks by name instead of selection:
- [ ] "mute drums" - Mute track named "Drums"
- [ ] "solo bass" - Solo track named "Bass"
- [ ] "go to synth" - Navigate to track named "Synth"

### Recent Commands
- [ ] Track recently used commands
- [ ] Boost recent commands in search results
- [ ] "Repeat last command" shortcut

### Additional Commands
Expand to 150+ total commands:
- [ ] Mixing commands (20 planned)
- [ ] View commands (15 planned)
- [ ] Creation commands (20 planned)
- [ ] Bulk operations (20 planned)

---

## Phase 4: Polish & Release

### Performance
- [ ] Cache LOM queries
- [ ] Debounce search input
- [ ] Optimize for large command sets

### Error Handling
- [ ] User-friendly error messages
- [ ] Graceful failures for unavailable commands
- [ ] Console logging for debugging

### Documentation
- [ ] Video walkthrough
- [ ] Command cheat sheet
- [ ] Developer guide expansion

### v1.0 Release
- [ ] Final testing across Live versions
- [ ] Release packaging
- [ ] Ableton forum announcement

---

## Future Ideas (Post v1.0)

These are ideas for future exploration, not committed plans.

### Macro/Sequence Commands
- Chain multiple commands together
- User-defined command sequences
- "Setup drums" runs: Create MIDI Track → Add Drum Rack → Arm

### Custom Commands
- User-defined command shortcuts
- Command aliases
- Per-project command sets

### Live Browser Integration
- Search and load samples
- Search and load presets
- Search and load plugins

### Keyboard Shortcut Mode
- Direct shortcuts without opening palette
- e.g., Ctrl+M = Mute selected track
- Customizable bindings

### Multi-Command Palette
- Select multiple commands at once
- Apply to multiple tracks
- Batch operations

---

## How to Contribute

Check the [CONTRIBUTING.md](CONTRIBUTING.md) guide for:
- Adding new commands
- Reporting bugs
- Requesting features

See [COMMANDS.md](COMMANDS.md) for commands that need implementation.

---

## Command Coverage

| Category | Current | Planned | Coverage |
|----------|---------|---------|----------|
| Transport | 8 | 13 | 62% |
| Track | 10 | 20 | 50% |
| Navigation | 7 | 12 | 58% |
| Device | 24 | 35 | 69% |
| Clip | 15 | 25 | 60% |
| Scene | 10 | 15 | 67% |
| Mixing | 0 | 20 | 0% |
| View | 0 | 15 | 0% |
| Creation | 0 | 20 | 0% |
| Bulk Ops | 0 | 20 | 0% |
| **Total** | **74** | **195** | **38%** |

---

*Last updated: January 2026*

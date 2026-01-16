# Ableton Command Palette

A VS Code-inspired command palette for Ableton Live. Access any Live command instantly with fuzzy search.

![Status: Alpha](https://img.shields.io/badge/status-alpha-orange)
![Ableton Live 12+](https://img.shields.io/badge/Ableton%20Live-12%2B-blue)
![License: MIT](https://img.shields.io/badge/license-MIT-green)

## What is this?

A Max for Live device that gives you keyboard-driven access to Ableton Live's functionality. Press a key, type what you want to do, and execute - no mouse needed.

**74 commands implemented** out of 195 planned.

## Features

- **Fuzzy search** - Type "comp" to find "Add Compressor", "msel" to find "Mute Selected Track"
- **Keyboard-first** - Navigate results with arrow keys, execute with Enter
- **Context-aware** - Commands filtered based on what's selected (track, device, clip)
- **MIDI-mappable** - Assign any MIDI controller to open the palette
- **Fast** - Instant results, no loading, no lag

## Current Commands

| Category | Count | Examples |
|----------|-------|----------|
| Transport | 8 | Play, Stop, Record, Toggle Loop, Tap Tempo |
| Track | 10 | Mute/Solo/Arm Track, Create/Delete/Duplicate Track |
| Navigation | 7 | Select Next/Previous Track/Device/Scene |
| Device | 24 | Add Compressor/EQ/Reverb, Bypass/Delete Device |
| Clip | 15 | Fire/Stop Clip, Quantize, Loop, Duplicate |
| Scene | 10 | Fire Scene, Stop All Clips, Capture Scene |

See [COMMANDS.md](COMMANDS.md) for the complete list.

## Requirements

- Ableton Live 12 or later (uses Live 12 APIs)
- Max for Live (included with Live Suite, or available as add-on)

## Installation

1. Download the latest release from the [Releases](https://github.com/ben-juodvalkis/ableton-command-palette/releases) page
2. Drag `CommandPalette.amxd` onto any track in Live
3. Map the toggle to a MIDI controller or keyboard shortcut

## Usage

1. **Open the palette** - Click the toggle or use your mapped shortcut
2. **Type to search** - Start typing the command you want
3. **Navigate** - Use arrow keys to select from results
4. **Execute** - Press Enter to run the command
5. **Cancel** - Press Escape to close without executing

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Arrow Up/Down` | Navigate results |
| `Enter` | Execute selected command |
| `Escape` | Close palette |
| `Backspace` | Delete last character |

## Project Status

This project is in active development. The core functionality works, but expect rough edges.

**What works:**
- 74 commands across 6 categories
- Fuzzy search with scoring
- Context-aware filtering
- Floating palette window

**In progress:**
- Parameterized commands (e.g., "set tempo 128")
- Track name matching (e.g., "mute drums")
- Recent command history

See [ROADMAP.md](ROADMAP.md) for the full development plan.

## Contributing

Contributions are welcome! Whether it's bug reports, feature requests, or code contributions.

- Read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
- Check the [ROADMAP.md](ROADMAP.md) for planned features
- See [open issues](https://github.com/ben-juodvalkis/ableton-command-palette/issues) for ways to help

## Documentation

- [COMMANDS.md](COMMANDS.md) - Complete command reference
- [ROADMAP.md](ROADMAP.md) - Development roadmap
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- [documentation/IMPLEMENTATION_PLAN.md](documentation/IMPLEMENTATION_PLAN.md) - Technical implementation details
- [documentation/adr/](documentation/adr/) - Architecture Decision Records

## Tech Stack

- **Max for Live** - Audio effect device hosting
- **Max v8 object** - Modern JavaScript runtime (CommonJS)
- **v8ui** - Hardware-accelerated UI rendering
- **Live Object Model (LOM)** - Ableton's JavaScript API

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Inspired by VS Code's Command Palette
- Built with the [Max for Live](https://www.ableton.com/en/live/max-for-live/) platform
- Uses Ableton's [Live Object Model](https://docs.cycling74.com/max8/vignettes/live_object_model)

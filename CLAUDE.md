# CLAUDE.md

## Project Overview

Ableton Live Command Palette - A VS Code-inspired command palette for Ableton Live built as a Max for Live (M4L) device. Provides keyboard-driven access to Live functionality via fuzzy search.

**Stack:** Max for Live, JavaScript (Max's js object), jsui, Live Object Model (LOM)
**Target:** Ableton Live 12+
**License:** MIT

## Project Structure

```
ableton-command-palette/
├── COMMANDS.md              # Central command reference (keep updated!)
├── documentation/
│   ├── PROTOTYPE_SPEC.md    # 6-hour prototype spec
│   ├── IMPLEMENTATION_PLAN.md # Full 4-phase roadmap
│   └── adr/                 # Architecture Decision Records
├── prototype/               # Completed proof-of-concept (10 commands)
│   ├── CommandPaletteProto.amxd
│   └── proto.js
└── src/                     # Full implementation (v8 architecture)
    ├── main.js              # v8 entry point (CommonJS)
    ├── core/                # CommandRegistry, FuzzyMatcher, LOMInterface
    ├── ui/palette.js        # v8ui rendering
    └── commands/*.json      # Command definitions
```

## Maintenance Notes

- **COMMANDS.md** - When implementing new commands, update this file to mark them as complete `[x]`

## Key Technologies

- **Max for Live:** Audio effect device hosting the palette
- **js object:** Max's JavaScript runtime for command logic
- **jsui:** Custom UI rendering for the palette window
- **LiveAPI:** JavaScript interface to Live Object Model (LOM)

## Common LOM Patterns

```javascript
// Access Live Set
var api = new LiveAPI("live_set");
api.call("start_playing");

// Selected track operations
var track = new LiveAPI("live_set view selected_track");
track.set("mute", 1);

// Insert device (Live 12+)
track.call("insert_device", "Compressor");
```

## Development Notes

- Use `autowatch = 1;` in JS files for live reloading during development
- Test commands via Max console: `js functionName`
- The prototype focuses on 10 hardcoded commands before building the full extensible system

# CLAUDE.md

This file provides context for AI assistants (like Claude) working on this codebase.

## Project Overview

Ableton Live Command Palette - A VS Code-inspired command palette for Ableton Live built as a Max for Live (M4L) device. Provides keyboard-driven access to Live functionality via fuzzy search.

**Stack:** Max for Live, JavaScript (Max v8 object), v8ui, Live Object Model (LOM)
**Target:** Ableton Live 12+ only
**License:** MIT

## Current Status

- **74 commands implemented** (Transport, Track, Navigation, Device, Clip, Scene)
- **Floating window UI** with proper keyboard capture
- **Fuzzy search** with scoring (consecutive chars, word boundary, position bonuses)
- **Context-aware filtering** based on selection state

## Project Structure

```
ableton-command-palette/
├── README.md                # User-facing documentation
├── COMMANDS.md              # Command reference (update when adding commands!)
├── ROADMAP.md               # Development plan
├── CONTRIBUTING.md          # Contribution guidelines
├── CHANGELOG.md             # Version history
├── documentation/
│   ├── IMPLEMENTATION_PLAN.md  # Technical implementation details
│   └── adr/                    # Architecture Decision Records
├── prototype/                  # Original proof-of-concept (reference only)
│   ├── CommandPaletteProto.amxd
│   └── proto.js
└── src/                        # Main implementation
    ├── CommandPalette.amxd     # Max patcher (the device)
    ├── main.js                 # Entry point, command execution
    ├── core/
    │   ├── CommandRegistry.js  # Command storage and retrieval
    │   ├── FuzzyMatcher.js     # Search algorithm
    │   └── LOMInterface.js     # Live API wrapper, command handlers
    ├── ui/
    │   ├── palette.js          # v8ui rendering
    │   └── window.js           # Window positioning
    └── commands/               # Command definitions (CommonJS modules)
        ├── transport.js
        ├── tracks.js
        ├── navigation.js
        ├── devices.js
        ├── clips.js
        └── scenes.js
```

## Maintenance Tasks

When making changes:

1. **Adding commands:** Update `COMMANDS.md` to mark as `[x]` implemented
2. **Breaking changes:** Update `CHANGELOG.md`
3. **Architecture decisions:** Add to `documentation/adr/`

## Key Technologies

- **Max v8 object:** Modern JavaScript runtime (CommonJS modules, NOT ES6 import/export)
- **v8ui:** Hardware-accelerated UI rendering (supports ES6+ syntax)
- **LiveAPI:** JavaScript interface to Live Object Model (LOM)
- **textedit:** Keyboard capture to prevent passthrough to Live

## Technical Constraints

### Max v8 Requirements
- **CommonJS only:** Use `require()` / `module.exports`, NOT `import` / `export`
- **Pre-declared globals:** Don't use `const`/`let` for `inlets`/`outlets` (assign directly)
- **File loading:** Can only `require()` .js files, not JSON

### Keyboard Handling
- textedit captures keyboard to prevent passthrough to Live
- Arrow keys, Enter, Escape handled via `key` object
- Character input via textedit middle outlet

## Common LOM Patterns

```javascript
// Access Live Set
var api = new LiveAPI("live_set");
api.call("start_playing");

// Selected track operations
var track = new LiveAPI("live_set view selected_track");
track.set("mute", 1);

// Insert device (Live 12+ API)
track.call("create_device", "Compressor");

// Get selected device
var device = new LiveAPI("live_set view selected_track view selected_device");
device.set("parameters 0 value", 0.5);
```

## Adding a New Command

1. Add command object to appropriate file in `src/commands/`:
   ```javascript
   {
       id: "category.actionName",
       title: "Human Readable Name",
       category: "Category",
       keywords: ["alias", "search", "terms"],
       description: "What this command does",
       action: "handlerName"
   }
   ```

2. Add handler in `src/core/LOMInterface.js`:
   ```javascript
   handlerName: function() {
       var api = new LiveAPI("...");
       api.call("...");
   }
   ```

3. Update `COMMANDS.md` to mark as implemented `[x]`

## Development Tips

- `autowatch = 1` enables live reloading of JS files
- `post("message\n")` logs to Max console for debugging
- Test commands in Live before committing
- Check `documentation/adr/` for architecture decisions and rationale

## Testing

No automated tests currently. Manual testing in Ableton Live 12 required.

Test checklist:
- [ ] Command appears in search results
- [ ] Fuzzy search matches command
- [ ] Execution produces expected result
- [ ] No errors in Max console
- [ ] Context filtering works (if applicable)

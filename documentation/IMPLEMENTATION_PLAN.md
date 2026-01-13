# Ableton Live Command Palette - Implementation Plan

## Project Overview

A VS Code-inspired command palette for Ableton Live built as a Max for Live device, providing keyboard-driven access to Live functionality via fuzzy search.

**Target:** Ableton Live 12+ only
**Runtime:** Max `v8` object (CommonJS modules)
**License:** MIT

---

## Decision Log

### 2026-01-13: CommonJS over ES6 Modules

**Problem:** ES6 `import`/`export` syntax caused errors in Max v8 object.
```
v8: SyntaxError: Cannot use import statement outside a module
```

**Investigation:** Searched Cycling '74 documentation and forums. Found that Max v8 supports CommonJS modules only (`require()`/`module.exports`), not ES6 module syntax.

**Decision:** Convert all modules from ES6 to CommonJS.
- `.mjs` files renamed to `.js`
- `import { X } from './X.mjs'` → `const { X } = require('./X.js')`
- `export class X` → `class X { } module.exports = { X }`

### 2026-01-13: v8ui over jsui

**Problem:** jsui threw syntax errors on ES6 code (`let`, `const`, template literals).
```
jsui: Javascript SyntaxError: missing ; before statement, line 50
jsui: source line: let displayState = {
```

**Investigation:** jsui uses the legacy `js` engine (ES5 only). The v8ui object uses the same V8 engine as v8, supporting ES6+.

**Decision:** Replace jsui with v8ui for palette rendering. This allows modern JavaScript in both main logic and UI.

### 2026-01-13: Native Keyboard Input over textedit

**Problem:** Original design used a separate `textedit` object for search input. This creates poor UX - user has to click into textedit, and it's visually disconnected from the palette.

**Options considered:**
1. Keep textedit, overlay/style it to look integrated
2. Build keyboard input directly into v8 (handle keypresses, build search string)
3. Hybrid approach for Phase 1

**Decision:** Option 2 - handle all keyboard input in v8. This gives VS Code-style UX where the palette captures all input when open. The v8ui already displays the search query, so only need to expand `keydown()` to handle printable characters and backspace.

### 2026-01-13: v8 globals assignment

**Problem:** Declaring `const inlets = 1` caused redeclaration error.
```
v8: SyntaxError: Identifier 'inlets' has already been declared
```

**Cause:** Max v8 pre-declares `inlets` and `outlets` as global variables.

**Decision:** Assign directly without `const`/`let`: `inlets = 1;`

---

## Architecture

```
User Input (MIDI-mapped toggle)
         │
         ▼
┌────────────────────┐
│   live.toggle      │ ← MIDI-mappable, works without device focus
└────────────────────┘
         │
         ▼
┌────────────────────┐
│  Palette UI (v8ui) │ ← Renders search + results (ES6)
└────────────────────┘
         │
         ▼
┌────────────────────┐
│  v8 Main Module    │ ← CommonJS modules
│  - CommandRegistry │
│  - FuzzyMatcher    │
│  - LOMInterface    │
└────────────────────┘
         │
         ▼
┌────────────────────┐
│  Live Object Model │ ← Ableton's API
└────────────────────┘
```

### Project Structure

```
ableton-command-palette/
├── src/
│   ├── CommandPalette.amxd      # Max patcher
│   ├── main.js                  # v8 entry point (CommonJS)
│   ├── ui/
│   │   └── palette.js           # v8ui rendering (ES6)
│   ├── core/
│   │   ├── CommandRegistry.js   # Command loading & management
│   │   ├── FuzzyMatcher.js      # Search algorithm
│   │   └── LOMInterface.js      # Live API wrapper
│   └── commands/                # (future: external JSON files)
│       ├── transport.json       # Transport commands
│       ├── tracks.json          # Track commands
│       ├── devices.json         # Device commands
│       ├── clips.json           # Clip commands
│       ├── scenes.json          # Scene commands
│       ├── navigation.json      # Navigation commands
│       └── view.json            # View commands
├── prototype/                   # Original prototype (reference)
├── documentation/
│   ├── IMPLEMENTATION_PLAN.md   # This file
│   └── PROTOTYPE_SPEC.md
└── README.md
```

---

## Phase 1: Foundation

### Goals
- Set up v8-based architecture with ES6 modules
- Build core infrastructure (registry, matcher, LOM interface)
- Implement 25 essential commands
- Create functional UI

### 1.1 Max Patcher Setup

Create `CommandPalette.amxd`:
- [x] Add `live.toggle` for MIDI-mappable palette trigger
- [x] Add `v8` object pointing to `main.js` (CommonJS modules)
- [x] Add `v8ui` for palette rendering (ES6 syntax supported)
- [x] Wire keyboard input via `key` object to v8
- [x] Native keyboard text input in v8 (no separate textedit)

**Architecture Notes (discovered during implementation):**
- Max v8 uses CommonJS `require()`/`module.exports`, NOT ES6 `import`/`export`
- jsui only supports ES5; use `v8ui` for ES6 syntax
- v8 pre-declares `inlets`/`outlets` - assign directly, don't use `const`

**Trigger Mechanism:**
```
live.toggle → triggers palette open/close
              MIDI-mappable by user in Live
              Works even when device doesn't have focus
```

### 1.1b Native Keyboard Input

Handle all text input directly in v8 (no textedit object):
- [x] Route `key` object to v8 for all keypresses
- [ ] Capture printable characters (a-z, 0-9, space, punctuation)
- [ ] Handle backspace to delete characters
- [ ] Build search string from keypresses
- [ ] v8ui already displays `searchQuery` - no changes needed there

### 1.2 Core Modules

**main.mjs** - Entry point
```javascript
// v8 entry point with ES6 modules
import { CommandRegistry } from './core/CommandRegistry.mjs';
import { FuzzyMatcher } from './core/FuzzyMatcher.mjs';
import { LOMInterface } from './core/LOMInterface.mjs';

// State
let paletteVisible = false;
let searchQuery = "";
let selectedIndex = 0;
let filteredCommands = [];

// Initialize
const registry = new CommandRegistry();
const matcher = new FuzzyMatcher();
const lom = new LOMInterface();

// Inlet handlers
function toggle() { ... }
function search(query) { ... }
function execute() { ... }
function navigate(direction) { ... }
```

**CommandRegistry.mjs** - Command management
```javascript
export class CommandRegistry {
  constructor() {
    this.commands = new Map();
  }

  loadFromJSON(category, json) { ... }
  register(command) { ... }
  getAll() { ... }
  getByCategory(category) { ... }
  getById(id) { ... }
}
```

**FuzzyMatcher.mjs** - Search algorithm
```javascript
export class FuzzyMatcher {
  match(query, target) {
    // Returns score or null if no match
    // Bonuses: consecutive chars, word boundary, position
  }

  search(query, commands) {
    // Returns sorted array of {command, score}
  }
}
```

**LOMInterface.mjs** - Live API wrapper
```javascript
export class LOMInterface {
  getSelectedTrack() { ... }
  getSelectedDevice() { ... }
  getSelectedClip() { ... }
  getCurrentContext() { ... }

  // Command executors
  transport = {
    play: () => { ... },
    stop: () => { ... },
    // ...
  }

  track = {
    mute: () => { ... },
    solo: () => { ... },
    // ...
  }
}
```

### 1.3 Command Definition Format

```json
{
  "id": "transport.play",
  "title": "Play",
  "category": "Transport",
  "keywords": ["start", "go"],
  "description": "Start playback",
  "action": "transport.play"
}
```

### 1.4 Phase 1 Commands (25 total)

**Transport (8):**
- Play, Stop, Record
- Toggle Loop, Toggle Metronome
- Tap Tempo
- Go to Arrangement, Go to Session

**Track (10):**
- Mute/Unmute Selected Track
- Solo/Unsolo Selected Track
- Arm/Disarm Selected Track
- Create Audio Track
- Create MIDI Track
- Delete Selected Track
- Duplicate Selected Track
- Rename Selected Track

**Navigation (7):**
- Select Next/Previous Track
- Select Next/Previous Device
- Select Next/Previous Scene
- Focus Browser

### 1.5 UI (jsui)

Reuse design from prototype with improvements:
- Dark theme matching Ableton
- Search input with cursor
- Scrollable results list
- Selection highlighting
- Status bar with counts
- Keyboard hints

---

## Phase 2: Fuzzy Search & Polish

### Goals
- Implement proper fuzzy matching with scoring
- Add context-aware filtering
- Expand to 75 commands
- Polish UI interactions

### 2.1 Fuzzy Match Algorithm

```javascript
function fuzzyMatch(query, target) {
  let score = 0;
  let queryIndex = 0;
  let lastMatchIndex = -1;

  query = query.toLowerCase();
  target = target.toLowerCase();

  for (let i = 0; i < target.length && queryIndex < query.length; i++) {
    if (target[i] === query[queryIndex]) {
      score += 1;

      // Consecutive match bonus
      if (i === lastMatchIndex + 1) score += 5;

      // Word boundary bonus
      if (i === 0 || target[i-1] === ' ') score += 3;

      // Early position bonus
      if (i < 5) score += 2;

      lastMatchIndex = i;
      queryIndex++;
    }
  }

  return queryIndex === query.length ? score : null;
}
```

### 2.2 Context System

```javascript
function getCurrentContext() {
  return {
    hasSelectedTrack: lom.getSelectedTrack() !== null,
    hasSelectedDevice: lom.getSelectedDevice() !== null,
    hasSelectedClip: lom.getSelectedClip() !== null,
    isPlaying: lom.isPlaying(),
    trackType: lom.getSelectedTrackType(), // audio/midi/return/master
    viewMode: lom.getViewMode() // session/arrangement
  };
}

// Filter commands by context
function filterByContext(commands, context) {
  return commands.filter(cmd => {
    if (cmd.requires?.selectedTrack && !context.hasSelectedTrack) return false;
    if (cmd.requires?.selectedDevice && !context.hasSelectedDevice) return false;
    // etc.
    return true;
  });
}
```

### 2.3 Phase 2 Commands (+50 = 75 total)

**Devices (25):**
- Add Compressor, EQ Eight, Reverb, Delay, Auto Filter
- Add Saturator, Limiter, Gate, Chorus, Phaser
- Add Utility, Spectrum, Tuner
- Add Arpeggiator, Chord, Scale, Note Length (MIDI)
- Add Wavetable, Operator, Drift, Simpler (Instruments)
- Bypass Selected Device
- Delete Selected Device
- Duplicate Selected Device

**Clips (15):**
- Fire Selected Clip
- Stop Selected Clip
- Delete Selected Clip
- Duplicate Selected Clip
- Quantize Clip (1/4, 1/8, 1/16)
- Loop Selection
- Consolidate
- Double Loop Length
- Halve Loop Length

**Scenes (10):**
- Fire Selected Scene
- Fire Next Scene
- Fire Previous Scene
- Stop All Clips
- Create Scene
- Delete Scene
- Duplicate Scene
- Capture and Insert Scene

---

## Phase 3: Full Command Coverage

### Goals
- Complete command library (150+ commands)
- Add parameterized commands
- Add track name matching
- Recent command tracking

### 3.1 Parameterized Commands

```json
{
  "id": "tempo.set",
  "title": "Set Tempo",
  "category": "Transport",
  "keywords": ["bpm", "speed"],
  "acceptsParameter": {
    "type": "number",
    "min": 20,
    "max": 999,
    "placeholder": "BPM"
  },
  "action": "transport.setTempo"
}
```

Usage: "tempo 128" → Sets tempo to 128 BPM

### 3.2 Track Name Matching

```javascript
function findTrackByName(query) {
  const tracks = lom.getAllTracks();
  const matches = tracks
    .map(track => ({
      track,
      score: fuzzyMatch(query, track.name)
    }))
    .filter(m => m.score !== null)
    .sort((a, b) => b.score - a.score);

  return matches[0]?.track || null;
}
```

Usage: "mute drums" → Mutes track named "Drums"

### 3.3 Recent Commands

```javascript
const recentCommands = []; // Max 20

function trackExecution(commandId) {
  recentCommands.unshift(commandId);
  if (recentCommands.length > 20) recentCommands.pop();
}

function boostRecent(results) {
  return results.sort((a, b) => {
    const aRecent = recentCommands.indexOf(a.id);
    const bRecent = recentCommands.indexOf(b.id);

    if (aRecent !== -1 && bRecent !== -1) return aRecent - bRecent;
    if (aRecent !== -1) return -1;
    if (bRecent !== -1) return 1;
    return b.score - a.score;
  });
}
```

### 3.4 Phase 3 Commands (+75 = 150+ total)

**Mixing (20):**
- Set Volume (with parameter)
- Set Pan
- Set Send A/B/C/D
- Reset Parameter
- Clear All Solo
- Clear All Mute
- Clear All Arm
- Show/Hide Mixer
- Show/Hide Sends
- Show/Hide Returns

**View (15):**
- Toggle Browser
- Toggle Detail View
- Toggle Info View
- Toggle In/Out
- Zoom In/Out
- Zoom to Selection
- Follow Playhead
- Draw Mode
- Toggle Automation

**Creation (20):**
- Create Return Track
- Create Group Track
- Insert MIDI Clip
- Insert Time
- Delete Time
- Bounce Selection
- Freeze Track
- Flatten Track
- Export Audio

**Bulk Operations (20):**
- Delete All Empty Tracks
- Delete All Clips on Track
- Delete All Devices on Track
- Arm All Tracks
- Disarm All Tracks
- Unsolo All
- Unmute All
- Fold All Groups
- Unfold All Groups
- Select All Clips

---

## Phase 4: Polish & Release

### Goals
- Performance optimization
- Error handling
- Documentation
- v1.0 release

### 4.1 Performance

- [ ] Cache LOM queries (invalidate on changes)
- [ ] Debounce search input (50ms)
- [ ] Lazy-load command executors
- [ ] Virtual scrolling for long lists

**Targets:**
- <100ms palette open
- <50ms search response
- <5MB device size
- <1% CPU idle

### 4.2 Error Handling

```javascript
function executeCommand(command, params) {
  try {
    const result = lom.execute(command.action, params);
    announce(`Executed: ${command.title}`);
    return result;
  } catch (e) {
    announce(`Error: ${e.message}`);
    post(`Command error: ${command.id} - ${e.message}\n`);
    return null;
  }
}
```

### 4.3 User Feedback

```javascript
function announce(message) {
  // Visual feedback in UI
  outlet(0, "status", message);

  // Console logging
  post(message + "\n");
}
```

### 4.4 Documentation

- [ ] README with installation and usage
- [ ] Command reference (auto-generated from JSON)
- [ ] Developer guide for adding commands

---

## Command Categories Summary

| Category   | Phase 1 | Phase 2 | Phase 3 | Total |
|------------|---------|---------|---------|-------|
| Transport  | 8       | 0       | 5       | 13    |
| Track      | 10      | 0       | 10      | 20    |
| Device     | 0       | 25      | 10      | 35    |
| Clip       | 0       | 15      | 10      | 25    |
| Scene      | 0       | 10      | 5       | 15    |
| Navigation | 7       | 0       | 5       | 12    |
| Mixing     | 0       | 0       | 20      | 20    |
| View       | 0       | 0       | 15      | 15    |
| Creation   | 0       | 0       | 20      | 20    |
| Bulk       | 0       | 0       | 20      | 20    |
| **Total**  | **25**  | **50**  | **120** | **195** |

---

## Technical Notes

### v8 vs Legacy js

Using `v8` object for:
- ES6+ syntax (let, const, arrow functions, template literals)
- ES modules (import/export)
- Modern JavaScript features (Map, Set, spread, destructuring)

**File extensions:** Use `.mjs` for ES modules

**Import syntax:**
```javascript
import { CommandRegistry } from './core/CommandRegistry.mjs';
```

### Device Insertion API

Live 12 uses `create_device` method:
```javascript
track.call("create_device", "Compressor");
```

Note: Some devices may need browser path references. Test each device category.

### Keyboard Handling

In Max:
- `key` object captures keystrokes when device has focus
- `live.toggle` works without focus (MIDI-mappable)
- Arrow keys: 38 (up), 40 (down)
- Enter: 13
- Escape: 27

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| v8 module loading issues | Fall back to single-file if needed |
| Device insertion API varies | Create compatibility layer, test across Live versions |
| Performance with 200+ commands | Implement caching and lazy loading |
| Keyboard input when unfocused | Use live.toggle for trigger, accept text input limitation |

---

## Implementation Log

### 2025-01-12

**Status:** Plan simplified and clarified
- Removed community/social infrastructure sections
- Committed to v8 with ES modules
- Reorganized into 4 clear phases
- Added command count targets per phase
- Created this implementation log

### 2026-01-12

**Status:** Phase 1 Foundation Complete

Implemented core v8 module architecture with 25 commands:

**Created Files:**
- `src/main.mjs` - Entry point with state management, inlet handlers, command loading
- `src/core/CommandRegistry.mjs` - Command storage and retrieval by ID/category
- `src/core/FuzzyMatcher.mjs` - Fuzzy search with scoring (consecutive, word boundary, position bonuses)
- `src/core/LOMInterface.mjs` - Live API wrapper with all Phase 1 command executors
- `src/ui/palette.mjs` - jsui rendering with dark theme matching Ableton
- `src/commands/transport.json` - 8 transport commands
- `src/commands/tracks.json` - 10 track commands
- `src/commands/navigation.json` - 7 navigation commands
- `src/BUILD_INSTRUCTIONS.md` - Max patcher creation guide

**Phase 1 Commands (25 total):**

Transport (8):
- Play, Stop, Record
- Toggle Loop, Toggle Metronome
- Tap Tempo
- Go to Arrangement, Go to Session

Track (10):
- Mute/Unmute Selected Track
- Solo/Unsolo Selected Track
- Arm/Disarm Selected Track
- Create Audio Track, Create MIDI Track
- Delete Selected Track, Duplicate Selected Track

Navigation (7):
- Select Next/Previous Track
- Select Next/Previous Device
- Select Next/Previous Scene
- Focus Browser

**Architecture Notes:**
- ES6 modules via v8 object
- Commands defined inline in main.mjs for Phase 1 (JSON files ready for future dynamic loading)
- FuzzyMatcher provides scored results with title/keyword/description matching
- LOMInterface uses handler map pattern for action dispatch
- UI supports scrolling, selection highlighting, keyboard hints

**Next Steps:**
1. Test v8 module loading in Max for Live
2. Create Max patcher following BUILD_INSTRUCTIONS.md
3. Validate all 25 command executors work correctly
4. Begin Phase 2: fuzzy search polish and context filtering

---

*Last Updated: 2026-01-12*

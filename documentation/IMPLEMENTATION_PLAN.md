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
- [x] Capture printable characters (a-z, 0-9, space, punctuation)
- [x] Handle backspace to delete characters
- [x] Build search string from keypresses
- [x] v8ui already displays `searchQuery` - no changes needed there

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

### 2026-01-13

**Status:** Native Keyboard Input Complete

Implemented full keyboard text input handling in `keydown()` function:

**Changes to `src/main.js`:**
- Added printable character capture (ASCII 32-126: letters, digits, space, punctuation)
- Added backspace/delete handling (keycodes 8 and 127)
- Characters append to `searchQuery` and trigger `search()` in real-time
- Backspace removes last character and updates search results
- Changed switch statement to use early `return` for cleaner control flow

**Keyboard Input Now Supports:**
- `a-z`, `A-Z` - letters (converted via `String.fromCharCode`)
- `0-9` - digits
- Space, punctuation (`!@#$%^&*()` etc.)
- Backspace - delete last character
- Arrow Up/Down - navigate results
- Enter - execute selected command
- Escape - close palette

**Architecture Note:**
No separate `textedit` object needed. The `key` object routes all keypresses to v8, which builds the search string natively. This provides VS Code-style UX where the palette captures all input when open.

**Next Steps:**
1. Test in Max for Live - validate key object sends correct ASCII codes
2. Consider Tab key for autocomplete (keycode 9)
3. Begin Phase 2: context-aware filtering and 50 additional commands

### 2026-01-13 (Phase 2)

**Status:** Phase 2 Complete - Context Filtering & 50 New Commands

Implemented context-aware filtering and expanded command library to 75 total commands.

**Context Filtering System (`src/main.js`):**
- Added `filterByContext()` function that filters commands based on Live state
- Added `refreshContext()` function called when palette opens
- Context checks: `selectedTrack`, `selectedDevice`, `selectedClip`, `isPlaying`, `stopped`, `sessionView`, `arrangementView`
- Commands with `requires` property are hidden when requirements aren't met

**New Command Files Created:**
- `src/commands/devices.json` - 25 device commands
- `src/commands/clips.json` - 15 clip commands
- `src/commands/scenes.json` - 10 scene commands

**Device Commands (25):**
- Add Effects: Compressor, EQ Eight, Reverb, Delay, Auto Filter, Saturator, Limiter, Gate, Chorus, Phaser, Utility, Spectrum, Tuner
- Add MIDI Effects: Arpeggiator, Chord, Scale, Note Length
- Add Instruments: Wavetable, Operator, Drift, Simpler
- Device Operations: Bypass, Delete, Duplicate, Show/Hide

**Clip Commands (15):**
- Fire, Stop, Delete, Duplicate Selected Clip
- Quantize (1/4, 1/8, 1/16)
- Loop Selection, Consolidate
- Double/Halve Loop Length
- Enable/Disable Clip Loop
- Crop to Loop, Rename

**Scene Commands (10):**
- Fire Selected/Next/Previous Scene
- Stop All Clips
- Create, Delete, Duplicate Scene
- Capture and Insert Scene
- Rename, Set Tempo

**LOMInterface.js Additions:**
- `_getSelectedDevice()` - Get selected device API
- `_getSelectedClipSlot()` - Get selected clip slot and clip
- `_getSelectedScene()` - Get selected scene API
- `deviceAdd(name)` - Add device by name via `create_device`
- `deviceBypass()`, `deviceDelete()`, `deviceDuplicate()`, `deviceShowHide()`
- Full clip operations: fire, stop, delete, duplicate, quantize, loop manipulation
- Full scene operations: fire, create, delete, duplicate, capture

**Command Count:**
- Phase 1: 25 commands (Transport: 8, Track: 10, Navigation: 7)
- Phase 2: +50 commands (Device: 25, Clip: 15, Scene: 10)
- Total: 75 commands

**Next Steps:**
1. Test all 75 commands in Ableton Live
2. Verify context filtering works correctly
3. Test device insertion API with various device types
4. Begin Phase 3: Parameterized commands, track name matching, recent commands

### 2026-01-15: Floating Window UI Implementation

**Status:** Floating Window Architecture Complete (with keyboard input limitation)

**Floating Window Architecture:**

Implemented VS Code-style floating palette window using `pcontrol` and `thispatcher`:

**Main Patch (CommandPalette.amxd):**
- `live.toggle` for MIDI-mappable trigger
- `sel 1 0` routes to `open`/`close` messages
- `pcontrol` opens/closes the subpatcher window
- `r ---close` receives close signal, resets toggle via `set 0`

**Floating Subpatch (p palette_window):**
- `thispatcher` receives window configuration from `v8 window.js`
- `v8ui palette.js` renders the palette UI (500x400, presentation mode)
- `key` object captures keystrokes when window is focused
- `v8 main.js` handles command logic
- `s ---close` sends close signal back to main patch

**New File Created:**
- `src/ui/window.js` - Window positioning and configuration
  - Receives screen bounds from `screensize` object
  - Calculates centered window position
  - Outputs `thispatcher` messages: `window size`, `window notitle`, `window flags float/nozoom/nogrow/noclose/nominimize/nomenu`, `toolbarvisible 0`, `statusbarvisible 0`, `presentation 1`, `window exec`, `active 1`

**Changes to Existing Files:**
- `src/ui/palette.js`:
  - Changed `displayState.visible` default to `true` (window visibility now handled by pcontrol)
  - Removed closed state check in `paint()` - always draws palette
  - Changed dimension reading to use `this.box.getattr("presentation_rect")` for proper sizing
- `src/main.js`:
  - Added logging for key messages (`post("key int: " + val)`, `post("anything: " + cmd)`)
  - Removed `if (!paletteVisible) return` check in `keydown()` - keys always processed when window open

**Architecture Diagram:**
```
Main Patch:
live.toggle → sel 1 0 → pcontrol → p palette_window
                  ↑
r ---close ← set 0

Floating Subpatch:
loadbang → screensize → v8 window.js → thispatcher
key → prepend key → v8 main.js → v8ui palette.js
                         ↓
                    s ---close
```

**ADR 003: Keyboard Input in Floating Windows**

**Problem:** The `key` object captures keystrokes, but they also pass through to Ableton Live. This causes unintended actions (e.g., pressing "S" solos a track).

**Root Cause:** Max for Live floating windows are child windows of the Live process. Keystrokes are not exclusively captured - they propagate to the parent application.

**Options Considered:**
1. **`active 1` message** - Tried sending `active 1` to `thispatcher`. Does not prevent Live passthrough.
2. **textedit with `@keymode 1`** - A `textedit` object properly captures keyboard focus and prevents passthrough. With `@keymode 1`, it outputs text on every keystroke for real-time search.
3. **jweb with HTML input** - A web view would capture keyboard exclusively but adds complexity.
4. **Accept limitation** - Document that users should disable Live keyboard shortcuts while using palette.

**Decision:** TBD - Option 2 (textedit) is recommended as the simplest solution that properly captures keyboard input.

**textedit Research (corrected understanding):**

Key attributes:
- `@keymode 1` - Makes **Return key** output buffer contents (NOT real-time output)
- `@keymode 0` (default) - Return creates line break
- `@tabmode 1` (default) - Tab outputs buffer contents
- **Middle outlet** - Outputs ASCII code of each character as typed (real-time!)
- `@outputmode 0` - Output as messages; `@outputmode 1` - Output as single symbol

Focus control:
- `select` message - Highlights all text AND sets textedit as keyboard target
- `enter` message - Outputs text and removes focus
- No `@autofocus` attribute exists

**Proposed textedit Integration:**
```
On window open:
r ---open ──► "select" ──► textedit @varname search_input
                               │
                               │ middle outlet (ASCII codes in real-time)
                               ▼
                          v8 main.js (build search string char by char)

key object still handles: Arrow keys (30/31 or 38/40), Enter (13), Escape (27)
```

### 2026-01-15: textedit Keyboard Capture Implementation

**Status:** Complete

**Problem:** Keypresses in the floating palette window were passing through to Ableton Live, causing unintended actions (e.g., pressing "S" while typing would solo a track).

**Solution:** Implemented textedit-based keyboard capture. textedit properly captures keyboard focus and prevents passthrough to Live.

**Architecture:**
```
textedit (middle outlet - ASCII codes per keystroke)
    │
    ▼
select 13 27 30 31 38 40
    │                  │
    ▼                  ▼
prepend key       prepend char
    │                  │
    └────────┬─────────┘
             ▼
        v8 main.js
```

**Changes to main.js:**
- Renamed message handlers to avoid reserved words: `open` → `show`, `close` → `hide`, `toggle` → `tog`
- Added `handleTexteditChar()` function for real-time character input from textedit middle outlet
- Added `char` message handler routing to `handleTexteditChar()`
- Simplified `keydown()` to handle only navigation keys (arrows, Enter, Escape)
- Added `outlet(0, "focus")` on palette open to trigger textedit focus
- Added `outlet(0, "clear")` on palette close to clear textedit

**Changes to window.js:**
- Removed invalid `active 1` message to thispatcher

**Max Patcher Setup (p palette_window):**
1. textedit object (can be off-screen, v8ui handles visual rendering)
2. Middle outlet → `select 13 27 30 31 38 40` to split nav keys from text
3. Nav keys (Enter, Escape, arrows) → `prepend key` → main.js
4. Other characters → `prepend char` → main.js
5. `route focus clear` on main.js outlet 0:
   - `focus` → `select` message to textedit (gives keyboard focus)
   - `clear` → `set ""` to textedit (clears on close)
   - Unmatched (`display`) → v8ui

**Result:**
- Keyboard input captured by textedit, no longer passes to Live
- Real-time search as user types
- Arrow keys work for navigation while typing
- Enter executes, Escape closes

### 2026-01-15: Command Module Refactor (CommonJS)

**Status:** Complete

**Problem:** Commands were defined inline in main.js (~667 lines), and JSON files in `src/commands/` were unused. Max v8 doesn't support `require()` for JSON files or file system access.

**Solution:** Convert JSON files to CommonJS modules that export command arrays:

```javascript
// src/commands/transport.js
const transportCommands = [
    { id: "transport.play", title: "Play", ... }
];
module.exports = transportCommands;
```

**Changes:**
- Created 6 CommonJS modules in `src/commands/`:
  - `transport.js` (8 commands)
  - `tracks.js` (10 commands)
  - `navigation.js` (7 commands)
  - `devices.js` (25 commands)
  - `clips.js` (15 commands)
  - `scenes.js` (10 commands)
- Updated `main.js` to `require()` command modules at top of file
- Removed ~667 lines of inline command definitions from `main.js`
- Deleted unused `.json` files
- Added debug logging to verify module loading

**Result:**
- `main.js` reduced from ~997 lines to ~330 lines
- Commands now properly modularized and maintainable
- Total: 75 commands loaded successfully

---

*Last Updated: 2026-01-15 (textedit keyboard capture)*

# ADR 001: Prototype Validation - Command Palette Concept

**Date:** 2026-01-12
**Status:** Accepted
**Deciders:** Project Author

## Context

We needed to validate whether a VS Code-style command palette for Ableton Live was:
1. Technically feasible using Max for Live
2. Responsive enough for practical use
3. Genuinely useful for music production workflows

The full implementation plan called for 10 weeks of development and 200+ commands. Before investing that time, we needed a quick proof-of-concept.

## Decision

Build a minimal prototype with:
- 2 JavaScript files (`proto.js`, `palette_ui.js`)
- 1 Max for Live patcher (`CommandPaletteProto.amxd`)
- 10 hardcoded commands
- Simple substring search (no fuzzy matching)
- Basic jsui display with dark theme

## Prototype Scope

### Included
| Feature | Implementation |
|---------|----------------|
| Hotkey trigger | `key` object detecting P keycode |
| Floating palette UI | jsui with custom drawing |
| 10 commands | Transport (3), Track (4), Device (3) |
| Keyboard navigation | ↑↓ arrows, Enter, Esc |
| Search filtering | Substring match on name + keywords |
| LOM integration | LiveAPI calls for all commands |

### Explicitly Excluded
- Fuzzy matching algorithm
- Context awareness
- Track name resolution
- JSON command definitions
- Preferences/settings
- Multiple file architecture
- Accessibility features

## Technical Findings

### What Worked Well
1. **LiveAPI responsiveness** — LOM calls execute instantly, no perceptible delay
2. **jsui rendering** — Custom UI drawing is smooth and flexible
3. **Keyboard handling** — `key` object reliably captures input when device has focus
4. **JavaScript in Max** — `autowatch = 1` enables rapid iteration

### Limitations Discovered
1. **Focus requirement** — Device must have focus to capture keystrokes; global hotkeys would require `hi` object or external solutions
2. **Device insertion** — `create_device` API may vary between Live versions
3. **textedit integration** — Requires careful wiring to separate navigation keys from text input

## Consequences

### Positive
- Confirmed technical feasibility of core concept
- Validated that keyboard workflow is faster than mouse for tested operations
- Established working patterns for LOM interaction
- Created reusable jsui rendering code

### Negative
- Focus requirement limits "always available" vision
- Will need version-specific handling for some LOM calls

### Risks Identified
- Global hotkey solution needed for production version
- Must test across Live 11/12 for compatibility

## Next Steps

**Decision: GO** — Proceed with full implementation.

Recommended priorities for Phase 1:
1. Use `live.toggle` for MIDI-mappable palette trigger
2. Build extensible command registry (JSON-based)
3. Implement fuzzy matching algorithm
4. Expand to 25 core commands

---

## Learnings for Full Implementation

### 1. Trigger Mechanism: `live.toggle` Solution
- **Finding:** `key` object requires Max focus, limiting usability
- **Solution:** Use `live.toggle` which can be MIDI-mapped in Live
- **Benefit:** User chooses their own trigger key, works globally without focus

### 2. V8 Object for Modern JavaScript
- **Finding:** Legacy `js` object lacks ES6+, modules, proper imports
- **Decision:** Use `v8` object (Live 12+ required anyway)
- **Enables:** `import/export`, proper modular architecture, better performance

### 3. Device Insertion API
- **Finding:** `create_device` behavior uncertain across Live versions
- **Action:** Document exact LOM methods early, create `DeviceInsertion.js` compatibility layer

### 4. Text Input Wiring Complexity
- **Finding:** Separating navigation keys (↑↓ Enter Esc) from text input requires careful Max wiring
- **Action:** Document patcher wiring clearly, use subpatchers for organization

---

## References

- [PROTOTYPE_SPEC.md](../PROTOTYPE_SPEC.md) — Original 6-hour prototype plan
- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) — Full 10-week roadmap
- [prototype/](../../prototype/) — Working prototype files

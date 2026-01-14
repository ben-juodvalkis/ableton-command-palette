# ADR 003: Context-Aware Command Filtering

**Date:** 2026-01-14
**Status:** Accepted
**Deciders:** Project Author

## Context

With the expansion to 75 commands in Phase 2, the command palette needed a way to show only relevant commands based on the current state of Ableton Live. Without filtering:

1. **Clutter:** Users see commands that can't execute (e.g., "Fire Selected Clip" when no clip is selected)
2. **Errors:** Executing inapplicable commands produces confusing error messages
3. **UX degradation:** More commands = more scrolling and harder fuzzy matching

We needed a declarative system to conditionally show/hide commands based on Live's current state.

## Decision

Implement a **declarative requirements system** where commands specify their preconditions via a `requires` property, and a `filterByContext()` function evaluates these at palette open time.

### Command Definition

```javascript
{
    id: "clip.fire",
    title: "Fire Selected Clip",
    category: "Clip",
    action: "clip.fire",
    requires: { selectedClip: true }  // Only show when a clip is selected
}
```

### Context Object

```javascript
{
    hasSelectedTrack: true,
    hasSelectedDevice: false,
    hasSelectedClip: true,
    isPlaying: false,
    viewMode: "session"  // or "arrangement"
}
```

### Filter Function

```javascript
function filterByContext(commands, context) {
    if (!context) return commands;  // Graceful fallback

    return commands.filter(cmd => {
        if (!cmd.requires) return true;  // No requirements = always show

        if (cmd.requires.selectedTrack && !context.hasSelectedTrack) return false;
        if (cmd.requires.selectedDevice && !context.hasSelectedDevice) return false;
        if (cmd.requires.selectedClip && !context.hasSelectedClip) return false;
        if (cmd.requires.playing && !context.isPlaying) return false;
        if (cmd.requires.stopped && context.isPlaying) return false;
        if (cmd.requires.sessionView && context.viewMode !== "session") return false;
        if (cmd.requires.arrangementView && context.viewMode !== "arrangement") return false;

        return true;
    });
}
```

### Context Refresh

Context is refreshed each time the palette opens via `refreshContext()`, which queries Live's current state through the LOMInterface.

## Rationale

### Why Declarative Requirements?

1. **Separation of concerns:** Command definitions declare *what* they need, not *how* to check
2. **Maintainability:** Adding new requirement types only requires changes in two places (context getter, filter function)
3. **Testability:** Can unit test filter logic with mock contexts
4. **Readability:** Command requirements are self-documenting in JSON

### Why Filter at Palette Open?

1. **Performance:** Single context query per palette invocation vs. per-command checks
2. **Consistency:** All commands see the same snapshot of state
3. **UX:** Command list doesn't flicker during typing as state changes

### Why Graceful Fallback?

```javascript
if (!context) return commands;  // Show all if context unavailable
```

If `getCurrentContext()` fails (e.g., Live API error), users still see all commands rather than an empty palette. Commands may fail on execution, but discovery isn't blocked.

## Supported Requirements

| Requirement | Description | Example Commands |
|-------------|-------------|------------------|
| `selectedTrack` | A track is selected | Add Device commands |
| `selectedDevice` | A device is selected | Bypass, Delete, Duplicate Device |
| `selectedClip` | A clip slot with clip is selected | Clip operations |
| `playing` | Transport is playing | (Future: stop-only commands) |
| `stopped` | Transport is stopped | (Future: play-only commands) |
| `sessionView` | Session View is active | Scene commands, clip launching |
| `arrangementView` | Arrangement View is active | Consolidate, time-based editing |

## Alternatives Considered

### 1. Runtime Validation Only

- **Approach:** Show all commands, validate on execution
- **Pro:** Simpler implementation
- **Con:** Poor UX - users discover limitations only after attempting action
- **Decision:** Rejected

### 2. Dynamic Filtering (Real-time)

- **Approach:** Re-filter on every keystroke or state change
- **Pro:** Always current
- **Con:** Performance overhead, potential UI flickering, complexity
- **Decision:** Rejected for Phase 2; may revisit if users report stale context issues

### 3. Category-Based Filtering

- **Approach:** Hide entire categories (e.g., hide all Clip commands when no clip selected)
- **Pro:** Simpler mental model
- **Con:** Too coarse - some commands in category may still apply
- **Decision:** Rejected

## Consequences

### Positive

- Reduced clutter: Users see ~30-50% fewer irrelevant commands
- Self-documenting: `requires` property shows command limitations
- Extensible: Easy to add new requirement types
- Robust: Graceful degradation on context errors

### Negative

- Context staleness: If user changes selection while palette is open, commands may be wrong
- Overhead: Additional LOM queries on each palette open (~5-10ms)
- Complexity: New developers must understand filter system

### Risks

- **Stale context:** Mitigated by documenting that context is snapshot at open time
- **Over-filtering:** If requirements are too strict, useful commands may be hidden; monitor user feedback

## Future Enhancements

1. **Dynamic refresh:** Add optional mid-session refresh for long palette sessions
2. **Soft requirements:** Show commands as "disabled" rather than hidden
3. **Composite requirements:** `requires: { selectedClip: true, midiClip: true }` for MIDI-only operations
4. **Negative requirements:** `requires: { returnTrack: false }` to exclude return tracks

## References

- [VS Code Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) - Inspiration for when clauses
- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) - Phase 2 planning notes
- [main.js](../../src/main.js) - Implementation of filterByContext()

---

*This ADR documents the context filtering system introduced in Phase 2.*

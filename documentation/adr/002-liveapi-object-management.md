# ADR 002: LiveAPI Object Management Strategy

**Date:** 2026-01-13
**Status:** Accepted
**Deciders:** Project Author

## Context

The LOMInterface module creates many `LiveAPI` objects to interact with Ableton Live's Object Model. During PR review, concerns were raised about:

1. **Performance:** Creating new `LiveAPI` objects in frequently-called methods
2. **Memory:** Potential memory leaks from unreleased API objects
3. **Correctness:** Whether cached objects would return stale data

We needed to determine the optimal strategy for managing `LiveAPI` object lifecycle.

## Decision

Implement a **hybrid caching strategy**:

1. **Cache static paths** as lazy-initialized singletons:
   - `live_set` - the song object (never changes during session)
   - `live_set view` - the application view object

2. **Create fresh objects for dynamic paths**:
   - `live_set view selected_track` - changes when user selects different track
   - `live_set tracks N` - the N changes based on navigation
   - `live_set view selected_track view selected_device` - nested dynamic path

### Implementation

```javascript
class LOMInterface {
    constructor() {
        // Cached singletons (null until first use)
        this._liveSetApi = null;
        this._viewApi = null;
    }

    // Lazy singleton accessor
    _getLiveSetApi() {
        if (!this._liveSetApi) {
            this._liveSetApi = new LiveAPI("live_set");
        }
        return this._liveSetApi;
    }

    _getViewApi() {
        if (!this._viewApi) {
            this._viewApi = new LiveAPI("live_set view");
        }
        return this._viewApi;
    }

    // Example usage
    transportPlay() {
        const api = this._getLiveSetApi(); // Reused
        api.call("start_playing");
    }

    navNextTrack() {
        const api = this._getViewApi(); // Reused
        const current = new LiveAPI("live_set view selected_track"); // Fresh
        // ...
    }
}
```

## Rationale

### Why Cache Static Paths?

1. **Performance:** Eliminates redundant object construction
2. **Safety:** These paths never change during a Live session
3. **LiveAPI behavior:** Once bound to a path, the object reflects current state when queried (get/set operations are not cached)

### Why Fresh Objects for Dynamic Paths?

1. **Correctness:** `live_set view selected_track` resolves to different tracks when selection changes
2. **Path binding:** LiveAPI binds to a path at construction time
3. **Index changes:** `tracks 0` and `tracks 1` are fundamentally different objects

### Why Not Cache Everything?

Consider this bug scenario:

```javascript
// BAD: Cached dynamic path
this._selectedTrackApi = new LiveAPI("live_set view selected_track");

navNextTrack() {
    // User selects Track 2, then calls navNextTrack
    // this._selectedTrackApi still points to previous selection!
    const trackPath = this._selectedTrackApi.path; // STALE!
}
```

The path `live_set view selected_track` is a **resolver** - it returns different objects depending on current selection. Caching it would freeze the reference.

## Alternatives Considered

### 1. No Caching (Original Approach)
- **Pro:** Simple, always correct
- **Con:** Creates 2-5 LiveAPI objects per command execution
- **Decision:** Rejected for performance

### 2. Full Caching with Invalidation
- **Pro:** Maximum performance
- **Con:** Complex invalidation logic, race conditions with Live's state
- **Decision:** Rejected for complexity

### 3. Object Pooling
- **Pro:** Reduces garbage collection pressure
- **Con:** Over-engineered for 25-200 commands, unclear if Max GC benefits
- **Decision:** Rejected as premature optimization

## Consequences

### Positive
- Reduces LiveAPI object creation by ~40% for typical command execution
- Simple to understand: static = cached, dynamic = fresh
- No invalidation logic needed
- Clear documentation in code comments

### Negative
- Still creates fresh objects for dynamic paths (unavoidable)
- Cached objects persist for session lifetime (minimal memory impact)

### Neutral
- Requires developers to understand which paths are static vs dynamic
- Pattern documented in ADR for future reference

## Bounds Checking

As part of this change, we also added bounds checking to navigation functions:

```javascript
navNextTrack() {
    const tracks = liveSet.get("tracks");
    const trackCount = tracks.length / 2;

    // NEW: Early return if no tracks
    if (trackCount === 0) {
        post("Navigation: No tracks in set\n");
        return;
    }
    // ...
}
```

This prevents edge cases where:
- Empty project has no tracks/scenes
- `Math.min(index, count - 1)` would return `-1` when `count === 0`

## References

- [LiveAPI Documentation](https://docs.cycling74.com/max8/vignettes/jsliveapi) - Cycling '74
- [LOM - The Live Object Model](https://docs.cycling74.com/max8/vignettes/live_object_model) - Cycling '74
- PR #3 Review Comments - Performance and memory concerns

---

*This ADR supersedes informal notes in IMPLEMENTATION_PLAN.md regarding LiveAPI usage.*

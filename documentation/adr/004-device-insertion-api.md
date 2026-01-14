# ADR 004: Device Insertion API Strategy

**Date:** 2026-01-14
**Status:** Accepted
**Deciders:** Project Author

## Context

Phase 2 added 21 "Add Device" commands to insert native Live effects, MIDI effects, and instruments. We needed to determine:

1. Which LOM API method to use for device insertion
2. What device types are supported
3. How to handle device naming and track type compatibility

## Decision

Use `Track.insert_device(name, index)` for inserting native Ableton Live devices.

### Implementation

```javascript
deviceAdd(deviceName) {
    const track = this._getSelectedTrack();
    if (!track) return;

    try {
        // insert_device(name, index) - omit index to insert at end
        track.call("insert_device", deviceName);
        post(`Device: Added ${deviceName}\n`);
    } catch (e) {
        post(`Device: Could not add ${deviceName} - ${e.message}\n`);
    }
}
```

### Supported Devices

| Category | Devices |
|----------|---------|
| Audio Effects | Compressor, EQ Eight, Reverb, Delay, Auto Filter, Saturator, Limiter, Gate, Chorus-Ensemble, Phaser, Utility, Spectrum, Tuner |
| MIDI Effects | Arpeggiator, Chord, Scale, Note Length |
| Instruments | Wavetable, Operator, Drift, Simpler |

### Device Name Mapping

Device names must match exactly as they appear in Live's browser. Notable mappings:

| Command Name | `insert_device` Parameter |
|--------------|---------------------------|
| Add Chorus | `"Chorus-Ensemble"` |
| Add EQ Eight | `"EQ Eight"` |
| Add Auto Filter | `"Auto Filter"` |
| Add Note Length | `"Note Length"` |

## Rationale

### Why `insert_device` over `create_device`?

1. **Official API:** `insert_device` is documented in Live 12 LOM reference
2. **Predictable:** Inserts at specified index or end of chain
3. **Return value:** Returns reference to inserted device for potential follow-up operations

### Why Native Devices Only?

1. **Reliability:** Native device names are consistent across installations
2. **No path resolution:** Third-party plugins require file paths or browser navigation
3. **Universal availability:** All users have access to native devices

### Why Try/Catch Wrapper?

```javascript
try {
    track.call("insert_device", deviceName);
} catch (e) {
    post(`Device: Could not add ${deviceName} - ${e.message}\n`);
}
```

Device insertion can fail for several reasons:
- Track type mismatch (MIDI effect on audio track)
- Device name typo
- Device not available in user's Live edition (Standard vs Suite)

Graceful error handling prevents palette crashes and provides feedback.

## Limitations

### 1. Track Type Compatibility

| Device Type | Audio Track | MIDI Track | Return Track |
|-------------|-------------|------------|--------------|
| Audio Effect | Yes | Yes | Yes |
| MIDI Effect | No | Yes | No |
| Instrument | No | Yes | No |

MIDI effects and instruments will fail silently or error when added to incompatible tracks. Future enhancement: add `requires: { midiTrack: true }` to filter these commands.

### 2. Device Editions

Some devices require Live Suite:
- Wavetable
- Operator
- Drift

Users with Live Standard will see errors when attempting to add Suite-only devices.

### 3. Max for Live Devices

`insert_device` does not support Max for Live devices by name. These require:
- Browser path navigation
- `load_device` with full path
- Or drag-and-drop (not automatable)

### 4. Third-Party Plugins

VST/AU plugins cannot be inserted via `insert_device`. They require:
- `load_device_from_path` with plugin path
- Plugin path varies by system/installation

## Alternatives Considered

### 1. Browser Navigation Approach

- **Approach:** Use `view.browse_mode` and navigate browser to device
- **Pro:** Works for any device type
- **Con:** Complex, requires multiple API calls, user sees browser activity
- **Decision:** Rejected for Phase 2; may revisit for plugin support

### 2. Device Path Database

- **Approach:** Maintain database of device file paths
- **Pro:** Could support M4L and plugins
- **Con:** Paths vary by OS, installation, plugin version
- **Decision:** Rejected as unmaintainable

### 3. Clipboard Approach

- **Approach:** Copy preset device to clipboard, paste
- **Pro:** Works for any device with saved preset
- **Con:** Requires preset files, modifies clipboard, complex
- **Decision:** Rejected

## Consequences

### Positive

- Simple, reliable device insertion for 21 common devices
- Consistent behavior across Live installations
- Fast execution (~50ms per insert)

### Negative

- Limited to native Live devices
- No Suite-only device detection
- No track type validation before attempt

### Future Work

1. **Track type filtering:** Add `requires: { midiTrack: true }` for MIDI effects/instruments
2. **Suite detection:** Query Live edition to filter Suite-only devices
3. **Plugin support:** Investigate `load_device_from_path` for VST/AU
4. **M4L support:** Explore browser automation for Max for Live devices

## References

- [Ableton Live 12 LOM Reference](https://docs.cycling74.com/max8/vignettes/live_object_model) - `Track.insert_device` documentation
- [LOMInterface.js](../../src/core/LOMInterface.js) - Implementation
- ADR 001 - Initial device insertion findings from prototype

---

*This ADR documents the device insertion strategy implemented in Phase 2.*

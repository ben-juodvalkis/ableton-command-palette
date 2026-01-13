# Command Palette - Build Instructions

This document describes how to create the CommandPalette.amxd Max for Live device.

## Prerequisites

- Max 9+ (included with Live 12)
- Ableton Live 12+

## Creating the Max Patcher

### 1. Create New Device

1. Open Ableton Live
2. Create a new MIDI Track
3. In the browser, navigate to Max for Live > Max Audio Effect
4. Double-click to add it to the track
5. Click the edit button (wrench icon) to open Max

### 2. Patcher Objects

Create the following objects in the Max patcher:

```
┌─────────────────────────────────────────────────────────────────┐
│                      CommandPalette.amxd                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐                                               │
│  │ live.toggle  │ @parameter_longname "Open Palette"            │
│  │              │ @parameter_shortname "Open"                   │
│  └──────┬───────┘                                               │
│         │                                                       │
│         │ toggle                                                │
│         ▼                                                       │
│  ┌──────────────┐                                               │
│  │ prepend      │                                               │
│  │   toggle     │                                               │
│  └──────┬───────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │                      v8 main.js                       │       │
│  └────────┬────────────────────────────────┬────────────┘       │
│           │ outlet 0                       │ outlet 1           │
│           │ (to v8ui)                      │ (close bang)       │
│           ▼                                ▼                    │
│  ┌─────────────────┐               ┌──────────────┐             │
│  │  v8ui           │               │  t b         │             │
│  │  @filename      │               │  (trigger)   │             │
│  │  ui/palette.js  │               └──────┬───────┘             │
│  │  @size 400 350  │                      │                     │
│  └─────────────────┘                      │                     │
│                                           │                     │
│  ┌─────────────────┐                      │                     │
│  │ textedit        │                      │                     │
│  │ @size 360 24    │◄─────────────────────┘ (clear on close)    │
│  │ @bgcolor dark   │                                            │
│  └────────┬────────┘                                            │
│           │                                                     │
│  ┌────────┴────────┐                                            │
│  │ prepend text    │                                            │
│  └────────┬────────┘                                            │
│           │                                                     │
│           └──────────────► [to v8 inlet]                        │
│                                                                 │
│  ┌─────────────────┐                                            │
│  │     key         │ (captures keyboard when focused)           │
│  └────────┬────────┘                                            │
│           │                                                     │
│  ┌────────┴────────┐                                            │
│  │ prepend key     │                                            │
│  └────────┬────────┘                                            │
│           │                                                     │
│           └──────────────► [to v8 inlet]                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Object Specifications

#### live.toggle
```
live.toggle @parameter_longname "Open Palette" @parameter_shortname "Open"
```
- This allows MIDI mapping to open/close the palette

#### v8 object
```
v8 main.js
```
- The v8 object runs modern JavaScript (ES6+)
- Uses CommonJS `require()` for modules
- Set the search path to include the `src/` folder

#### v8ui
```
v8ui @filename ui/palette.js @size 400 350 @border 0 @ignoreclick 0
```
- Size: 400x350 pixels
- No border for clean look
- Accept mouse clicks for future interaction
- v8ui supports ES6 syntax (const, let, template literals, arrow functions)

#### textedit
```
textedit @size 360 24 @bgcolor 0.15 0.15 0.15 1 @textcolor 1 1 1 1
```
- Dark background matching the palette theme
- White text color
- Used for search input

#### key object
```
key
```
- Captures keystrokes when device has focus
- Arrow keys, Enter, Escape handling

### 4. Connections

1. `live.toggle` output → `prepend toggle` → `v8` inlet
2. `v8` outlet 0 → `v8ui` inlet (for display data)
3. `v8` outlet 1 → clear `textedit` (on palette close)
4. `textedit` output → `prepend text` → `v8` inlet
5. `key` output → `prepend key` → `v8` inlet

### 5. File Paths

Ensure the v8 object can find the .js files. You may need to:

1. Add the `src/` folder to Max's search path
2. Or use absolute paths in the v8 object

To add search path in Max:
- Options > File Preferences
- Add the full path to `src/` folder

### 6. Save the Device

1. File > Save As
2. Navigate to your project's `src/` folder
3. Save as `CommandPalette.amxd`

### 7. Testing

1. Close Max editor
2. In Live, toggle the `live.toggle` parameter
3. The palette should appear in the v8ui
4. Type in the textedit to search
5. Use arrow keys to navigate, Enter to execute, Escape to close

## Troubleshooting

### v8 module loading issues
- Check that file paths are correct
- Look at Max console for error messages
- Ensure all .js files use CommonJS exports (`module.exports = {...}`)

### v8ui not updating
- Send a `bang` to v8ui to force redraw
- Check that display data JSON is valid

### Keyboard input not working
- Ensure the device has focus in Live
- The `key` object only captures when Max device is focused

## Alternative: Single-File Fallback

If CommonJS modules cause issues, you can fall back to a single-file approach:
1. Copy all module code into one file
2. Use the legacy `js` object instead of `v8`
3. Remove require/module.exports statements

See `prototype/proto.js` for the single-file approach.

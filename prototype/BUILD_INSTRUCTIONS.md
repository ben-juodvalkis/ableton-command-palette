# Command Palette Prototype - Build Instructions

This guide walks you through building the Max for Live patcher from scratch.

## Prerequisites

- Ableton Live 12+ with Max for Live
- The `proto.js` and `palette_ui.js` files from this folder

## Step 1: Create New Max for Live Device

1. In Ableton Live, create a new **MIDI Track**
2. In the browser, go to **Max for Live → Max Audio Effect**
3. Drag it onto the track
4. Click the device's **Edit** button (or press the wrench icon) to open Max

## Step 2: Set Up the Patcher

Delete the default objects and build this signal flow:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ┌─────────┐                                                          │
│   │  key    │  ← Captures all keystrokes                               │
│   └────┬────┘                                                          │
│        │                                                                │
│        ▼                                                                │
│   ┌─────────┐                                                          │
│   │ sel 16  │  ← Detects Cmd+Shift+P (keycode 16 = P with modifiers)   │
│   └────┬────┘                                                          │
│        │                                                                │
│        ▼                                                                │
│   ┌─────────────┐                                                      │
│   │   t b       │  ← Trigger bang                                      │
│   └──────┬──────┘                                                      │
│          │                                                              │
│          ▼                                                              │
│   ┌──────────────────┐     ┌────────────────────────────┐              │
│   │ js proto.js      │────▶│ jsui @file palette_ui.js   │              │
│   │                  │     │ @size 400 300              │              │
│   └────────┬─────────┘     └────────────────────────────┘              │
│            │                                                            │
│            ▼                                                            │
│   ┌────────────────┐                                                   │
│   │ textedit @size │  ← Text input (connected back to js)              │
│   │ 360 30         │                                                   │
│   └────────────────┘                                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Step 3: Create Objects (Detailed)

### 3.1 Keyboard Input

1. Create object: `key`
   - This captures all keyboard input when the device has focus

2. Create object: `sel 112`
   - 112 is the ASCII code for 'p'
   - Connect `key` outlet → `sel 112` inlet

3. Create object: `t b`
   - Connect `sel 112` left outlet → `t b` inlet

### 3.2 Main JavaScript

1. Create object: `js proto.js`
   - Make sure `proto.js` is in the same folder as your `.amxd` file
   - Or use full path: `js /path/to/proto.js`

2. Connect `t b` outlet → `js proto.js` inlet (for toggle trigger)

### 3.3 UI Display

1. Create object: `jsui @filename palette_ui.js @size 400 300`
   - This creates the visual palette display
   - Connect `js proto.js` outlet 0 → `jsui` inlet

### 3.4 Text Input

1. Create object: `textedit @size 360 24 @bgcolor 0.15 0.15 0.15 1 @textcolor 1 1 1 1`
   - This handles text entry for search

2. Create object: `prepend text`
   - Connect `textedit` outlet → `prepend text` inlet
   - Connect `prepend text` outlet → `js proto.js` inlet

### 3.5 Additional Keyboard Handling

For arrow keys and escape:

1. Create object: `key`
2. Create object: `sel 27 38 40 13` (Esc, Up, Down, Enter)
3. Connect appropriately to send these to `js proto.js`

## Step 4: Alternative Simpler Setup

If the hotkey detection is tricky, start with a simpler version:

```
┌─────────────┐
│   button    │  ← Click to toggle palette
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ message box  │  ← Contains "toggle"
│  [toggle]    │
└──────┬───────┘
       │
       ▼
┌──────────────────┐     ┌────────────────────────┐
│ js proto.js      │────▶│ jsui @file palette_ui  │
└──────────────────┘     │ @size 400 300          │
                         └────────────────────────┘
```

## Step 5: Test the Setup

1. Lock the patcher (Cmd+E / Ctrl+E)
2. Click the button or press the hotkey
3. You should see the palette appear in the jsui
4. Check the Max Console for debug messages

## Step 6: Save as Device

1. File → Save As...
2. Name it `CommandPaletteProto.amxd`
3. Save in the `prototype/` folder

## Troubleshooting

### "js: can't find file"
- Ensure `proto.js` is in the same directory as the `.amxd` file
- Or use the full absolute path in the js object

### Hotkey not working
- Max needs focus to capture keys
- Try clicking on the device first
- Consider using `hi` object for global hotkeys (advanced)

### jsui not displaying
- Check Max Console for errors
- Verify `palette_ui.js` path is correct
- Try: `jsui @filename palette_ui.js @size 400 300`

### Commands not executing
- Open Max Console (Window → Max Console)
- Look for error messages from LOM calls
- Ensure a track is selected for track operations

## File Checklist

Your `prototype/` folder should contain:

```
prototype/
├── CommandPaletteProto.amxd  (you create this)
├── proto.js                   ✓ (provided)
├── palette_ui.js              ✓ (provided)
└── BUILD_INSTRUCTIONS.md      ✓ (this file)
```

## Next Steps

Once you have a working prototype:

1. Test all 10 commands
2. Time the workflow vs mouse
3. Get feedback from 3-5 users
4. Decide: GO / NO-GO / PIVOT

Good luck! 🎹

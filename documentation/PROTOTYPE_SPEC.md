# Ableton Command Palette - Prototype Specification

## Goal
Build a minimal proof-of-concept in 1-2 days to validate:
1. Can we build a usable command palette in Max?
2. Does fuzzy search feel good?
3. Is keyboard-driven workflow faster than mouse?
4. Do people actually want this?

**Time Investment:** 6 hours total  
**Decision Point:** GO / NO-GO / PIVOT

---

## Table of Contents
1. [Prototype Scope](#prototype-scope)
2. [Technical Design](#technical-design)
3. [The 10 Commands](#the-10-commands)
4. [Implementation Guide](#implementation-guide)
5. [Testing Plan](#testing-plan)
6. [Evaluation Criteria](#evaluation-criteria)
7. [Next Steps](#next-steps)

---

## Prototype Scope

### What to Build ✅

**Include:**
- Hotkey trigger (Cmd+Shift+P / Ctrl+Shift+P)
- Floating text input window
- Simple list display (text-based)
- 10 hardcoded commands
- Exact match search only (no fuzzy matching yet)
- Execute 3 working commands via LOM
- Close on Esc/Enter
- Basic keyboard navigation (Up/Down arrows)

### What to Exclude ❌

**Exclude (for now):**
- Fuzzy matching (use exact substring)
- Context awareness
- Track name support
- Device insertion
- Fancy UI styling/themes
- Preferences/settings
- Accessibility features
- Documentation
- Multiple file structure
- JSON command definitions

---

## Technical Design

### File Structure (Minimal)

```
prototype/
├── CommandPaletteProto.amxd      (Max patcher)
└── proto.js                       (All logic in one file)
```

**That's it!** Everything in 2 files.

---

### Max Patcher Design

```
┌─────────────────────────────────────────────┐
│                                             │
│  [key] → [sel 112] → [t b]                 │  Detects 'P' key
│              ↓                              │
│         [js proto.js]                       │  Main logic
│              ↓                              │
│         [prepend set]                       │
│              ↓                              │
│         [jsui 400 300]                      │  UI display
│                                             │
└─────────────────────────────────────────────┘
```

**Components:**
1. **key** object → Detects Cmd/Ctrl+Shift+P
2. **js proto.js** → All command logic (search, execute)
3. **jsui** → Renders palette window

---

### proto.js Structure

**Single file, ~200 lines:**

```javascript
autowatch = 1;

// ============ STATE ============
var commands = [];
var filteredCommands = [];
var searchQuery = "";
var selectedIndex = 0;
var paletteVisible = false;

// ============ INITIALIZATION ============
function loadcommands() {
    // Hardcoded commands
    commands = [
        { 
            id: 1, 
            title: "Play", 
            category: "Transport",
            execute: executePlay 
        },
        { 
            id: 2, 
            title: "Stop", 
            category: "Transport",
            execute: executeStop 
        },
        // ... 8 more commands
    ];
    filteredCommands = commands;
}

// ============ INPUT HANDLING ============
function search(query) {
    searchQuery = query.toLowerCase();
    
    // Simple substring matching
    filteredCommands = commands.filter(function(cmd) {
        return cmd.title.toLowerCase().indexOf(searchQuery) !== -1 ||
               cmd.category.toLowerCase().indexOf(searchQuery) !== -1;
    });
    
    selectedIndex = 0;
    redraw();
}

function keydown(key) {
    if (key === 27) {          // Esc
        hidePalette();
    } else if (key === 13) {   // Enter
        executeSelected();
    } else if (key === 38) {   // Up Arrow
        selectedIndex = Math.max(0, selectedIndex - 1);
        redraw();
    } else if (key === 40) {   // Down Arrow
        selectedIndex = Math.min(filteredCommands.length - 1, selectedIndex + 1);
        redraw();
    }
}

// ============ DISPLAY ============
function redraw() {
    var output = [];
    
    // Search query line
    output.push("Search: " + searchQuery + "_");
    output.push(""); // blank line
    
    // Results (max 10)
    for (var i = 0; i < Math.min(filteredCommands.length, 10); i++) {
        var cmd = filteredCommands[i];
        var prefix = (i === selectedIndex) ? "> " : "  ";
        output.push(prefix + cmd.category + ": " + cmd.title);
    }
    
    // Result count
    if (filteredCommands.length === 0) {
        output.push("");
        output.push("No commands found");
    } else if (filteredCommands.length > 10) {
        output.push("");
        output.push("(" + filteredCommands.length + " total results)");
    }
    
    // Send to jsui
    outlet(0, "display", output.join("\n"));
}

// ============ EXECUTION ============
function executeSelected() {
    if (filteredCommands.length === 0) return;
    
    var cmd = filteredCommands[selectedIndex];
    post("Executing: " + cmd.title + "\n");
    
    try {
        cmd.execute();
        hidePalette();
    } catch(e) {
        post("Error executing command: " + e + "\n");
    }
}

// --- Command Executors ---
function executePlay() {
    var api = new LiveAPI("live_set");
    api.call("start_playing");
}

function executeStop() {
    var api = new LiveAPI("live_set");
    api.call("stop_playing");
}

function executeMetronome() {
    var api = new LiveAPI("live_set");
    var current = api.get("metronome");
    api.set("metronome", current ? 0 : 1);
}

function executeMute() {
    var api = new LiveAPI("live_set view selected_track");
    var currentMute = api.get("mute");
    api.set("mute", currentMute ? 0 : 1);
}

function executeSolo() {
    var api = new LiveAPI("live_set view selected_track");
    var currentSolo = api.get("solo");
    api.set("solo", currentSolo ? 0 : 1);
}

function executeCreateAudioTrack() {
    var api = new LiveAPI("live_set");
    api.call("create_audio_track", -1); // -1 = end
}

function executeDeleteTrack() {
    var api = new LiveAPI("live_set view selected_track");
    var trackIndex = api.get("canonical_parent")[0].split(" ").pop();
    
    if (confirm("Delete track " + trackIndex + "?")) {
        var songAPI = new LiveAPI("live_set");
        songAPI.call("delete_track", trackIndex);
    }
}

function executeAddCompressor() {
    var api = new LiveAPI("live_set view selected_track");
    api.call("insert_device", "Compressor");
}

function executeAddReverb() {
    var api = new LiveAPI("live_set view selected_track");
    api.call("insert_device", "Reverb");
}

function executeBypassDevice() {
    var api = new LiveAPI("live_set view selected_parameter canonical_parent");
    var currentState = api.get("is_active");
    api.set("is_active", currentState ? 0 : 1);
}

// ============ VISIBILITY ============
function showPalette() {
    paletteVisible = true;
    searchQuery = "";
    filteredCommands = commands;
    selectedIndex = 0;
    
    outlet(0, "show");
    redraw();
}

function hidePalette() {
    paletteVisible = false;
    outlet(0, "hide");
}

// ============ INITIALIZATION ============
loadcommands();
```

---

### JSUI Sketch (Simple Text Display)

```javascript
// Minimal jsui for text display
sketch.default2d();
var mgraphics = sketch;

// State
var displayText = "";
var results = [];
var searchQuery = "";
var selectedIndex = 0;

// Colors
var bgColor = [0.1, 0.1, 0.1, 0.95];
var textColor = [0.9, 0.9, 0.9, 1.0];
var highlightColor = [0.3, 0.5, 0.9, 1.0];
var borderColor = [0.3, 0.3, 0.3, 1.0];

function display(text) {
    displayText = text;
    results = text.split("\n");
    bang();
}

function show() {
    // Make visible and focused
    box.message("hidden", 0);
    bang();
}

function hide() {
    box.message("hidden", 1);
}

function paint() {
    with (mgraphics) {
        // Background
        set_source_rgba(bgColor);
        rectangle(0, 0, box.rect[2], box.rect[3]);
        fill();
        
        // Border
        set_source_rgba(borderColor);
        set_line_width(2);
        rectangle(0, 0, box.rect[2], box.rect[3]);
        stroke();
        
        // Text
        set_source_rgba(textColor);
        select_font_face("Monaco");
        set_font_size(12);
        
        var y = 25;
        var lineHeight = 20;
        
        for (var i = 0; i < results.length; i++) {
            var line = results[i];
            
            // Highlight selected line
            if (line.indexOf(">") === 0) {
                set_source_rgba(highlightColor);
                rectangle(5, y - 15, box.rect[2] - 10, 18);
                fill();
                set_source_rgba(textColor);
            }
            
            move_to(10, y);
            show_text(line);
            y += lineHeight;
        }
    }
}

function bang() {
    mgraphics.redraw();
}
```

---

## The 10 Commands

### Command List

```javascript
var commands = [
    // TRANSPORT (3)
    {
        id: 1,
        title: "Play",
        category: "Transport",
        execute: executePlay
    },
    {
        id: 2,
        title: "Stop",
        category: "Transport",
        execute: executeStop
    },
    {
        id: 3,
        title: "Toggle Metronome",
        category: "Transport",
        execute: executeMetronome
    },
    
    // TRACK (4)
    {
        id: 4,
        title: "Mute Selected Track",
        category: "Track",
        execute: executeMute
    },
    {
        id: 5,
        title: "Solo Selected Track",
        category: "Track",
        execute: executeSolo
    },
    {
        id: 6,
        title: "Create Audio Track",
        category: "Track",
        execute: executeCreateAudioTrack
    },
    {
        id: 7,
        title: "Delete Selected Track",
        category: "Track",
        execute: executeDeleteTrack
    },
    
    // DEVICE (3)
    {
        id: 8,
        title: "Add Compressor",
        category: "Device",
        execute: executeAddCompressor
    },
    {
        id: 9,
        title: "Add Reverb",
        category: "Device",
        execute: executeAddReverb
    },
    {
        id: 10,
        title: "Bypass Selected Device",
        category: "Device",
        execute: executeBypassDevice
    }
];
```

### Why These 10?

1. **Transport** - Most basic, everyone uses
2. **Track operations** - Core workflow
3. **Device insertion** - Tests LOM insert_device (new in Live 12)
4. **Mix of simple & complex** - Tests various LOM calls
5. **Covers main categories** - Representative sample

---

## Implementation Guide

### Day 1: Build (4 hours)

#### Hour 1: Max Patcher Setup
**Tasks:**
- [ ] Create new M4L Audio Effect
- [ ] Add `key` object
- [ ] Configure hotkey detection (Cmd+Shift+P)
- [ ] Add `js proto.js` object
- [ ] Add `jsui` object (400x300)
- [ ] Wire them together

**Testing:**
- Press hotkey, verify Max console shows message
- Type in Max console: `js loadcommands` → Should work

#### Hour 2: Create proto.js
**Tasks:**
- [ ] Copy the proto.js code from above
- [ ] Save in Max patch directory
- [ ] Test loadcommands()
- [ ] Test search("play")
- [ ] Verify commands filter correctly

**Testing:**
- In Max console: `js search play`
- Should see filtered results in console

#### Hour 3: Wire Up UI
**Tasks:**
- [ ] Create jsui sketch code
- [ ] Connect js output to jsui
- [ ] Test display updates
- [ ] Test keyboard navigation
- [ ] Debug any rendering issues

**Testing:**
- Palette should open and show commands
- Typing should filter results
- Arrow keys should move selection

#### Hour 4: Implement LOM Execution
**Tasks:**
- [ ] Test executePlay()
- [ ] Test executeMute()
- [ ] Test executeAddCompressor()
- [ ] Fix any LOM errors
- [ ] Add error handling

**Testing:**
- Each command should work
- No Max errors in console
- Commands close palette after execution

### Day 2: Test & Evaluate (2 hours)

#### Hour 1: User Testing
**Tasks:**
- [ ] Record yourself using it
- [ ] Time mouse workflow vs palette
- [ ] Test with 3-5 people
- [ ] Collect feedback
- [ ] Document pain points

**Test Script:**
```
1. Open any Live project
2. Load CommandPaletteProto.amxd
3. Press Cmd+Shift+P
4. Type "play" → Press Enter
5. Press Cmd+Shift+P again
6. Type "mute" → Press Enter
7. Repeat with other commands
```

#### Hour 2: Evaluation & Decision
**Tasks:**
- [ ] Review feedback
- [ ] Answer evaluation questions
- [ ] Make GO/NO-GO decision
- [ ] Document next steps if GO
- [ ] Document learnings if NO-GO

---

## Testing Plan

### Test Scenarios (30 minutes)

#### Scenario 1: Basic Operation
```
Steps:
1. Open Live with any project
2. Load CommandPaletteProto.amxd on any track
3. Press Cmd+Shift+P
4. Palette appears ✓
5. Type "play"
6. See "Play" command highlighted ✓
7. Press Enter
8. Playback starts ✓
9. Palette closes ✓

Success: All ✓
```

#### Scenario 2: Search Filtering
```
Steps:
1. Open palette
2. Type "m"
3. See "Mute" and "Toggle Metronome" ✓
4. Type "mu"
5. See only "Mute Selected Track" ✓
6. Press Up/Down arrows
7. Selection moves ✓
8. Press Esc
9. Palette closes ✓

Success: All ✓
```

#### Scenario 3: Track Operations
```
Steps:
1. Select a track
2. Open palette
3. Type "mute"
4. Execute
5. Track mutes ✓
6. Repeat
7. Track unmutes ✓

Success: All ✓
```

#### Scenario 4: Device Addition
```
Steps:
1. Select a track
2. Open palette
3. Type "comp"
4. Execute "Add Compressor"
5. Compressor appears on track ✓

Success: ✓
```

#### Scenario 5: Speed Test
```
Task: Add Compressor to track

Mouse method:
1. Click track
2. Click Browser
3. Search "compressor"
4. Drag to track
Time: ~8-10 seconds

Palette method:
1. Cmd+Shift+P
2. Type "comp"
3. Enter
Time: ~2-3 seconds

Success: 3-4x faster ✓
```

### Success Criteria

The prototype is successful if:
- [ ] Palette responds instantly (<100ms)
- [ ] Search feels natural
- [ ] Faster than mouse for tested operations
- [ ] No crashes or Max errors
- [ ] 3+ people say "This is useful!"

### Failure Criteria

Abandon if:
- [ ] Max can't handle floating window well
- [ ] jsui is too laggy
- [ ] LOM calls are too slow (>500ms)
- [ ] Keyboard input is janky
- [ ] Nobody finds it useful

---

## Evaluation Criteria

### Usability Questions

After testing, answer these:

1. **Does the palette feel responsive?**
   - [ ] Yes, instant
   - [ ] Mostly, slight lag
   - [ ] No, too slow

2. **Is the search intuitive?**
   - [ ] Yes, found commands easily
   - [ ] Somewhat, took a few tries
   - [ ] No, confusing

3. **Do people understand how to use it?**
   - [ ] Yes, immediately
   - [ ] After quick explanation
   - [ ] No, too complex

4. **Is it faster than mouse workflows?**
   - [ ] Yes, significantly (2-3x)
   - [ ] About the same
   - [ ] No, slower

### Technical Questions

1. **Can Max handle the UI complexity?**
   - [ ] Yes, no issues
   - [ ] Some limitations
   - [ ] No, major problems

2. **Are LOM calls fast enough?**
   - [ ] Yes, instant
   - [ ] Acceptable lag
   - [ ] Too slow

3. **Does it work on both platforms?**
   - [ ] Tested Mac: ✓/✗
   - [ ] Tested Windows: ✓/✗

4. **Any performance issues?**
   - [ ] None
   - [ ] Minor
   - [ ] Major

### Value Questions

1. **Would users actually use this?**
   - [ ] Definitely
   - [ ] Maybe
   - [ ] Probably not

2. **What commands do they request first?**
   - List:

3. **What's confusing or frustrating?**
   - List:

4. **Is it worth 10 weeks of development?**
   - [ ] Yes, definitely
   - [ ] Yes, with changes
   - [ ] No

---

## Evaluation Decision Matrix

### GO ✅

**Proceed with full implementation if:**
- Prototype is responsive and intuitive
- Users express strong interest
- Technical feasibility confirmed
- Faster than mouse workflows
- 3+ testers say "I'd use this daily"

**Next Steps:**
1. Share prototype on r/ableton for feedback
2. Create GitHub repo
3. Begin Phase 1 of full plan
4. Recruit beta testers

### PIVOT 🔄

**Change approach if:**
- Concept good but implementation needs rethinking
- Specific use case more valuable (e.g., just mixing)
- Different UI approach needed
- Should be standalone app, not M4L

**Next Steps:**
1. Document learnings
2. Explore alternative approaches
3. Build new prototype
4. Re-evaluate

### NO-GO ❌

**Abandon if:**
- Max/jsui too limited
- LOM too slow
- Nobody finds it useful
- Faster/better solutions exist

**Next Steps:**
1. Document learnings publicly
2. Share code for others to learn from
3. Move on to other projects

---

## Demo Video Script

### 2-Minute Demo

```
[00:00] "This is the typical workflow: I want to add a compressor..."
        [Show mousing to browser, searching, dragging - 10 seconds]

[00:10] "Now watch this..."
        [Press Cmd+Shift+P, type "comp", press Enter - 2 seconds]

[00:15] "That's 5x faster. And it gets better..."

[00:20] Rapid demos:
        - "play" → Starts playback
        - "mute" → Mutes track
        - "add reverb" → Adds reverb
        - "stop" → Stops playback
        
[00:35] "All keyboard driven. No mouse. No menus."

[00:40] "This is just a prototype with 10 commands..."

[00:50] "Imagine 200+ commands covering everything in Live..."

[01:00] "Track operations, device insertion, mixing, navigation..."

[01:10] "All accessible in 2-3 keystrokes."

[01:20] "Want to see this built?"

[01:30] "Drop a comment or star the repo: [GitHub link]"

[01:40] "Let's make Ableton Live more accessible and faster for everyone."

[End]
```

---

## Tester Feedback Form

### Google Form Questions

1. **How useful is this on a scale of 1-10?**
   - 1 (Not useful) to 10 (Extremely useful)

2. **Would you use this daily?**
   - Yes, definitely
   - Probably
   - Maybe
   - Probably not
   - No

3. **What's the first command you'd want to add?**
   - Open text field

4. **What's confusing about it?**
   - Open text field

5. **How does it compare to your current workflow?**
   - Much faster
   - Slightly faster
   - About the same
   - Slower

6. **What's the biggest pain point in your Ableton workflow?**
   - Open text field

7. **Would you contribute commands/extensions?**
   - Yes
   - Maybe
   - No

8. **Any other feedback?**
   - Open text field

9. **Can we follow up with you?**
   - Email (optional)

---

## Next Steps After Prototype

### If Successful ✅

1. **Share Prototype** (Day 3)
   - Post on r/ableton
   - Post on Ableton forums
   - Tweet with video
   - Collect feedback

2. **Assess Interest** (Week 2)
   - 50+ upvotes → Strong interest
   - 20+ "I'd use daily" → Validated
   - 5+ "I'd contribute" → Community ready

3. **Create Repo** (Week 2)
   - GitHub setup
   - Write README
   - MIT License
   - Issue templates

4. **Begin Phase 1** (Week 3)
   - Follow full implementation plan
   - Start with foundation
   - Recruit beta testers

### If Needs Pivot 🔄

**Technical Issues:**
- jsui too slow → Try simpler text rendering
- LOM too slow → Cache more, optimize queries
- Hotkey conflicts → Allow customization

**UX Issues:**
- Confusing → Simplify, add tutorial
- Not faster → Improve search, more commands
- Wrong use case → Focus on specific workflow

### If Fails ❌

**Document & Share:**
- Write blog post about learnings
- Share code on GitHub
- Explain why it didn't work
- Help others learn from experience

**Move On:**
- Other M4L projects
- Different approach to problem
- Apply learnings elsewhere

---

## Resources & References

### Max/MSP
- [Max Object Reference](https://docs.cycling74.com/reference/)
- [JavaScript in Max](https://docs.cycling74.com/max8/vignettes/jsbasic)
- [jsui Tutorial](https://docs.cycling74.com/max8/vignettes/jsuiobject)

### Live Object Model
- [LOM Documentation](https://docs.cycling74.com/apiref/lom/)
- [Live API Overview](https://docs.cycling74.com/max8/vignettes/live_api_overview)

### Inspiration
- [VS Code Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface)
- [Sublime Text Command Palette](https://www.sublimetext.com/docs/command_palette.html)

---

## Quick Reference

### Hotkey Detection in Max

```
[key]
|
[sel 112]  ← 'P' key
|
[t b]
|
[js proto.js]
```

### Basic LOM Calls

```javascript
// Play/Stop
var api = new LiveAPI("live_set");
api.call("start_playing");
api.call("stop_playing");

// Track Mute
var api = new LiveAPI("live_set view selected_track");
api.set("mute", 1);

// Add Device (Live 12+)
var api = new LiveAPI("live_set view selected_track");
api.call("insert_device", "Compressor");
```

### jsui Basics

```javascript
sketch.default2d();
var mgraphics = sketch;

function paint() {
    with (mgraphics) {
        set_source_rgba(0.1, 0.1, 0.1, 1.0);
        rectangle(0, 0, box.rect[2], box.rect[3]);
        fill();
        
        set_source_rgba(0.9, 0.9, 0.9, 1.0);
        move_to(10, 20);
        show_text("Hello World");
    }
}

function bang() {
    mgraphics.redraw();
}
```

---

## Checklist: Building the Prototype

### Setup
- [ ] Create new M4L Audio Effect
- [ ] Name it "CommandPaletteProto"
- [ ] Save to Desktop

### Max Patcher
- [ ] Add `key` object
- [ ] Add `sel 112` (P key)
- [ ] Add `t b` (trigger)
- [ ] Add `js proto.js`
- [ ] Add `jsui @patching_rect 0 0 400 300`
- [ ] Wire: key → sel → t → js → prepend set → jsui

### JavaScript
- [ ] Create `proto.js` file
- [ ] Copy code from above
- [ ] Save in same folder as patch
- [ ] Test in Max console

### Testing
- [ ] Press Cmd+Shift+P
- [ ] Palette opens
- [ ] Type to search
- [ ] Navigate with arrows
- [ ] Execute with Enter
- [ ] Close with Esc
- [ ] All 10 commands work

### Share
- [ ] Record demo video
- [ ] Take screenshots
- [ ] Write feedback form
- [ ] Post on forums
- [ ] Collect responses

---

## Timeline

```
Day 1:
  Hour 1: Max patcher setup
  Hour 2: proto.js implementation
  Hour 3: UI wiring and testing
  Hour 4: LOM execution

Day 2:
  Hour 1: User testing (5 people)
  Hour 2: Evaluate and decide

Total: 6 hours
```

---

## Expected Outcomes

### Best Case
- Prototype works great
- Users love it
- Clear path to full version
- Community excited

### Likely Case
- Prototype works with issues
- Mixed feedback
- Need some pivots
- Worth continuing

### Worst Case
- Technical roadblocks
- Users not interested
- Better solutions exist
- Not worth pursuing

---

## Contact

**Questions?** Open an issue or discussion on GitHub.

**Updates?** Follow the project or join Discord.

---

**Last Updated:** January 13, 2025  
**Version:** 1.0  
**Status:** Ready to Build

---

Now go build it! 🚀

**Remember:** The goal is to learn and validate, not to build a perfect product. Ship fast, learn fast, decide fast.

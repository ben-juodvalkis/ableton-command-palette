# Ableton Live Command Palette - Full Implementation Plan

## Project Overview
A VS Code-inspired command palette for Ableton Live built as a Max for Live device, providing keyboard-driven access to all Live functionality via fuzzy search.

**License:** MIT Open Source  
**Distribution:** GitHub Releases  
**Target:** Ableton Live 12+ only  
**Development:** Solo project with community contributions welcome  
**Philosophy:** Extensible, well-documented, community-driven

---

## Table of Contents
1. [Phase 1: Foundation & Community Setup](#phase-1-foundation--community-setup-week-1-2)
2. [Phase 2: Core Features + Community Readiness](#phase-2-core-features--community-readiness-week-3-4)
3. [Phase 3: Command Coverage + Community Growth](#phase-3-command-coverage--community-growth-week-5-6)
4. [Phase 4: Intelligence + Accessibility](#phase-4-intelligence--accessibility-week-7-8)
5. [Phase 5: Polish + v1.0 Release](#phase-5-polish--v10-release-week-9-10)
6. [Phase 6: Community-Driven Evolution](#phase-6-community-driven-evolution-ongoing)
7. [Technical Architecture](#technical-architecture)
8. [Command Design Patterns](#command-design-patterns)
9. [Track Name Matching](#track-name-matching)
10. [Deletion Commands](#deletion-commands)
11. [Open Source Best Practices](#open-source-best-practices)
12. [Marketing & Growth Strategy](#marketing--growth-strategy)
13. [Risk Management](#risk-management)
14. [Timeline Overview](#timeline-overview)

---

## Phase 1: Foundation & Community Setup (Week 1-2)

### Goals
- Establish repo and open source practices
- Build extensible architecture
- Prove concept with essential commands

### Deliverables

#### 1.0 Repository Setup
- [ ] Create GitHub repository: `ableton-command-palette`
- [ ] Initialize with MIT license
- [ ] Create comprehensive README.md:
  - [ ] Project description and demo GIF
  - [ ] Installation instructions
  - [ ] Quick start guide
  - [ ] Link to full documentation
  - [ ] Contribution guidelines
  - [ ] Roadmap and known issues
- [ ] Set up GitHub Issues with templates:
  - [ ] Bug report template
  - [ ] Feature request template
  - [ ] Command request template
- [ ] Create CONTRIBUTING.md
- [ ] Create CODE_OF_CONDUCT.md
- [ ] Set up GitHub Discussions for community
- [ ] Add .gitignore for Max files

#### 1.1 Project Structure
```
ableton-command-palette/
├── README.md
├── LICENSE (MIT)
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── .gitignore
├── docs/
│   ├── installation.md
│   ├── user-guide.md
│   ├── developer-guide.md
│   ├── command-reference.md
│   └── extending.md
├── src/
│   ├── CommandPalette.amxd (Max patcher)
│   ├── js/
│   │   ├── CommandRegistry.js
│   │   ├── FuzzyMatcher.js
│   │   ├── LOMInterface.js
│   │   ├── PaletteUI.js
│   │   └── ExtensionLoader.js
│   └── commands/
│       ├── core/
│       │   ├── transport.json
│       │   ├── tracks.json
│       │   ├── devices.json
│       │   └── clips.json
│       └── extensions/
│           └── README.md
├── examples/
│   ├── custom-commands/
│   │   ├── my-workflow.json
│   │   └── custom-devices.json
│   └── scripts/
│       └── batch-operations.js
└── tests/
    └── test-commands.js
```

#### 1.2 Max Patcher Setup
- [ ] Create `CommandPalette.amxd` as Audio Effect
- [ ] Add device info/description
- [ ] Set up `jsui` for palette window
- [ ] Use `live.toggle` for palette trigger (MIDI-mappable, works without focus)
- [ ] Use `v8` object instead of legacy `js` for ES6+ and module support
- [ ] Document patcher wiring with subpatchers for clarity
- [ ] Add "About" panel with version, GitHub link, license

#### 1.2.1 Device API Compatibility
- [ ] Test `create_device` vs `insert_device` on Live 12.0, 12.1+
- [ ] Document working methods for each device category (audio effects, MIDI effects, instruments)
- [ ] Create `DeviceInsertion.js` compatibility module

#### 1.3 Extensible Command System

**Command Definition Format (JSON)**
```json
{
  "id": "track.mute",
  "title": "Mute Track",
  "category": "Track",
  "keywords": ["silence", "quiet", "disable"],
  "description": "Mute the currently selected track",
  "requiresContext": ["selectedTrack"],
  "execute": "track.mute.js",
  "version": "1.0.0",
  "author": "core"
}
```

#### 1.4 Extension Loader
- [ ] Load commands from core and extensions folders
- [ ] Dynamic command executor loading
- [ ] Validation of command definitions
- [ ] Error handling for malformed commands

#### 1.5 Core Command Set (Phase 1)
- [ ] 10 transport commands
- [ ] 10 basic track commands
- [ ] 5 navigation commands
- [ ] Well-documented with inline comments

#### 1.6 Developer Documentation
Create `docs/extending.md`:
- [ ] How to add custom commands
- [ ] Command JSON schema
- [ ] Execution script template
- [ ] LOM API reference
- [ ] Examples and best practices

### Success Criteria
- Repository is public and well-organized
- README is clear and inviting
- Basic palette works with 25 commands
- Extension system is functional
- Documentation enables community contributions

---

## Phase 2: Core Features + Community Readiness (Week 3-4)

### Goals
- Implement fuzzy search
- Polish UI
- Make it easy for others to contribute commands
- First public alpha release

### Deliverables

#### 2.1 Fuzzy Matching Algorithm

**Scoring System:**
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
      
      // Bonus for consecutive matches
      if (i === lastMatchIndex + 1) {
        score += 5;
      }
      
      // Bonus for word boundary
      if (i === 0 || target[i-1] === ' ') {
        score += 3;
      }
      
      lastMatchIndex = i;
      queryIndex++;
    }
  }
  
  return queryIndex === query.length ? score : null;
}
```

**Features:**
- [ ] Character-by-character matching
- [ ] Consecutive character bonus
- [ ] Word boundary bonus
- [ ] Case match bonus
- [ ] Position bonus
- [ ] Sort results by score
- [ ] Test suite with examples

#### 2.2 UI Enhancement
- [ ] Professional, minimal design
- [ ] Theme support structure
- [ ] Responsive layout
- [ ] Loading states
- [ ] Error handling UI
- [ ] Result highlighting (matched characters)
- [ ] Keyboard shortcut display
- [ ] Category grouping visual separators
- [ ] Scrollable results list

#### 2.3 Command Definition Generator

Create `create-command.js` script:
```bash
$ node create-command.js

Command Title: Set Tempo to 120
Category: Transport
Keywords (comma-separated): bpm, speed, tempo
Description: Set the project tempo to 120 BPM
Requires Context: none

✓ Created commands/extensions/tempo-120.json
✓ Created js/executors/tempo-120.js
✓ Added to command registry
```

- [ ] Interactive CLI tool
- [ ] Validates JSON schema
- [ ] Generates boilerplate code
- [ ] Documents in CONTRIBUTING.md

#### 2.4 First Alpha Release (v0.1.0-alpha)
- [ ] Tag release on GitHub
- [ ] Create release notes
- [ ] Build `.amxd` file
- [ ] Upload to GitHub Releases
- [ ] Announce in Ableton forums
- [ ] Post to r/ableton
- [ ] Request feedback on GitHub Discussions

#### 2.5 Contribution Guide
Expand CONTRIBUTING.md:
- [ ] How to report bugs
- [ ] How to request commands
- [ ] How to submit command extensions
- [ ] Code style guidelines
- [ ] Testing requirements
- [ ] PR review process

### Success Criteria
- 50+ core commands implemented
- Fuzzy search is fast (<100ms) and accurate
- 5+ community members show interest
- First PRs from community (even if just docs)
- UI feels professional and polished

---

## Phase 3: Command Coverage + Community Growth (Week 5-6)

### Goals
- Comprehensive command library
- Accept first community contributions
- Build command marketplace

### Deliverables

#### 3.1 Complete Core Commands (200+ commands)

Organized by category in separate JSON files:

**transport.json (15 commands)**
- Play, Stop, Continue
- Record, Overdub, Arrangement Record
- Toggle Metronome, Loop
- Set Tempo, Tap Tempo
- Session/Arrangement view switching
- Enable/disable MIDI/audio recording

**tracks.json (30 commands)**
- Create Audio/MIDI/Return Track
- Delete Track (selected, by number, by name)
- Duplicate Track
- Mute/Solo/Arm Track (selected, by name, by number)
- Set Track Volume/Pan
- Rename Track, Color Track
- Fold/Unfold Track
- Freeze/Flatten Track
- Navigate to Track N (1-20)
- Group/Ungroup Tracks
- Delete All Empty Tracks

**devices.json (50+ commands)**
- Add native devices (all categories):
  - Audio Effects: Compressor, Reverb, EQ Eight, Auto Filter, Delay, etc. (30+)
  - MIDI Effects: Arpeggiator, Chord, Scale, etc. (10+)
  - Instruments: Wavetable, Operator, Drift, Simpler, etc. (15+)
- Delete Device (selected, by name)
- Bypass Device
- Duplicate Device
- Move Device (left/right)
- Show/Hide Device
- Delete All Devices on Track

**clips.json (25 commands)**
- Fire Clip (selected, by position)
- Stop Clip
- Delete Clip
- Duplicate Clip
- Consolidate, Crop
- Loop Selection
- Quantize (various settings)
- Set Loop Length
- Transpose
- Split, Join
- Copy to Arrangement
- Capture MIDI

**scenes.json (15 commands)**
- Fire Scene N
- Stop All Clips
- Insert Scene
- Delete Scene (selected, by number)
- Duplicate Scene
- Capture and Insert Scene
- Set Scene Tempo
- Rename Scene

**mixing.json (20 commands)**
- Set Volume (selected track, by name)
- Set Pan
- Set Send Amount (A/B/C)
- Reset Parameter
- Clear All Solo
- Clear All Mute
- Clear All Arm
- Show/Hide Mixer sections

**navigation.json (15 commands)**
- Jump to Track N
- Next/Previous Track
- Next/Previous Device
- Next/Previous Scene
- Focus Session View
- Focus Arrangement View
- Focus Detail View
- Focus Browser

**view.json (10 commands)**
- Toggle Info View
- Toggle Browser
- Toggle Detail View
- Toggle Mixer
- Toggle In/Out markers
- Zoom In/Out
- Zoom to Selection

**creation.json (20 commands)**
- Insert various track types
- Insert MIDI clip
- Insert audio clip
- Insert scene
- Bounce to audio
- Freeze track
- Flatten track
- Export audio
- Create audio track with template
- Create MIDI track with template

#### 3.2 Command Marketplace Concept
Create `docs/command-marketplace.md`:
- [ ] List of community-contributed command packs
- [ ] Installation instructions for each pack
- [ ] Rating/review system (GitHub stars)
- [ ] Search/browse by category

**Example command packs:**
- **Production Shortcuts** - Speedrun common production tasks
- **Mixing Utilities** - Advanced mixing commands
- **Live Performance** - Scene triggering and looping
- **Sound Design** - Device chain templates
- **Custom Workflows** - User-specific automations

#### 3.3 Command Pack Template
Create template repository: `command-palette-extension-template`
- [ ] Pre-configured structure
- [ ] Example commands
- [ ] README template
- [ ] Installation script
- [ ] GitHub Actions for validation

Users can fork this to create their own packs!

#### 3.4 Wiki Setup
Create GitHub Wiki:
- [ ] FAQ
- [ ] Troubleshooting
- [ ] Command reference (auto-generated from JSON)
- [ ] Video tutorials
- [ ] Community extensions list
- [ ] Known limitations

#### 3.5 Beta Release (v0.5.0-beta)
- [ ] All core commands complete
- [ ] Extension system battle-tested
- [ ] At least 2 community command packs available
- [ ] Video demo on YouTube
- [ ] More aggressive marketing push

### Success Criteria
- 200+ commands available
- 3+ community command packs published
- 50+ GitHub stars
- 10+ community contributors
- Active GitHub Discussions

---

## Phase 4: Intelligence + Accessibility (Week 7-8)

### Goals
- Context-aware filtering
- Full accessibility support
- Internationalization groundwork
- Smart features

### Deliverables

#### 4.1 Context System (Extensible)

**Context Detection:**
```javascript
function getCurrentContext() {
  return {
    selectedTrackIndex: getSelectedTrackIndex(),
    selectedTrackName: getSelectedTrackName(),
    selectedTrackType: getSelectedTrackType(), // audio/midi/return/master
    hasDevice: getSelectedDevice() !== null,
    selectedDeviceName: getSelectedDeviceName(),
    isPlaying: transportIsPlaying(),
    isRecording: transportIsRecording(),
    clipSelected: getSelectedClip() !== null,
    clipType: getClipType(), // midi/audio/null
    sceneSelected: getSelectedScene() !== null,
    viewMode: getViewMode() // session/arrangement
  };
}
```

**Command Context Requirements:**
```json
{
  "id": "clip.quantize",
  "title": "Quantize Clip",
  "requiresContext": {
    "clipSelected": true,
    "clipType": "midi"
  },
  "execute": "clip.quantize.js"
}
```

**Features:**
- [ ] Context detection system
- [ ] Context validators
- [ ] Commands filtered by context
- [ ] Documentation for custom contexts
- [ ] Examples in extension template

#### 4.2 Accessibility (Screen Reader Support)

**Text-to-Speech Announcements:**
```javascript
// macOS
function announceMac(text) {
  max.launchbrowser('say "' + text + '"');
}

// Windows
function announceWin(text) {
  var cmd = 'powershell -Command "Add-Type -AssemblyName System.Speech; ' +
            '$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; ' +
            '$speak.Speak(\'' + text + '\')"';
  max.launchbrowser(cmd);
}
```

**Features:**
- [ ] TTS announcements for:
  - [ ] Palette open/close
  - [ ] Current selection as user navigates
  - [ ] Result count
  - [ ] Command execution confirmation
  - [ ] Error messages
- [ ] Keyboard-only operation
- [ ] High contrast theme
- [ ] Adjustable font sizes
- [ ] Clear focus indicators
- [ ] Test with VoiceOver (macOS)
- [ ] Test with NVDA (Windows)
- [ ] Document accessibility features
- [ ] Accessibility testing guide for contributors

**User Preferences:**
```json
{
  "accessibility": {
    "ttsEnabled": true,
    "speechRate": 1.0,
    "verbosity": "normal", // concise/normal/detailed
    "highContrast": false,
    "fontSize": "medium" // small/medium/large
  }
}
```

#### 4.3 Internationalization Setup
Prepare for community translations:

**String Extraction:**
```json
// i18n/en.json
{
  "palette.title": "Command Palette",
  "palette.placeholder": "Type a command...",
  "palette.noResults": "No commands found",
  "palette.resultCount": "{count} commands shown",
  "category.transport": "Transport",
  "category.track": "Track",
  "category.device": "Device",
  "error.noTrackSelected": "No track selected",
  "confirm.deleteTrack": "Delete track '{name}'?"
}
```

**Features:**
- [ ] Extract all UI strings to JSON files
- [ ] Create translation template
- [ ] Document translation process
- [ ] Set up language switching system
- [ ] Provide example translation (Spanish/French/German)

#### 4.4 Recent Commands & Smart Features

**Recent Command Tracking:**
```javascript
var recentCommands = []; // Max 20

function trackCommandExecution(commandId) {
  // Add to front
  recentCommands.unshift(commandId);
  
  // Keep only last 20
  if (recentCommands.length > 20) {
    recentCommands.pop();
  }
  
  // Persist to pattr
  saveRecentCommands();
}

function boostRecentInResults(results) {
  return results.sort((a, b) => {
    var aRecent = recentCommands.indexOf(a.id);
    var bRecent = recentCommands.indexOf(b.id);
    
    // Recent commands get priority
    if (aRecent !== -1 && bRecent !== -1) {
      return aRecent - bRecent;
    }
    if (aRecent !== -1) return -1;
    if (bRecent !== -1) return 1;
    
    // Fall back to score
    return b.score - a.score;
  });
}
```

**Command Statistics:**
- [ ] Track command usage frequency
- [ ] "Most Used Commands" view
- [ ] Export usage data (optional, privacy-conscious)
- [ ] Suggest commands based on usage patterns

**Smart Parameter Parsing:**
```javascript
// "tempo 120" → Set Tempo to 120
// "mute bass" → Mute track named "Bass"
// "add comp drums" → Add Compressor to "Drums" track
// "delete track 5" → Delete track number 5

function parseCommandWithParameter(query) {
  var tokens = query.split(' ');
  var command = tokens[0];
  var parameter = tokens.slice(1).join(' ');
  
  return {
    command: command,
    parameter: parameter
  };
}
```

### Success Criteria
- Context filtering works intelligently
- Fully accessible to screen reader users
- Translation system ready
- Smart features enhance UX
- Recent commands boost productivity

---

## Phase 5: Polish + v1.0 Release (Week 9-10)

### Goals
- Production-ready release
- Comprehensive documentation
- Marketing and community building

### Deliverables

#### 5.1 Performance Optimization

**Profiling:**
- [ ] Profile fuzzy search algorithm
- [ ] Profile LOM query performance
- [ ] Profile UI rendering
- [ ] Identify bottlenecks

**Optimizations:**
- [ ] Cache LOM queries
- [ ] Debounce search input (50ms)
- [ ] Virtual scrolling for large result lists
- [ ] Lazy-load command executors
- [ ] Minimize Live API calls
- [ ] Test with 500+ commands
- [ ] Test with 100+ track projects

**Performance Targets:**
- [ ] <100ms palette open time
- [ ] <50ms search response time
- [ ] <5MB device size
- [ ] <1% CPU when idle
- [ ] <5% CPU when actively searching

#### 5.2 Comprehensive Documentation

**User Guide** (`docs/user-guide.md`):
- [ ] Installation instructions
- [ ] Quick start tutorial
- [ ] Keyboard shortcuts reference
- [ ] Command syntax guide
- [ ] Tips and tricks
- [ ] Troubleshooting
- [ ] Screenshots and GIFs

**Developer Guide** (`docs/developer-guide.md`):
- [ ] Architecture overview
- [ ] How to add commands
- [ ] LOM API reference
- [ ] Extension development
- [ ] Testing guidelines
- [ ] Code examples

**Command Reference** (`docs/command-reference.md`):
- [ ] Auto-generated from command JSON
- [ ] Organized by category
- [ ] Search functionality
- [ ] Keyboard shortcut listing

**Video Tutorials:**
- [ ] Getting Started (3 min)
- [ ] Power User Tips (5 min)
- [ ] Creating Custom Commands (10 min)
- [ ] Accessibility Features (5 min)

#### 5.3 Testing & QA

**Manual Testing:**
- [ ] Test all 200+ commands
- [ ] Cross-platform testing (Mac/Win)
- [ ] Test with Live 12.0, 12.1, 12.2, 12.3+
- [ ] Load testing (large projects, 500+ commands)
- [ ] Accessibility testing (VoiceOver, NVDA)
- [ ] Edge case testing
- [ ] Error handling testing

**Community Beta Testing:**
- [ ] Recruit 10-20 beta testers
- [ ] Create testing checklist
- [ ] Collect feedback via form
- [ ] Fix critical bugs
- [ ] Iterate based on feedback

**Testing Checklist:**
```markdown
- [ ] Palette opens on hotkey
- [ ] Search filters results correctly
- [ ] Fuzzy matching works as expected
- [ ] Commands execute successfully
- [ ] No Max errors in console
- [ ] UI is responsive
- [ ] Keyboard navigation works
- [ ] Context filtering works
- [ ] Recent commands boost works
- [ ] TTS works (if enabled)
- [ ] Can be closed with Esc
- [ ] Works in Session view
- [ ] Works in Arrangement view
- [ ] Works with multiple monitors
```

#### 5.4 v1.0.0 Release

**Release Preparation:**
- [ ] Tag stable release on GitHub
- [ ] Comprehensive release notes
- [ ] Full changelog from v0.1.0
- [ ] Update all documentation
- [ ] Final code review
- [ ] Clean up commented code
- [ ] Verify licensing

**Release Notes Template:**
```markdown
# Ableton Live Command Palette v1.0.0

🎉 **First stable release!**

## What's New
- 200+ commands covering all major Live workflows
- Intelligent fuzzy search with context awareness
- Full accessibility support (VoiceOver, NVDA)
- Extensible command system for community contributions
- High contrast theme for visual accessibility
- Recent command tracking and boosting

## Installation
1. Download `CommandPalette.amxd`
2. Drag into any track in Live 12
3. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Win)

## Documentation
- [User Guide](docs/user-guide.md)
- [Developer Guide](docs/developer-guide.md)
- [Command Reference](docs/command-reference.md)

## Known Issues
- Max for Live devices not yet supported
- VST/AU plugins not yet supported
- See [Issues](https://github.com/user/ableton-command-palette/issues)

## Contributing
This is an open source project! Contributions welcome.
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
```

**Announcement Strategy:**
- [ ] Submit to maxforlive.com
- [ ] Post on r/ableton with video
- [ ] Post on r/edmproduction
- [ ] Post on r/MaxMSP
- [ ] Ableton forums announcement
- [ ] Lines forum (llllllll.co)
- [ ] Twitter/X with demo GIF
- [ ] YouTube demo video
- [ ] Email Ableton community team
- [ ] Relevant Discord servers

#### 5.5 Community Infrastructure

**Discord Server (Optional):**
- [ ] Create server
- [ ] Set up channels (#general, #support, #development, #extensions)
- [ ] Add rules and guidelines
- [ ] Invite initial members

**Community Engagement:**
- [ ] "Command of the Month" highlight
- [ ] Showcase community extensions
- [ ] Contributor recognition in README
- [ ] "Hall of Fame" for top contributors

**Support Structure:**
- [ ] GitHub Discussions for Q&A
- [ ] Issue triage workflow
- [ ] PR review guidelines
- [ ] Response time commitments

**Sustainability:**
- [ ] GitHub Sponsors setup (optional)
- [ ] "Buy me a coffee" link
- [ ] Clear message: Project stays free regardless

### Success Criteria
- v1.0 is stable and polished
- Zero critical bugs
- Documentation is comprehensive
- 100+ GitHub stars within first month
- Active community engagement
- Regular contributions

---

## Phase 6: Community-Driven Evolution (Ongoing)

### Goals
- Sustain and grow community
- Regular releases
- Feature development based on feedback

### Deliverables

#### 6.1 Regular Release Cycle

**Release Schedule:**
- **Patch releases** (v1.0.x): Bug fixes, every 2-4 weeks
- **Minor releases** (v1.x.0): New commands, features, every 2-3 months
- **Major releases** (vX.0.0): Breaking changes, as needed

**Release Process:**
- [ ] Create release branch
- [ ] Run full test suite
- [ ] Update version numbers
- [ ] Update CHANGELOG.md
- [ ] Tag release
- [ ] Build distribution package
- [ ] Upload to GitHub Releases
- [ ] Announce on all channels
- [ ] Monitor for issues

#### 6.2 Community Management

**Weekly Tasks:**
- [ ] Triage new issues
- [ ] Review open PRs
- [ ] Respond to discussions
- [ ] Update roadmap

**Monthly Tasks:**
- [ ] Community update post
- [ ] Feature/extension highlight
- [ ] Contributor recognition
- [ ] Analytics review

**Quarterly Tasks:**
- [ ] Roadmap planning
- [ ] Community survey
- [ ] Major feature development
- [ ] Documentation review

#### 6.3 Feature Roadmap (Community-Voted)

Use GitHub Discussions polls to prioritize features:

**Potential Future Features:**
- [ ] Max for Live device support (via `live.drop`)
- [ ] VST/AU plugin support
- [ ] Command recording/macros
- [ ] Push integration
- [ ] OSC/MIDI remote control
- [ ] Cloud sync for preferences
- [ ] Mobile companion app
- [ ] AI-powered command suggestions
- [ ] Workflow templates
- [ ] Command chaining
- [ ] Conditional commands
- [ ] Time-based automation

#### 6.4 Extension Ecosystem Growth

**Featured Extension Program:**
- [ ] Monthly featured extension
- [ ] Showcase on main README
- [ ] Interview with creator
- [ ] Tutorial for using extension

**Extension Development:**
- [ ] Workshops/webinars
- [ ] Bounties for requested extensions (optional)
- [ ] Partnership with M4L developers
- [ ] Integration guides for common tools

**Quality Standards:**
- [ ] Extension validation checklist
- [ ] Code review for featured extensions
- [ ] Testing requirements
- [ ] Documentation requirements

#### 6.5 Analytics & Improvement (Privacy-First)

**Optional, Opt-in Telemetry:**
```json
{
  "telemetry": {
    "enabled": false, // Default off
    "anonymous": true,
    "collected": [
      "command_usage_count",
      "search_performance",
      "error_reports"
    ]
  }
}
```

**Privacy Policy:**
- [ ] Clear opt-in
- [ ] No personal data
- [ ] Aggregated statistics only
- [ ] Easy opt-out
- [ ] Data deletion on request

### Success Criteria
- Active, healthy community
- Regular contributions (5+ per month)
- Growing extension ecosystem (20+ extensions)
- Sustainable maintenance model
- Tool becomes indispensable for Live users

---

## Technical Architecture

### Overview

```
User Input (MIDI-mapped key or controller)
         ↓
┌────────────────────┐
│   live.toggle      │ ← MIDI-mappable in Live (works without focus)
└────────────────────┘
         ↓
┌────────────────────┐
│  Palette UI (jsui) │ ← Floating window
│  - Search input    │
│  - Results list    │
└────────────────────┘
         ↓
┌────────────────────┐
│  Command Registry  │ ← Loaded from JSON
│  - Core commands   │
│  - Extension cmds  │
└────────────────────┘
         ↓
┌────────────────────┐
│  Fuzzy Matcher     │ ← Scores & filters
│  - Scoring algo    │
│  - Context filter  │
└────────────────────┘
         ↓
┌────────────────────┐
│  Command Executor  │ ← Calls LOM
│  - LOM interface   │
│  - Error handling  │
└────────────────────┘
         ↓
┌────────────────────┐
│  Live Object Model │ ← Ableton's API
└────────────────────┘
```

### Core Modules

**Note:** Using `v8` object with ES modules for modern JavaScript support.

```
src/
├── CommandPalette.amxd
├── main.js                    ← v8 entry point
├── modules/
│   ├── CommandRegistry.js     ← ES modules (import/export)
│   ├── FuzzyMatcher.js
│   ├── LOMInterface.js
│   ├── DeviceInsertion.js     ← Compatibility layer for device APIs
│   └── PaletteUI.js
└── commands/
    └── core/
        └── *.json
```

#### CommandRegistry.js
```javascript
// Loads and manages all commands (ES module)
export class CommandRegistry {
  loadCommands() - Load from JSON files
  registerCommand() - Add command to registry
  getCommandById() - Retrieve specific command
  getAllCommands() - Get all commands
  getCommandsByCategory() - Filter by category
}
```

#### FuzzyMatcher.js
```javascript
// Fuzzy search algorithm (ES module)
export class FuzzyMatcher {
  fuzzyMatch(query, target) - Score a single match
  fuzzySearch(query, commands) - Search all commands
  scoreCommand() - Calculate relevance score
  sortResults() - Sort by score and recency
}
```

#### LOMInterface.js
```javascript
// Wrapper for Live Object Model (ES module)
export class LOMInterface {
  getCurrentContext() - Get current Live state
  getSelectedTrack() - Get selected track info
  getTrackByName(name) - Find track by name
  executeCommand(commandId, params) - Run command
  cacheQuery() - Cache LOM results
}
```

#### DeviceInsertion.js
```javascript
// Compatibility layer for device insertion APIs (ES module)
export class DeviceInsertion {
  insertDevice(trackApi, deviceName) - Insert device with version-appropriate method
  getAvailableDevices() - List insertable devices
  supportsDeviceType(type) - Check if device type is supported
}
```

#### PaletteUI.js
```javascript
// UI controller (ES module)
export class PaletteUI {
  show() - Display palette
  hide() - Close palette
  updateResults(results) - Refresh display
  handleKeyboard(key) - Process keyboard input
  render() - Draw UI
}
```

#### ExtensionLoader.js
```javascript
// Extension management (ES module)
export class ExtensionLoader {
  loadExtensions() - Load community commands
  validateCommand() - Check command schema
  registerExtension() - Add extension commands
  getExtensionCommands() - List extension commands
}
```

### Data Flow

**Opening Palette:**
1. User presses Cmd+Shift+P
2. Max detects hotkey
3. PaletteUI.show() called
4. Context gathered from LOMInterface
5. Commands filtered by context
6. Recent commands loaded
7. UI rendered with empty search

**Searching:**
1. User types characters
2. Each keystroke triggers search
3. FuzzyMatcher.fuzzySearch() called
4. Results scored and sorted
5. Context filter applied
6. Results passed to UI
7. UI re-renders (debounced 50ms)

**Executing Command:**
1. User selects command (Enter)
2. Command executor loaded
3. Parameters parsed
4. Context validated
5. LOM commands executed
6. Result announced (TTS if enabled)
7. Palette closed
8. Recent commands updated

### File System Organization

```
commands/
├── core/
│   ├── transport.json      [15 commands]
│   ├── tracks.json         [30 commands]
│   ├── devices.json        [50 commands]
│   ├── clips.json          [25 commands]
│   ├── scenes.json         [15 commands]
│   ├── mixing.json         [20 commands]
│   ├── navigation.json     [15 commands]
│   ├── view.json           [10 commands]
│   └── creation.json       [20 commands]
└── extensions/
    └── README.md

js/executors/
├── transport/
│   ├── play.js
│   ├── stop.js
│   └── ...
├── tracks/
│   ├── mute.js
│   ├── solo.js
│   └── ...
└── devices/
    ├── add-device.js
    ├── delete-device.js
    └── ...
```

---

## Command Design Patterns

### Basic Command Structure

```json
{
  "id": "track.mute",
  "title": "Mute Track",
  "category": "Track",
  "keywords": ["silence", "quiet", "disable", "turn off"],
  "description": "Mute the currently selected track",
  "requiresContext": {
    "selectedTrack": true,
    "notMasterTrack": true
  },
  "destructive": false,
  "requiresConfirmation": false,
  "supportsUndo": true,
  "keybinding": "0",
  "execute": "track.mute.js",
  "version": "1.0.0",
  "author": "core"
}
```

### Parameterized Commands

```json
{
  "id": "tempo.set",
  "title": "Set Tempo to {bpm}",
  "category": "Transport",
  "keywords": ["bpm", "speed", "tempo"],
  "description": "Set the project tempo",
  "acceptsParameter": {
    "type": "number",
    "min": 20,
    "max": 999,
    "default": 120,
    "placeholder": "BPM"
  },
  "execute": "tempo.set.js"
}
```

### Track Name Commands

```json
{
  "id": "track.mute.byname",
  "title": "Mute '{trackName}'",
  "category": "Track",
  "keywords": ["silence", "quiet"],
  "description": "Mute a track by name",
  "acceptsParameter": {
    "type": "trackname",
    "fuzzyMatch": true
  },
  "execute": "track.mute.js"
}
```

### Bulk Commands

```json
{
  "id": "track.delete.empty",
  "title": "Delete All Empty Tracks",
  "category": "Track",
  "keywords": ["clean", "cleanup", "remove", "unused"],
  "description": "Remove all tracks with no clips or devices",
  "destructive": true,
  "requiresConfirmation": false,
  "supportsUndo": true,
  "execute": "track.delete.empty.js"
}
```

### Device Commands

```json
{
  "id": "device.add.compressor",
  "title": "Add Compressor",
  "category": "Device",
  "keywords": ["comp", "dynamics", "compression"],
  "description": "Insert Compressor device on selected track",
  "requiresContext": {
    "selectedTrack": true
  },
  "deviceType": "audio_effect",
  "deviceName": "Compressor",
  "execute": "device.add.js"
}
```

---

## Track Name Matching

### Why Track Names Matter

Users think in track names, not numbers:
- "delete bass" → Delete track named "Bass"
- "mute drums" → Mute track named "Drums"
- "add comp vocals" → Add Compressor to "Vocals"

### Implementation

#### Track Name Indexing
```javascript
function indexTrackNames() {
    var trackIndex = {};
    var songAPI = new LiveAPI("live_set");
    var trackCount = songAPI.get("tracks").length;
    
    for (var i = 0; i < trackCount; i++) {
        var trackAPI = new LiveAPI("live_set tracks " + i);
        var trackName = trackAPI.get("name")[0];
        
        trackIndex[trackName.toLowerCase()] = {
            index: i,
            name: trackName,
            type: trackAPI.get("has_midi_input") ? "MIDI" : "Audio",
            color: trackAPI.get("color"),
            muted: trackAPI.get("mute"),
            solo: trackAPI.get("solo")
        };
    }
    
    return trackIndex;
}
```

#### Fuzzy Track Name Matching
```javascript
function findTracksByName(query) {
    var tracks = indexTrackNames();
    var matches = [];
    
    Object.keys(tracks).forEach(function(trackName) {
        var score = fuzzyMatch(query, trackName);
        if (score !== null) {
            matches.push({
                track: tracks[trackName],
                score: score
            });
        }
    });
    
    // Sort by score
    matches.sort((a, b) => b.score - a.score);
    
    return matches.map(m => m.track);
}
```

### Command Syntax Support

```
[command] [track name]
- "mute drums"
- "solo bass"
- "delete vocals"
- "add reverb guitar"

[command] [track number]
- "mute track 3"
- "solo 5"
- "delete track 12"

[command] [device] [track name]
- "add compressor drums"
- "add eq vocals"
- "bypass reverb guitar"
```

### Example Results

**User types: "mute bass"**
```
┌─────────────────────────────────────────────────────┐
│ mute bass_                                          │
├─────────────────────────────────────────────────────┤
│ > Track: Mute "Bass"                       M        │
│   Track 4 • Currently unmuted • Audio               │
│                                                      │
│   Track: Mute "Sub Bass"                            │
│   Track 7 • Currently unmuted • Audio               │
│                                                      │
│   Track: Mute "Bass Synth"                          │
│   Track 12 • Currently unmuted • MIDI               │
│                                                      │
│ 3 tracks match "bass"                               │
└─────────────────────────────────────────────────────┘
```

---

## Deletion Commands

### Command Categories

#### Device Deletion
```json
[
  {
    "id": "device.delete.selected",
    "title": "Delete Selected Device",
    "keywords": ["remove", "clear"],
    "requiresContext": { "deviceSelected": true },
    "destructive": false,
    "requiresConfirmation": false,
    "supportsUndo": true
  },
  {
    "id": "device.delete.all",
    "title": "Delete All Devices on Track",
    "keywords": ["remove", "clear", "reset"],
    "requiresContext": { "trackSelected": true },
    "destructive": true,
    "requiresConfirmation": true
  },
  {
    "id": "device.delete.after",
    "title": "Delete All Devices After This",
    "keywords": ["remove", "clear", "right"],
    "requiresContext": { "deviceSelected": true },
    "destructive": true,
    "requiresConfirmation": true
  },
  {
    "id": "device.delete.before",
    "title": "Delete All Devices Before This",
    "keywords": ["remove", "clear", "left"],
    "requiresContext": { "deviceSelected": true },
    "destructive": true,
    "requiresConfirmation": true
  }
]
```

#### Track Deletion
```json
[
  {
    "id": "track.delete.selected",
    "title": "Delete Selected Track",
    "keywords": ["remove"],
    "requiresContext": {
      "trackSelected": true,
      "notMasterTrack": true
    },
    "destructive": true,
    "requiresConfirmation": true
  },
  {
    "id": "track.delete.specific",
    "title": "Delete Track {n}",
    "acceptsParameter": {
      "type": "number",
      "min": 1,
      "max": 999
    },
    "destructive": true,
    "requiresConfirmation": true
  },
  {
    "id": "track.delete.byname",
    "title": "Delete Track '{name}'",
    "acceptsParameter": {
      "type": "trackname",
      "fuzzyMatch": true
    },
    "destructive": true,
    "requiresConfirmation": true
  },
  {
    "id": "track.delete.empty",
    "title": "Delete All Empty Tracks",
    "keywords": ["clean", "cleanup"],
    "destructive": false,
    "requiresConfirmation": false
  }
]
```

#### Clip Deletion
```json
[
  {
    "id": "clip.delete.selected",
    "title": "Delete Selected Clip",
    "keywords": ["remove"],
    "requiresContext": { "clipSelected": true },
    "destructive": false,
    "requiresConfirmation": false
  },
  {
    "id": "clip.delete.all.track",
    "title": "Delete All Clips on Track",
    "keywords": ["clear", "remove"],
    "requiresContext": { "trackSelected": true },
    "destructive": true,
    "requiresConfirmation": true
  },
  {
    "id": "clip.delete.empty",
    "title": "Delete All Empty Clips",
    "keywords": ["clean", "cleanup"],
    "destructive": false,
    "requiresConfirmation": false
  }
]
```

#### Scene Deletion
```json
[
  {
    "id": "scene.delete.selected",
    "title": "Delete Selected Scene",
    "keywords": ["remove"],
    "requiresContext": { "sceneSelected": true },
    "destructive": true,
    "requiresConfirmation": true
  },
  {
    "id": "scene.delete.all",
    "title": "Delete All Scenes",
    "keywords": ["remove", "clear"],
    "destructive": true,
    "requiresConfirmation": true,
    "warningLevel": "extreme"
  }
]
```

### Confirmation System

#### Confirmation Dialog
```javascript
function confirmDeletion(item) {
  var message = "Delete " + item.type + " '" + item.name + "'?\n\n";
  message += "This will permanently delete:\n";
  
  if (item.clips) {
    message += "• " + item.clips + " clips\n";
  }
  if (item.devices) {
    message += "• " + item.devices + " devices\n";
  }
  if (item.automation) {
    message += "• All automation\n";
  }
  
  if (!item.supportsUndo) {
    message += "\nThis action cannot be undone with Ctrl+Z";
  }
  
  return confirm(message);
}
```

#### Warning Levels
```javascript
var warningIcons = {
  none: "",
  caution: "⚠️",
  danger: "🔴",
  extreme: "🔴🔴"
};

function getWarningLevel(command) {
  if (command.warningLevel) {
    return command.warningLevel;
  }
  if (command.destructive && !command.supportsUndo) {
    return "danger";
  }
  if (command.destructive) {
    return "caution";
  }
  return "none";
}
```

### Context-Aware Deletion

**When Device is Selected:**
```
┌─────────────────────────────────────────────────────┐
│ del_                                                │
├─────────────────────────────────────────────────────┤
│ > Device: Delete "Compressor"              Cmd+Del  │
│   Remove from Track 3 "Drums"                       │
│                                                      │
│   Device: Delete All Devices After This             │
│   Remove everything right of Compressor             │
│                                                      │
│   Device: Delete All Devices Before This            │
│   Remove everything left of Compressor              │
└─────────────────────────────────────────────────────┘
```

**When Track is Selected:**
```
┌─────────────────────────────────────────────────────┐
│ del_                                                │
├─────────────────────────────────────────────────────┤
│ > Track: Delete "Drums"                    Cmd+Del  │
│   Remove track and all contents                     │
│                                                      │
│   Track: Delete All Clips on Track                  │
│   Clear all clip slots, keep track                  │
│                                                      │
│   Track: Delete All Devices on Track                │
│   Remove all devices, keep track                    │
└─────────────────────────────────────────────────────┘
```

---

## Open Source Best Practices

### Code Quality
- [ ] Consistent code style (ESLint/Prettier)
- [ ] Inline documentation (JSDoc)
- [ ] Clear function/variable names
- [ ] Modular, testable code
- [ ] Example usage in comments
- [ ] Error handling throughout
- [ ] No hardcoded values

### Community Health
- [ ] Respond to issues within 48 hours
- [ ] Welcome first-time contributors
- [ ] Recognize contributions in README
- [ ] Maintain friendly, inclusive tone
- [ ] Clear roadmap and expectations
- [ ] Regular project updates
- [ ] Celebrate milestones

### Documentation
- [ ] Keep docs in sync with code
- [ ] Document breaking changes
- [ ] Migration guides for major versions
- [ ] Examples for common use cases
- [ ] FAQ from real user questions
- [ ] Troubleshooting guides
- [ ] Video tutorials

### Testing
- [ ] Automated tests where possible
- [ ] Manual testing checklist
- [ ] Beta testing with community
- [ ] Regression testing for releases
- [ ] Performance benchmarks
- [ ] Cross-platform testing

### Licensing
- [ ] MIT License clearly stated
- [ ] License file in repo
- [ ] Copyright notices in code
- [ ] Third-party licenses documented
- [ ] Clear contribution agreement

---

## Marketing & Growth Strategy

### Launch Strategy (v1.0)

**Week Before Release:**
- [ ] Tease on social media
- [ ] Preview video on YouTube
- [ ] Reach out to music production YouTubers
- [ ] Create press kit (screenshots, description, features)
- [ ] Draft announcement posts

**Release Week:**
- [ ] Post on r/ableton, r/edmproduction, r/MaxMSP
- [ ] Submit to Ableton forums
- [ ] Post on Lines forum (llllllll.co)
- [ ] Tweet with demo GIF
- [ ] Email Ableton community team
- [ ] Post on relevant Discord servers
- [ ] Submit to maxforlive.com

**Post-Release:**
- [ ] Respond to all comments/questions
- [ ] Share user success stories
- [ ] Create tutorial content
- [ ] Engage with feedback
- [ ] Weekly progress updates

### Content Strategy

**YouTube:**
- Tutorial series (Getting Started, Power Tips, Custom Commands)
- Command highlights (weekly shorts)
- Workflow demos
- Community extension showcases

**Blog Posts:**
- Development journey
- Technical deep-dives
- Behind the scenes
- Community spotlights

**Social Media:**
- Tips and tricks
- Keyboard shortcuts
- Community extensions
- User testimonials

**Forums:**
- Answer questions
- Gather feedback
- Share updates
- Build relationships

### Partnerships

- [ ] Reach out to popular M4L developers
- [ ] Collaborate with Ableton educators
- [ ] Partner with production tutorial channels
- [ ] Cross-promote with complementary tools
- [ ] Guest posts on music production blogs

---

## Risk Management

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| LOM API changes in Live updates | Medium | High | Test with beta versions, maintain compatibility layer |
| Performance issues with large projects | Medium | Medium | Aggressive optimization, caching, lazy loading |
| Extension conflicts | Low | Medium | Sandboxing, validation, error handling |
| Max/MSP limitations | Low | High | Document limitations clearly, provide workarounds |
| Platform-specific bugs | Medium | Medium | Cross-platform testing, platform-specific code paths |
| V8 module loading issues | Low | Medium | Address if issues arise during implementation |
| Device insertion API differences | Medium | Medium | DeviceInsertion.js compatibility layer, test across Live versions |

### Community Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Low adoption | Medium | High | Marketing, education, partnerships |
| Toxic community members | Low | Medium | Code of conduct, moderation |
| Contributor burnout | Medium | Medium | Recognize work, set boundaries, recruit maintainers |
| Abandoned extensions | Medium | Low | Quality guidelines, featured list curation |
| Feature requests overwhelming | High | Low | Clear roadmap, prioritization process |

### Maintenance Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Solo developer burnout | High | High | Set sustainable pace, recruit co-maintainers |
| Time constraints | High | Medium | Automate where possible, community contributions |
| Loss of interest | Low | High | Build community ownership, document everything |
| Feature creep | High | Medium | Stick to roadmap, say no to scope creep |
| Breaking Live updates | Low | High | Stay informed on Live development, quick updates |

---

## Timeline Overview

### Visual Timeline

```
Week 1-2:  Foundation & Setup         [████░░░░░░] 20%
Week 3-4:  Core Features + Alpha      [████████░░] 40%
Week 5-6:  Command Coverage + Beta    [██████████] 60%
Week 7-8:  Intelligence + Accessibility [██████████] 80%
Week 9-10: Polish + v1.0 Release      [██████████] 100%
Ongoing:   Community Evolution         [∞]
```

### Milestones

| Week | Milestone | Deliverable |
|------|-----------|-------------|
| 2 | Foundation Complete | Repo setup, basic palette, 25 commands |
| 4 | Alpha Release | Fuzzy search, 50 commands, extension system |
| 6 | Beta Release | 200 commands, community packs, marketplace |
| 8 | Feature Complete | Context-aware, accessible, intelligent |
| 10 | v1.0 Release | Production-ready, documented, marketed |
| +1 month | Community Established | 100+ stars, active contributors |
| +3 months | Ecosystem Growing | 10+ extensions, regular releases |
| +6 months | Mature Project | 500+ users, sustainable maintenance |

### Phase Dependencies

```
Phase 1 (Foundation)
    ↓
Phase 2 (Core Features) ← Requires Phase 1 complete
    ↓
Phase 3 (Command Coverage) ← Requires Phase 2 complete
    ↓
Phase 4 (Intelligence) ← Can parallelize with Phase 3
    ↓
Phase 5 (Polish) ← Requires all previous phases
    ↓
Phase 6 (Evolution) ← Ongoing, builds on v1.0
```

---

## Getting Started

### Pre-Development Checklist
- [x] Review and approve implementation plan
- [ ] Set up development environment (Live 12, Max 8, Git)
- [ ] Create GitHub repository
- [ ] Write initial README
- [ ] Set up issue templates
- [ ] Choose code editor (VS Code recommended)

### Week 1 Action Items
- [ ] Initialize Max patcher
- [ ] Create basic command structure
- [ ] Implement hotkey trigger
- [ ] Get 5 commands working
- [ ] Invite 3 friends to test
- [ ] Document initial learnings

### Week 2 Action Items
- [ ] Add 20 more commands
- [ ] Create extension template
- [ ] Write developer docs
- [ ] Tag alpha release
- [ ] Share with small group
- [ ] Gather initial feedback

---

## Success Metrics

### Technical Metrics
- [ ] <100ms search response time
- [ ] <5MB device size
- [ ] <1% CPU usage when idle
- [ ] Zero critical bugs in stable release
- [ ] 200+ commands available
- [ ] Works on Mac and Windows

### Community Metrics
- [ ] 500+ GitHub stars (Year 1)
- [ ] 50+ contributors
- [ ] 10+ community extensions
- [ ] 1000+ active users
- [ ] Active discussions (10+ posts/week)

### Impact Metrics
- [ ] Featured by Ableton
- [ ] Mentioned in production tutorials
- [ ] Used by professional producers
- [ ] High fork rate (indicates extensibility)
- [ ] Positive reviews (>90%)

---

## Contact & Support

### Project Maintainer
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com
- Discord: YourUsername#1234

### Resources
- **Repository:** https://github.com/yourusername/ableton-command-palette
- **Documentation:** https://github.com/yourusername/ableton-command-palette/tree/main/docs
- **Discussions:** https://github.com/yourusername/ableton-command-palette/discussions
- **Issues:** https://github.com/yourusername/ableton-command-palette/issues

### Get Involved
- Report bugs or request features
- Contribute commands or extensions
- Improve documentation
- Help answer questions
- Share your workflows
- Spread the word!

---

## Appendix

### Additional Resources
- [Ableton Live Object Model Documentation](https://docs.cycling74.com/apiref/lom/)
- [Max for Live API Overview](https://docs.cycling74.com/max8/vignettes/live_api_overview)
- [VS Code Command Palette Source](https://github.com/microsoft/vscode)
- [Fuzzy Search Algorithms](https://en.wikipedia.org/wiki/Approximate_string_matching)

### Inspiration
- VS Code Command Palette
- Sublime Text Command Palette
- Spotlight (macOS)
- Alfred App
- Raycast

### License
This implementation plan is released under MIT License.
Copyright (c) 2025 [Your Name]

---

**Last Updated:** January 13, 2025  
**Version:** 1.0  
**Status:** Ready for Development

---

Let's build something amazing! 🚀

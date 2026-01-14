/**
 * Ableton Command Palette - Main Entry Point
 *
 * v8 entry point with CommonJS modules for Max for Live.
 * Handles palette state, coordinates between UI and command execution.
 */

const { CommandRegistry } = require('./core/CommandRegistry.js');
const { FuzzyMatcher } = require('./core/FuzzyMatcher.js');
const { LOMInterface } = require('./core/LOMInterface.js');

// Max v8 globals
inlets = 1;
outlets = 2; // outlet 0: to v8ui, outlet 1: bang when palette closes

// State
let paletteVisible = false;
let searchQuery = "";
let selectedIndex = 0;
let filteredCommands = [];
let currentContext = null;

// Core modules
const registry = new CommandRegistry();
const matcher = new FuzzyMatcher();
const lom = new LOMInterface();

// ============================================================================
// INITIALIZATION
// ============================================================================

function loadbang() {
    post("Command Palette v8 loading...\n");

    // Load command definitions
    loadCommands();

    // Initialize display
    filteredCommands = registry.getAll();
    redraw();

    post(`Command Palette loaded with ${registry.getAll().length} commands\n`);
}

function loadCommands() {
    // Load command JSON files
    // Note: In v8, we can use dynamic imports or require
    // For now, we'll use a static approach with inline loading

    try {
        // Phase 1 commands
        registry.loadFromJSON('transport', transportCommands);
        registry.loadFromJSON('tracks', trackCommands);
        registry.loadFromJSON('navigation', navigationCommands);

        // Phase 2 commands
        registry.loadFromJSON('devices', deviceCommands);
        registry.loadFromJSON('clips', clipCommands);
        registry.loadFromJSON('scenes', sceneCommands);

    } catch (e) {
        post(`Error loading commands: ${e.message}\n`);
    }
}

// ============================================================================
// INLET HANDLERS
// ============================================================================

function msg_int(val) {
    // Handle key codes from key object
    post("key int: " + val + "\n");
    keydown(val);
}

function anything() {
    const cmd = messagename;
    const args = arrayfromargs(arguments);
    post("anything: " + cmd + " " + args.join(" ") + "\n");

    switch (cmd) {
        case "open":
            openPalette();
            break;
        case "close":
            closePalette();
            break;
        case "toggle":
            togglePalette();
            break;
        case "text":
            // Text input from textedit
            searchQuery = args.join(" ");
            search(searchQuery);
            break;
        case "key":
            keydown(args[0]);
            break;
        default:
            post(`Unknown message: ${cmd}\n`);
    }
}

// ============================================================================
// PALETTE CONTROL
// ============================================================================

function openPalette() {
    paletteVisible = true;
    searchQuery = "";
    selectedIndex = 0;

    // Refresh context and filter commands
    refreshContext();
    filteredCommands = filterByContext(registry.getAll(), currentContext);

    redraw();
    post("Palette opened\n");
}

function closePalette() {
    paletteVisible = false;
    searchQuery = "";
    selectedIndex = 0;
    outlet(1, "bang"); // Signal palette closed
    redraw();
    post("Palette closed\n");
}

function togglePalette() {
    if (paletteVisible) {
        closePalette();
    } else {
        openPalette();
    }
}

// ============================================================================
// CONTEXT FILTERING
// ============================================================================

/**
 * Filter commands based on current Live context.
 * Commands with `requires` properties are hidden when requirements aren't met.
 *
 * @param {Array} commands - Commands to filter
 * @param {Object} context - Current context from lom.getCurrentContext()
 * @returns {Array} Filtered commands
 */
function filterByContext(commands, context) {
    if (!context) return commands;

    return commands.filter(cmd => {
        if (!cmd.requires) return true;

        // Check each requirement
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

/**
 * Refresh current context from Live
 */
function refreshContext() {
    try {
        currentContext = lom.getCurrentContext();
    } catch (e) {
        post(`Error getting context: ${e.message}\n`);
        currentContext = null;
    }
}

// ============================================================================
// SEARCH
// ============================================================================

function search(query) {
    query = query.toLowerCase().trim();
    searchQuery = query;

    // Get context-filtered commands
    const availableCommands = filterByContext(registry.getAll(), currentContext);

    if (query === "") {
        filteredCommands = availableCommands;
    } else {
        // Use fuzzy matcher to search
        const results = matcher.search(query, availableCommands);
        filteredCommands = results.map(r => r.command);
    }

    // Reset selection if out of bounds
    if (selectedIndex >= filteredCommands.length) {
        selectedIndex = Math.max(0, filteredCommands.length - 1);
    }

    redraw();
}

// ============================================================================
// KEYBOARD HANDLING
// ============================================================================

/**
 * Handle keyboard input for the palette.
 * Supports:
 * - Navigation: Arrow Up/Down, Enter, Escape
 * - Text input: Printable characters (a-z, 0-9, space, punctuation)
 * - Editing: Backspace/Delete
 *
 * @param {number} keycode - ASCII key code from Max key object
 */
function keydown(keycode) {
    // Window visibility now handled by pcontrol, always process keys

    // Navigation and control keys
    switch (keycode) {
        case 27: // Escape
            closePalette();
            return;

        case 13: // Enter/Return
            executeSelected();
            return;

        case 38: // Up Arrow
        case 30: // Max sometimes sends 30 for up
            selectedIndex = Math.max(0, selectedIndex - 1);
            redraw();
            return;

        case 40: // Down Arrow
        case 31: // Max sometimes sends 31 for down
            selectedIndex = Math.min(filteredCommands.length - 1, selectedIndex + 1);
            redraw();
            return;

        case 8:   // Backspace
        case 127: // Delete (some systems)
            if (searchQuery.length > 0) {
                searchQuery = searchQuery.slice(0, -1);
                search(searchQuery);
            }
            return;
    }

    // Printable characters (ASCII 32-126)
    // 32 = space, 33-47 = punctuation, 48-57 = digits, 58-64 = punctuation,
    // 65-90 = uppercase, 91-96 = punctuation, 97-122 = lowercase, 123-126 = punctuation
    if (keycode >= 32 && keycode <= 126) {
        const char = String.fromCharCode(keycode);
        searchQuery += char;
        search(searchQuery);
    }
}

// ============================================================================
// COMMAND EXECUTION
// ============================================================================

function executeSelected() {
    if (filteredCommands.length === 0) {
        post("No command selected\n");
        closePalette();
        return;
    }

    const cmd = filteredCommands[selectedIndex];
    post(`Executing: ${cmd.title}\n`);

    try {
        // Execute via LOM interface
        lom.execute(cmd.action);
        post(`Completed: ${cmd.title}\n`);
    } catch (e) {
        post(`Error executing command: ${e.message}\n`);
    }

    closePalette();
}

// ============================================================================
// UI OUTPUT
// ============================================================================

function redraw() {
    // Send display data to jsui
    const cmdData = filteredCommands.map(cmd => ({
        title: cmd.title,
        category: cmd.category
    }));

    const displayData = {
        visible: paletteVisible,
        query: searchQuery,
        selected: selectedIndex,
        commands: cmdData,
        total: registry.getAll().length,
        filtered: filteredCommands.length
    };

    outlet(0, "display", JSON.stringify(displayData));
}

// ============================================================================
// COMMAND DEFINITIONS (inline for Phase 1)
// These will be moved to JSON files
// ============================================================================

const transportCommands = [
    {
        id: "transport.play",
        title: "Play",
        category: "Transport",
        keywords: ["start", "go"],
        description: "Start playback",
        action: "transport.play"
    },
    {
        id: "transport.stop",
        title: "Stop",
        category: "Transport",
        keywords: ["pause", "halt"],
        description: "Stop playback",
        action: "transport.stop"
    },
    {
        id: "transport.record",
        title: "Record",
        category: "Transport",
        keywords: ["rec", "arm"],
        description: "Toggle recording",
        action: "transport.record"
    },
    {
        id: "transport.loop",
        title: "Toggle Loop",
        category: "Transport",
        keywords: ["repeat", "cycle"],
        description: "Toggle loop playback",
        action: "transport.loop"
    },
    {
        id: "transport.metronome",
        title: "Toggle Metronome",
        category: "Transport",
        keywords: ["click", "metro", "beat"],
        description: "Toggle metronome on/off",
        action: "transport.metronome"
    },
    {
        id: "transport.tapTempo",
        title: "Tap Tempo",
        category: "Transport",
        keywords: ["bpm", "beat"],
        description: "Tap tempo",
        action: "transport.tapTempo"
    },
    {
        id: "transport.arrangement",
        title: "Go to Arrangement",
        category: "Transport",
        keywords: ["view", "arrange"],
        description: "Switch to Arrangement view",
        action: "transport.arrangement"
    },
    {
        id: "transport.session",
        title: "Go to Session",
        category: "Transport",
        keywords: ["view", "clips"],
        description: "Switch to Session view",
        action: "transport.session"
    }
];

const trackCommands = [
    {
        id: "track.mute",
        title: "Mute Selected Track",
        category: "Track",
        keywords: ["silence", "quiet"],
        description: "Toggle mute on selected track",
        action: "track.mute"
    },
    {
        id: "track.unmute",
        title: "Unmute Selected Track",
        category: "Track",
        keywords: ["sound", "enable"],
        description: "Unmute selected track",
        action: "track.unmute"
    },
    {
        id: "track.solo",
        title: "Solo Selected Track",
        category: "Track",
        keywords: ["isolate", "only"],
        description: "Toggle solo on selected track",
        action: "track.solo"
    },
    {
        id: "track.unsolo",
        title: "Unsolo Selected Track",
        category: "Track",
        keywords: ["all", "mix"],
        description: "Unsolo selected track",
        action: "track.unsolo"
    },
    {
        id: "track.arm",
        title: "Arm Selected Track",
        category: "Track",
        keywords: ["record", "enable"],
        description: "Arm selected track for recording",
        action: "track.arm"
    },
    {
        id: "track.disarm",
        title: "Disarm Selected Track",
        category: "Track",
        keywords: ["record", "disable"],
        description: "Disarm selected track",
        action: "track.disarm"
    },
    {
        id: "track.createAudio",
        title: "Create Audio Track",
        category: "Track",
        keywords: ["new", "add", "audio"],
        description: "Create a new audio track",
        action: "track.createAudio"
    },
    {
        id: "track.createMidi",
        title: "Create MIDI Track",
        category: "Track",
        keywords: ["new", "add", "midi"],
        description: "Create a new MIDI track",
        action: "track.createMidi"
    },
    {
        id: "track.delete",
        title: "Delete Selected Track",
        category: "Track",
        keywords: ["remove", "delete"],
        description: "Delete the selected track",
        action: "track.delete"
    },
    {
        id: "track.duplicate",
        title: "Duplicate Selected Track",
        category: "Track",
        keywords: ["copy", "clone"],
        description: "Duplicate the selected track",
        action: "track.duplicate"
    }
];

const navigationCommands = [
    {
        id: "nav.nextTrack",
        title: "Select Next Track",
        category: "Navigation",
        keywords: ["right", "forward"],
        description: "Select the next track",
        action: "nav.nextTrack"
    },
    {
        id: "nav.prevTrack",
        title: "Select Previous Track",
        category: "Navigation",
        keywords: ["left", "back"],
        description: "Select the previous track",
        action: "nav.prevTrack"
    },
    {
        id: "nav.nextDevice",
        title: "Select Next Device",
        category: "Navigation",
        keywords: ["right", "forward", "plugin"],
        description: "Select the next device",
        action: "nav.nextDevice"
    },
    {
        id: "nav.prevDevice",
        title: "Select Previous Device",
        category: "Navigation",
        keywords: ["left", "back", "plugin"],
        description: "Select the previous device",
        action: "nav.prevDevice"
    },
    {
        id: "nav.nextScene",
        title: "Select Next Scene",
        category: "Navigation",
        keywords: ["down", "scene"],
        description: "Select the next scene",
        action: "nav.nextScene"
    },
    {
        id: "nav.prevScene",
        title: "Select Previous Scene",
        category: "Navigation",
        keywords: ["up", "scene"],
        description: "Select the previous scene",
        action: "nav.prevScene"
    },
    {
        id: "nav.focusBrowser",
        title: "Focus Browser",
        category: "Navigation",
        keywords: ["sidebar", "files", "search"],
        description: "Focus the browser panel",
        action: "nav.focusBrowser"
    }
];

// ============================================================================
// PHASE 2 COMMAND DEFINITIONS
// ============================================================================

const deviceCommands = [
    {
        id: "device.addCompressor",
        title: "Add Compressor",
        category: "Device",
        keywords: ["dynamics", "compress", "effect", "insert"],
        description: "Add Compressor to selected track",
        action: "device.addCompressor",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addEqEight",
        title: "Add EQ Eight",
        category: "Device",
        keywords: ["equalizer", "eq", "frequency", "effect", "insert"],
        description: "Add EQ Eight to selected track",
        action: "device.addEqEight",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addReverb",
        title: "Add Reverb",
        category: "Device",
        keywords: ["space", "room", "hall", "effect", "insert"],
        description: "Add Reverb to selected track",
        action: "device.addReverb",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addDelay",
        title: "Add Delay",
        category: "Device",
        keywords: ["echo", "repeat", "effect", "insert"],
        description: "Add Delay to selected track",
        action: "device.addDelay",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addAutoFilter",
        title: "Add Auto Filter",
        category: "Device",
        keywords: ["filter", "sweep", "lfo", "effect", "insert"],
        description: "Add Auto Filter to selected track",
        action: "device.addAutoFilter",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addSaturator",
        title: "Add Saturator",
        category: "Device",
        keywords: ["distortion", "warmth", "drive", "effect", "insert"],
        description: "Add Saturator to selected track",
        action: "device.addSaturator",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addLimiter",
        title: "Add Limiter",
        category: "Device",
        keywords: ["dynamics", "loud", "ceiling", "effect", "insert"],
        description: "Add Limiter to selected track",
        action: "device.addLimiter",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addGate",
        title: "Add Gate",
        category: "Device",
        keywords: ["dynamics", "noise", "threshold", "effect", "insert"],
        description: "Add Gate to selected track",
        action: "device.addGate",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addChorus",
        title: "Add Chorus",
        category: "Device",
        keywords: ["modulation", "double", "thick", "effect", "insert"],
        description: "Add Chorus to selected track",
        action: "device.addChorus",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addPhaser",
        title: "Add Phaser",
        category: "Device",
        keywords: ["modulation", "sweep", "effect", "insert"],
        description: "Add Phaser to selected track",
        action: "device.addPhaser",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addUtility",
        title: "Add Utility",
        category: "Device",
        keywords: ["gain", "pan", "phase", "width", "effect", "insert"],
        description: "Add Utility to selected track",
        action: "device.addUtility",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addSpectrum",
        title: "Add Spectrum",
        category: "Device",
        keywords: ["analyzer", "frequency", "visual", "meter", "insert"],
        description: "Add Spectrum analyzer to selected track",
        action: "device.addSpectrum",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addTuner",
        title: "Add Tuner",
        category: "Device",
        keywords: ["pitch", "tune", "guitar", "insert"],
        description: "Add Tuner to selected track",
        action: "device.addTuner",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addArpeggiator",
        title: "Add Arpeggiator",
        category: "Device",
        keywords: ["midi", "arp", "pattern", "sequence", "insert"],
        description: "Add Arpeggiator MIDI effect to selected track",
        action: "device.addArpeggiator",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addChord",
        title: "Add Chord",
        category: "Device",
        keywords: ["midi", "harmony", "notes", "insert"],
        description: "Add Chord MIDI effect to selected track",
        action: "device.addChord",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addScale",
        title: "Add Scale",
        category: "Device",
        keywords: ["midi", "key", "quantize", "notes", "insert"],
        description: "Add Scale MIDI effect to selected track",
        action: "device.addScale",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addNoteLength",
        title: "Add Note Length",
        category: "Device",
        keywords: ["midi", "duration", "gate", "insert"],
        description: "Add Note Length MIDI effect to selected track",
        action: "device.addNoteLength",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addWavetable",
        title: "Add Wavetable",
        category: "Device",
        keywords: ["synth", "instrument", "oscillator", "insert"],
        description: "Add Wavetable synthesizer to selected track",
        action: "device.addWavetable",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addOperator",
        title: "Add Operator",
        category: "Device",
        keywords: ["synth", "instrument", "fm", "insert"],
        description: "Add Operator synthesizer to selected track",
        action: "device.addOperator",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addDrift",
        title: "Add Drift",
        category: "Device",
        keywords: ["synth", "instrument", "analog", "insert"],
        description: "Add Drift synthesizer to selected track",
        action: "device.addDrift",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addSimpler",
        title: "Add Simpler",
        category: "Device",
        keywords: ["sampler", "instrument", "sample", "insert"],
        description: "Add Simpler sampler to selected track",
        action: "device.addSimpler",
        requires: { selectedTrack: true }
    },
    {
        id: "device.bypass",
        title: "Bypass Selected Device",
        category: "Device",
        keywords: ["disable", "off", "toggle", "mute"],
        description: "Toggle bypass on selected device",
        action: "device.bypass",
        requires: { selectedDevice: true }
    },
    {
        id: "device.delete",
        title: "Delete Selected Device",
        category: "Device",
        keywords: ["remove", "delete"],
        description: "Delete the selected device",
        action: "device.delete",
        requires: { selectedDevice: true }
    },
    {
        id: "device.duplicate",
        title: "Duplicate Selected Device",
        category: "Device",
        keywords: ["copy", "clone"],
        description: "Duplicate the selected device",
        action: "device.duplicate",
        requires: { selectedDevice: true }
    }
];

const clipCommands = [
    {
        id: "clip.fire",
        title: "Fire Selected Clip",
        category: "Clip",
        keywords: ["launch", "play", "trigger", "start"],
        description: "Fire the selected clip",
        action: "clip.fire",
        requires: { selectedClip: true }
    },
    {
        id: "clip.stop",
        title: "Stop Selected Clip",
        category: "Clip",
        keywords: ["halt", "pause"],
        description: "Stop the selected clip",
        action: "clip.stop",
        requires: { selectedClip: true }
    },
    {
        id: "clip.delete",
        title: "Delete Selected Clip",
        category: "Clip",
        keywords: ["remove", "clear"],
        description: "Delete the selected clip",
        action: "clip.delete",
        requires: { selectedClip: true }
    },
    {
        id: "clip.duplicate",
        title: "Duplicate Selected Clip",
        category: "Clip",
        keywords: ["copy", "clone"],
        description: "Duplicate the selected clip",
        action: "clip.duplicate",
        requires: { selectedClip: true }
    },
    {
        id: "clip.quantize14",
        title: "Quantize Clip 1/4",
        category: "Clip",
        keywords: ["snap", "grid", "quarter", "timing"],
        description: "Quantize clip notes to 1/4 note grid",
        action: "clip.quantize14",
        requires: { selectedClip: true }
    },
    {
        id: "clip.quantize18",
        title: "Quantize Clip 1/8",
        category: "Clip",
        keywords: ["snap", "grid", "eighth", "timing"],
        description: "Quantize clip notes to 1/8 note grid",
        action: "clip.quantize18",
        requires: { selectedClip: true }
    },
    {
        id: "clip.quantize116",
        title: "Quantize Clip 1/16",
        category: "Clip",
        keywords: ["snap", "grid", "sixteenth", "timing"],
        description: "Quantize clip notes to 1/16 note grid",
        action: "clip.quantize116",
        requires: { selectedClip: true }
    },
    {
        id: "clip.loopSelection",
        title: "Loop Selection",
        category: "Clip",
        keywords: ["repeat", "cycle", "region"],
        description: "Set loop to current selection",
        action: "clip.loopSelection",
        requires: { selectedClip: true }
    },
    {
        id: "clip.consolidate",
        title: "Consolidate Clip",
        category: "Clip",
        keywords: ["bounce", "merge", "flatten"],
        description: "Consolidate clip to new audio",
        action: "clip.consolidate",
        requires: { selectedClip: true, arrangementView: true }
    },
    {
        id: "clip.doubleLoop",
        title: "Double Loop Length",
        category: "Clip",
        keywords: ["extend", "longer", "2x"],
        description: "Double the clip loop length",
        action: "clip.doubleLoop",
        requires: { selectedClip: true }
    },
    {
        id: "clip.halveLoop",
        title: "Halve Loop Length",
        category: "Clip",
        keywords: ["shorten", "shorter", "half"],
        description: "Halve the clip loop length",
        action: "clip.halveLoop",
        requires: { selectedClip: true }
    },
    {
        id: "clip.setLoopOn",
        title: "Enable Clip Loop",
        category: "Clip",
        keywords: ["repeat", "cycle", "on"],
        description: "Enable looping for selected clip",
        action: "clip.setLoopOn",
        requires: { selectedClip: true }
    },
    {
        id: "clip.setLoopOff",
        title: "Disable Clip Loop",
        category: "Clip",
        keywords: ["oneshot", "once", "off"],
        description: "Disable looping for selected clip",
        action: "clip.setLoopOff",
        requires: { selectedClip: true }
    },
    {
        id: "clip.cropToLoop",
        title: "Crop Clip to Loop",
        category: "Clip",
        keywords: ["trim", "cut", "region"],
        description: "Crop clip to current loop region",
        action: "clip.cropToLoop",
        requires: { selectedClip: true }
    },
    {
        id: "clip.rename",
        title: "Rename Selected Clip",
        category: "Clip",
        keywords: ["name", "label", "title"],
        description: "Rename the selected clip",
        action: "clip.rename",
        requires: { selectedClip: true }
    }
];

const sceneCommands = [
    {
        id: "scene.fire",
        title: "Fire Selected Scene",
        category: "Scene",
        keywords: ["launch", "play", "trigger", "start"],
        description: "Fire the selected scene",
        action: "scene.fire",
        requires: { sessionView: true }
    },
    {
        id: "scene.fireNext",
        title: "Fire Next Scene",
        category: "Scene",
        keywords: ["launch", "play", "trigger", "forward", "down"],
        description: "Fire the next scene",
        action: "scene.fireNext",
        requires: { sessionView: true }
    },
    {
        id: "scene.firePrev",
        title: "Fire Previous Scene",
        category: "Scene",
        keywords: ["launch", "play", "trigger", "back", "up"],
        description: "Fire the previous scene",
        action: "scene.firePrev",
        requires: { sessionView: true }
    },
    {
        id: "scene.stopAll",
        title: "Stop All Clips",
        category: "Scene",
        keywords: ["halt", "silence", "stop"],
        description: "Stop all playing clips",
        action: "scene.stopAll"
    },
    {
        id: "scene.create",
        title: "Create Scene",
        category: "Scene",
        keywords: ["new", "add", "insert"],
        description: "Create a new scene",
        action: "scene.create",
        requires: { sessionView: true }
    },
    {
        id: "scene.delete",
        title: "Delete Selected Scene",
        category: "Scene",
        keywords: ["remove", "delete"],
        description: "Delete the selected scene",
        action: "scene.delete",
        requires: { sessionView: true }
    },
    {
        id: "scene.duplicate",
        title: "Duplicate Selected Scene",
        category: "Scene",
        keywords: ["copy", "clone"],
        description: "Duplicate the selected scene",
        action: "scene.duplicate",
        requires: { sessionView: true }
    },
    {
        id: "scene.capture",
        title: "Capture and Insert Scene",
        category: "Scene",
        keywords: ["snapshot", "save", "capture"],
        description: "Capture currently playing clips into a new scene",
        action: "scene.capture",
        requires: { sessionView: true }
    },
    {
        id: "scene.rename",
        title: "Rename Selected Scene",
        category: "Scene",
        keywords: ["name", "label", "title"],
        description: "Rename the selected scene",
        action: "scene.rename",
        requires: { sessionView: true }
    },
    {
        id: "scene.setTempo",
        title: "Set Scene Tempo",
        category: "Scene",
        keywords: ["bpm", "speed", "tempo"],
        description: "Set tempo for the selected scene",
        action: "scene.setTempo",
        requires: { sessionView: true }
    }
];

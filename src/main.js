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
        // Transport commands
        registry.loadFromJSON('transport', transportCommands);

        // Track commands
        registry.loadFromJSON('tracks', trackCommands);

        // Navigation commands
        registry.loadFromJSON('navigation', navigationCommands);

    } catch (e) {
        post(`Error loading commands: ${e.message}\n`);
    }
}

// ============================================================================
// INLET HANDLERS
// ============================================================================

function msg_int(val) {
    // Handle key codes from key object
    keydown(val);
}

function anything() {
    const cmd = messagename;
    const args = arrayfromargs(arguments);

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
    filteredCommands = registry.getAll();
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
// SEARCH
// ============================================================================

function search(query) {
    query = query.toLowerCase().trim();
    searchQuery = query;

    if (query === "") {
        filteredCommands = registry.getAll();
    } else {
        // Use fuzzy matcher to search
        const results = matcher.search(query, registry.getAll());
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
    if (!paletteVisible) return;

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

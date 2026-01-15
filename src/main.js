/**
 * Ableton Command Palette - Main Entry Point
 *
 * v8 entry point with CommonJS modules for Max for Live.
 * Handles palette state, coordinates between UI and command execution.
 */

const { CommandRegistry } = require('./core/CommandRegistry.js');
const { FuzzyMatcher } = require('./core/FuzzyMatcher.js');
const { LOMInterface } = require('./core/LOMInterface.js');

// Command modules
const transportCommands = require('./commands/transport.js');
const trackCommands = require('./commands/tracks.js');
const navigationCommands = require('./commands/navigation.js');
const deviceCommands = require('./commands/devices.js');
const clipCommands = require('./commands/clips.js');
const sceneCommands = require('./commands/scenes.js');

// Debug mode - set to true for verbose logging
const DEBUG = false;

function debug(msg) {
    if (DEBUG) post("[DEBUG] " + msg + "\n");
}

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
    // Load commands from CommonJS modules
    // Note: Max v8 doesn't support JSON require or file system access,
    // so commands are defined in JS modules and required at top of file.

    try {
        // Phase 1 commands
        registry.loadFromJSON('transport', transportCommands);
        registry.loadFromJSON('tracks', trackCommands);
        registry.loadFromJSON('navigation', navigationCommands);

        // Phase 2 commands
        registry.loadFromJSON('devices', deviceCommands);
        registry.loadFromJSON('clips', clipCommands);
        registry.loadFromJSON('scenes', sceneCommands);

        debug("Registry now contains " + registry.count() + " commands");
        debug("Categories: " + registry.getCategories().join(", "));

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
        case "show":
            openPalette();
            // Signal to focus textedit
            outlet(0, "focus");
            break;
        case "hide":
            closePalette();
            break;
        case "tog":
            // togglePalette() handles state; focus only needed when opening
            // (closePalette() already sends "clear" when closing)
            togglePalette();
            if (paletteVisible) {
                outlet(0, "focus");
            }
            break;
        case "text":
            // Complete text from textedit (on Enter/Tab)
            searchQuery = args.join(" ");
            search(searchQuery);
            break;
        case "char":
            // Single character ASCII from textedit middle outlet
            handleTexteditChar(args[0]);
            break;
        case "key":
            // Navigation keys from key object (arrows, escape, enter)
            keydown(args[0]);
            break;
        default:
            debug(`Unknown message: ${cmd}`);
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
    outlet(0, "clear");  // Clear textedit
    outlet(1, "bang");   // Signal palette closed (triggers pcontrol close)
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
// TEXTEDIT INPUT HANDLING
// ============================================================================
//
// PATCHER WIRING (for reference):
//
// textedit (off-screen, captures keyboard focus)
//   └─ middle outlet → select 13 27 30 31 38 40
//                        ├─ matched (nav keys) → prepend key → main.js
//                        └─ unmatched (chars) → prepend char → main.js
//
// main.js outlet 0 → route focus clear
//   ├─ focus → select → textedit (captures keyboard on open)
//   ├─ clear → set "" → textedit (clears on close)
//   └─ unmatched (display) → v8ui (rendering)
//

/**
 * Handle character input from textedit middle outlet.
 * The middle outlet sends ASCII codes for each character as typed.
 * This provides real-time search while textedit captures keyboard focus
 * (preventing keypresses from passing through to Ableton Live).
 *
 * Note: textedit is off-screen; v8ui renders the search query visually.
 * No sync back to textedit needed since user never sees it.
 *
 * @param {number} charCode - ASCII code from textedit middle outlet
 */
function handleTexteditChar(charCode) {
    // Backspace (8) or Delete (127 on some systems)
    // Note: 127 may be forward-delete on certain platforms
    if (charCode === 8 || charCode === 127) {
        if (searchQuery.length > 0) {
            searchQuery = searchQuery.slice(0, -1);
            search(searchQuery);
        }
        return;
    }

    // Printable characters (ASCII 32-126)
    if (charCode >= 32 && charCode <= 126) {
        const char = String.fromCharCode(charCode);
        searchQuery += char;
        search(searchQuery);
    }
}

// ============================================================================
// KEYBOARD HANDLING (Navigation Keys Only)
// ============================================================================

/**
 * Handle navigation keys from the key object.
 * With textedit integration, this only handles non-text keys:
 * - Arrow Up/Down for navigation
 * - Enter to execute
 * - Escape to close
 *
 * Text input is handled by handleTexteditChar() from textedit middle outlet.
 *
 * @param {number} keycode - Key code from Max key object
 */
function keydown(keycode) {
    // Navigation and control keys only
    // (Text input handled by textedit → handleTexteditChar)
    switch (keycode) {
        case 27: // Escape
            closePalette();
            break;

        case 13: // Enter/Return
            executeSelected();
            break;

        case 38: // Up Arrow
        case 30: // Max sometimes sends 30 for up
            selectedIndex = Math.max(0, selectedIndex - 1);
            redraw();
            break;

        case 40: // Down Arrow
        case 31: // Max sometimes sends 31 for down
            selectedIndex = Math.min(filteredCommands.length - 1, selectedIndex + 1);
            redraw();
            break;
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

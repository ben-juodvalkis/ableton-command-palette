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

// Debug: Log module loading
post("DEBUG: Loaded command modules:\n");
post("  - transport.js: " + transportCommands.length + " commands\n");
post("  - tracks.js: " + trackCommands.length + " commands\n");
post("  - navigation.js: " + navigationCommands.length + " commands\n");
post("  - devices.js: " + deviceCommands.length + " commands\n");
post("  - clips.js: " + clipCommands.length + " commands\n");
post("  - scenes.js: " + sceneCommands.length + " commands\n");

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

        // Debug: Verify registration
        post("DEBUG: Registry now contains " + registry.count() + " commands\n");
        post("DEBUG: Categories: " + registry.getCategories().join(", ") + "\n");

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

/*
 * Ableton Command Palette - Prototype
 *
 * A minimal proof-of-concept with 10 hardcoded commands.
 * All logic in one file for simplicity.
 */

autowatch = 1;
inlets = 1;
outlets = 2; // outlet 0: to jsui, outlet 1: bang when palette closes

// ============================================================================
// STATE
// ============================================================================

var commands = [
    // Transport
    { name: "Play", keywords: "start transport", action: "play" },
    { name: "Stop", keywords: "pause transport", action: "stop" },
    { name: "Toggle Metronome", keywords: "click metro", action: "metronome" },

    // Track Operations
    { name: "Mute Selected Track", keywords: "silence", action: "mute" },
    { name: "Solo Selected Track", keywords: "isolate", action: "solo" },
    { name: "Create Audio Track", keywords: "new add", action: "createAudio" },
    { name: "Delete Selected Track", keywords: "remove", action: "deleteTrack" },

    // Device Operations
    { name: "Add Compressor", keywords: "dynamics plugin", action: "addCompressor" },
    { name: "Add Reverb", keywords: "effect space plugin", action: "addReverb" },
    { name: "Bypass Selected Device", keywords: "disable off", action: "bypassDevice" }
];

var filteredCommands = [];
var searchQuery = "";
var selectedIndex = 0;
var paletteVisible = false;

// ============================================================================
// INLET HANDLERS
// ============================================================================

function msg_int(val) {
    // Handle key codes from [key] object
    keydown(val);
}

function msg_float(val) {
    // Ignore floats
}

function anything() {
    var cmd = messagename;
    var args = arrayfromargs(arguments);

    if (cmd === "open") {
        openPalette();
    } else if (cmd === "close") {
        closePalette();
    } else if (cmd === "toggle") {
        togglePalette();
    } else if (cmd === "text") {
        // Text input from textedit
        searchQuery = args.join(" ");
        search(searchQuery);
    } else if (cmd === "key") {
        keydown(args[0]);
    }
}

// ============================================================================
// PALETTE CONTROL
// ============================================================================

function openPalette() {
    paletteVisible = true;
    searchQuery = "";
    selectedIndex = 0;
    filteredCommands = commands.slice(); // Show all commands initially
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
        filteredCommands = commands.slice();
    } else {
        filteredCommands = [];
        for (var i = 0; i < commands.length; i++) {
            var cmd = commands[i];
            var searchText = (cmd.name + " " + cmd.keywords).toLowerCase();

            // Simple contains match (not fuzzy yet)
            if (searchText.indexOf(query) !== -1) {
                filteredCommands.push(cmd);
            }
        }
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

function keydown(keycode) {
    if (!paletteVisible) return;

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

        default:
            // Other keys handled by textedit
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

    var cmd = filteredCommands[selectedIndex];
    post("Executing: " + cmd.name + "\n");

    try {
        switch (cmd.action) {
            case "play":
                executePlay();
                break;
            case "stop":
                executeStop();
                break;
            case "metronome":
                executeMetronome();
                break;
            case "mute":
                executeMute();
                break;
            case "solo":
                executeSolo();
                break;
            case "createAudio":
                executeCreateAudioTrack();
                break;
            case "deleteTrack":
                executeDeleteTrack();
                break;
            case "addCompressor":
                executeAddCompressor();
                break;
            case "addReverb":
                executeAddReverb();
                break;
            case "bypassDevice":
                executeBypassDevice();
                break;
            default:
                post("Unknown action: " + cmd.action + "\n");
        }
    } catch (e) {
        post("Error executing command: " + e.message + "\n");
    }

    closePalette();
}

// ============================================================================
// COMMAND EXECUTORS - Transport
// ============================================================================

function executePlay() {
    var api = new LiveAPI("live_set");
    api.call("start_playing");
    post("Transport: Play\n");
}

function executeStop() {
    var api = new LiveAPI("live_set");
    api.call("stop_playing");
    post("Transport: Stop\n");
}

function executeMetronome() {
    var api = new LiveAPI("live_set");
    var current = api.get("metronome");
    api.set("metronome", current == 1 ? 0 : 1);
    post("Metronome: " + (current == 1 ? "Off" : "On") + "\n");
}

// ============================================================================
// COMMAND EXECUTORS - Track Operations
// ============================================================================

function executeMute() {
    var track = new LiveAPI("live_set view selected_track");
    if (!track.id || track.id == 0) {
        post("No track selected\n");
        return;
    }
    var current = track.get("mute");
    track.set("mute", current == 1 ? 0 : 1);
    post("Track mute: " + (current == 1 ? "Off" : "On") + "\n");
}

function executeSolo() {
    var track = new LiveAPI("live_set view selected_track");
    if (!track.id || track.id == 0) {
        post("No track selected\n");
        return;
    }
    var current = track.get("solo");
    track.set("solo", current == 1 ? 0 : 1);
    post("Track solo: " + (current == 1 ? "Off" : "On") + "\n");
}

function executeCreateAudioTrack() {
    var api = new LiveAPI("live_set");
    api.call("create_audio_track", -1); // -1 = at end
    post("Created new audio track\n");
}

function executeDeleteTrack() {
    var track = new LiveAPI("live_set view selected_track");
    if (!track.id || track.id == 0) {
        post("No track selected\n");
        return;
    }

    // Get track index to delete
    var api = new LiveAPI("live_set");
    var tracks = api.get("tracks");

    // Find selected track index
    var trackPath = track.path;
    var match = trackPath.match(/tracks\s+(\d+)/);
    if (match) {
        var trackIndex = parseInt(match[1]);
        api.call("delete_track", trackIndex);
        post("Deleted track at index " + trackIndex + "\n");
    } else {
        post("Could not determine track index\n");
    }
}

// ============================================================================
// COMMAND EXECUTORS - Device Operations
// ============================================================================

function executeAddCompressor() {
    var track = new LiveAPI("live_set view selected_track");
    if (!track.id || track.id == 0) {
        post("No track selected\n");
        return;
    }

    // Live 12+ uses insert_device with browser item
    // For prototype, we use the device name directly
    try {
        // Try Live 12 method first
        track.call("create_device", "Compressor");
        post("Added Compressor to track\n");
    } catch (e) {
        post("Could not add Compressor: " + e.message + "\n");
        post("Note: Device insertion may require Live 12+\n");
    }
}

function executeAddReverb() {
    var track = new LiveAPI("live_set view selected_track");
    if (!track.id || track.id == 0) {
        post("No track selected\n");
        return;
    }

    try {
        track.call("create_device", "Reverb");
        post("Added Reverb to track\n");
    } catch (e) {
        post("Could not add Reverb: " + e.message + "\n");
        post("Note: Device insertion may require Live 12+\n");
    }
}

function executeBypassDevice() {
    var device = new LiveAPI("live_set view selected_track view selected_device");
    if (!device.id || device.id == 0) {
        post("No device selected\n");
        return;
    }

    // Check if device can be turned on/off
    var canBypass = device.get("can_have_chains");
    var current = device.get("is_active");
    device.set("is_active", current == 1 ? 0 : 1);
    post("Device bypass: " + (current == 1 ? "On" : "Off") + "\n");
}

// ============================================================================
// UI OUTPUT
// ============================================================================

function redraw() {
    // Send display data to jsui
    // Format: "display visible query selectedIndex cmd1|cmd2|cmd3..."

    var cmdNames = [];
    for (var i = 0; i < filteredCommands.length; i++) {
        cmdNames.push(filteredCommands[i].name);
    }

    var displayData = {
        visible: paletteVisible,
        query: searchQuery,
        selected: selectedIndex,
        commands: cmdNames,
        total: commands.length,
        filtered: filteredCommands.length
    };

    // Output as formatted message for jsui
    outlet(0, "display", JSON.stringify(displayData));
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function loadbang() {
    post("Command Palette Prototype loaded\n");
    post("Commands available: " + commands.length + "\n");
    filteredCommands = commands.slice();
    redraw();
}

// Export functions for Max
loadbang.local = 1;

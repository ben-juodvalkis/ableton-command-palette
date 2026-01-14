/**
 * Window Manager - Calculates and outputs window positioning
 *
 * Receives screen dimensions, outputs thispatcher messages
 * for a centered floating palette window.
 */

// Palette dimensions
const PALETTE_WIDTH = 500;
const PALETTE_HEIGHT = 400;

// v8 setup
inlets = 1;
outlets = 1;

/**
 * Receives screen width and height, outputs window setup message
 * Input: screenWidth screenHeight (from screensize object)
 */
function list(screenWidth, screenHeight) {
    const left = Math.round((screenWidth - PALETTE_WIDTH) / 2);
    const top = Math.round((screenHeight - PALETTE_HEIGHT) / 2);
    const right = left + PALETTE_WIDTH;
    const bottom = top + PALETTE_HEIGHT;

    // Output window configuration message
    outlet(0, "window", "size", left, top, right, bottom);
    outlet(0, "window", "notitle");
    outlet(0, "window", "flags", "float");
    outlet(0, "window", "flags", "nozoom");
    outlet(0, "window", "flags", "nogrow");
    outlet(0, "window", "flags", "noclose");
    outlet(0, "window", "exec");
}

/**
 * Bang triggers output with default screen size (fallback)
 */
function bang() {
    list(1920, 1080);
}

function loadbang() {
    post("Window manager loaded\n");
}


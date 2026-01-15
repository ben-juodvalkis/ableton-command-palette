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
 * Receives screen bounds, outputs window setup message
 * Input: left top right bottom (from screensize object)
 */
function list(screenLeft, screenTop, screenRight, screenBottom) {
    const screenWidth = screenRight - screenLeft;
    const screenHeight = screenBottom - screenTop;

    const left = screenLeft + Math.round((screenWidth - PALETTE_WIDTH) / 2);
    const top = screenTop + Math.round((screenHeight - PALETTE_HEIGHT) / 2);
    const right = left + PALETTE_WIDTH;
    const bottom = top + PALETTE_HEIGHT;

    // Output window configuration message
    outlet(0, "window", "size", left, top, right, bottom);
    outlet(0, "window", "notitle");
    outlet(0, "window", "flags", "float");
    outlet(0, "window", "flags", "nozoom");
    outlet(0, "window", "flags", "nogrow");
    outlet(0, "window", "flags", "noclose");
    outlet(0, "window", "flags", "nominimize");
    outlet(0, "window", "flags", "nomenu");
    outlet(0, "toolbarvisible", 0);
    outlet(0, "statusbarvisible", 0);
    outlet(0, "presentation", 1);
    outlet(0, "window", "exec");
    // Note: "active" is not a valid thispatcher message - window activation
    // is handled by pcontrol's "open" message
}

/**
 * Bang triggers output with default screen size (fallback)
 */
function bang() {
    list(0, 0, 1920, 1080);
}

function loadbang() {
    post("Window manager loaded\n");
}


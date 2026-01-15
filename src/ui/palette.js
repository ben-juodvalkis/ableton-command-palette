/**
 * Palette UI - v8ui Rendering
 *
 * Renders the command palette interface using v8ui graphics.
 * Receives display data from main.js and draws the UI.
 *
 * Uses ES6 syntax (v8ui supports modern JavaScript).
 */

// v8ui setup
mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    // Window dimensions (must match window.js)
    windowWidth: 500,
    windowHeight: 400,

    // Colors (dark theme matching Ableton)
    colors: {
        background: [0.118, 0.118, 0.118, 1.0],      // #1e1e1e
        inputBg: [0.157, 0.157, 0.157, 1.0],         // #282828
        text: [0.9, 0.9, 0.9, 1.0],                  // Light gray
        textDim: [0.5, 0.5, 0.5, 1.0],               // Dim gray
        selectedBg: [0.2, 0.4, 0.6, 1.0],            // Blue highlight
        selectedText: [1.0, 1.0, 1.0, 1.0],          // White
        border: [0.3, 0.3, 0.3, 1.0],                // Border gray
        accent: [0.4, 0.6, 0.8, 1.0],                // Accent blue
        category: [0.6, 0.6, 0.4, 1.0]               // Category gold
    },

    // Dimensions
    padding: 12,
    inputHeight: 36,
    itemHeight: 32,
    maxVisibleItems: 10,
    borderRadius: 4,
    categoryWidth: 80,

    // Typography
    fontName: "Arial",
    fontNameMono: "Monaco",
    fontSize: 13,
    smallFontSize: 11
};

// ============================================================================
// STATE
// ============================================================================

let displayState = {
    visible: true,  // Always visible when window is open
    query: "",
    selected: 0,
    commands: [],  // Array of {title, category}
    total: 0,
    filtered: 0
};

// ============================================================================
// INLET HANDLERS
// ============================================================================

function anything() {
    const cmd = messagename;
    const args = arrayfromargs(arguments);

    if (cmd === "display") {
        try {
            const data = JSON.parse(args[0]);
            displayState.visible = data.visible;
            displayState.query = data.query || "";
            displayState.selected = data.selected || 0;
            displayState.commands = data.commands || [];
            displayState.total = data.total || 0;
            displayState.filtered = data.filtered || 0;
            mgraphics.redraw();
        } catch (e) {
            post(`Error parsing display data: ${e.message}\n`);
        }
    }
}

function bang() {
    mgraphics.redraw();
}

// ============================================================================
// MAIN PAINT FUNCTION
// ============================================================================

function paint() {
    const pres = this.box.getattr("presentation_rect");
    const width = pres ? pres[2] : CONFIG.windowWidth;
    const height = pres ? pres[3] : CONFIG.windowHeight;

    // Clear background
    setColor(CONFIG.colors.background);
    mgraphics.rectangle(0, 0, width, height);
    mgraphics.fill();

    // Always draw palette - window visibility handled by pcontrol
    drawPalette(width, height);
}

// ============================================================================
// DRAWING FUNCTIONS
// ============================================================================

function drawPalette(width, height) {
    let y = CONFIG.padding;

    // Draw search input
    y = drawSearchInput(CONFIG.padding, y, width - CONFIG.padding * 2);
    y += CONFIG.padding;

    // Draw separator line
    setColor(CONFIG.colors.border);
    mgraphics.move_to(CONFIG.padding, y);
    mgraphics.line_to(width - CONFIG.padding, y);
    mgraphics.stroke();
    y += CONFIG.padding;

    // Draw command list
    const listHeight = height - y - 30 - CONFIG.padding;
    drawCommandList(CONFIG.padding, y, width - CONFIG.padding * 2, listHeight);

    // Draw status bar
    drawStatusBar(width, height);
}

function drawSearchInput(x, y, inputWidth) {
    // Input background
    setColor(CONFIG.colors.inputBg);
    roundRect(x, y, inputWidth, CONFIG.inputHeight, CONFIG.borderRadius);
    mgraphics.fill();

    // Input border
    setColor(CONFIG.colors.border);
    roundRect(x, y, inputWidth, CONFIG.inputHeight, CONFIG.borderRadius);
    mgraphics.stroke();

    // Search prompt ">"
    setColor(CONFIG.colors.accent);
    mgraphics.select_font_face(CONFIG.fontNameMono);
    mgraphics.set_font_size(CONFIG.fontSize);
    mgraphics.move_to(x + 12, y + CONFIG.inputHeight / 2 + 5);
    mgraphics.show_text(">");

    // Query text
    setColor(CONFIG.colors.text);
    mgraphics.select_font_face(CONFIG.fontName);
    const queryText = displayState.query || "";
    mgraphics.move_to(x + 30, y + CONFIG.inputHeight / 2 + 5);
    mgraphics.show_text(queryText);

    // Cursor
    const cursorX = x + 30 + (queryText ? mgraphics.text_measure(queryText)[0] : 0);
    setColor(CONFIG.colors.accent);
    mgraphics.rectangle(cursorX + 2, y + 10, 2, CONFIG.inputHeight - 20);
    mgraphics.fill();

    return y + CONFIG.inputHeight;
}

function drawCommandList(x, y, listWidth, listHeight) {
    const commands = displayState.commands;
    const selected = displayState.selected;

    if (commands.length === 0) {
        setColor(CONFIG.colors.textDim);
        mgraphics.select_font_face(CONFIG.fontName);
        mgraphics.set_font_size(CONFIG.fontSize);
        mgraphics.move_to(x + 10, y + 24);
        mgraphics.show_text("No matching commands");
        return;
    }

    // Calculate visible range with scroll
    const maxVisible = CONFIG.maxVisibleItems;
    let scrollOffset = 0;

    if (selected >= maxVisible) {
        scrollOffset = selected - maxVisible + 1;
    }

    // Draw visible items
    let itemY = y;
    for (let i = scrollOffset; i < commands.length && i < scrollOffset + maxVisible; i++) {
        const isSelected = (i === selected);
        drawCommandItem(x, itemY, listWidth, commands[i], isSelected, i);
        itemY += CONFIG.itemHeight;
    }

    // Scroll indicators
    if (scrollOffset > 0) {
        drawScrollIndicator(x + listWidth - 20, y + 5, "up");
    }
    if (scrollOffset + maxVisible < commands.length) {
        drawScrollIndicator(x + listWidth - 20, itemY - 20, "down");
    }
}

function drawCommandItem(x, y, itemWidth, cmd, isSelected, index) {
    // Selection background
    if (isSelected) {
        setColor(CONFIG.colors.selectedBg);
        roundRect(x, y + 2, itemWidth, CONFIG.itemHeight - 4, CONFIG.borderRadius);
        mgraphics.fill();
    }

    // Category badge
    const category = cmd.category || "Command";
    setColor(isSelected ? CONFIG.colors.selectedText : CONFIG.colors.category);
    mgraphics.select_font_face(CONFIG.fontName);
    mgraphics.set_font_size(CONFIG.smallFontSize);

    // Draw category with fixed width
    const categoryText = category.substring(0, 10);
    mgraphics.move_to(x + 10, y + CONFIG.itemHeight / 2 + 4);
    mgraphics.show_text(categoryText);

    // Command title
    setColor(isSelected ? CONFIG.colors.selectedText : CONFIG.colors.text);
    mgraphics.set_font_size(CONFIG.fontSize);
    mgraphics.move_to(x + CONFIG.categoryWidth + 10, y + CONFIG.itemHeight / 2 + 5);
    mgraphics.show_text(cmd.title);

    // Index number (dimmed, on right)
    setColor(isSelected ? CONFIG.colors.selectedText : CONFIG.colors.textDim);
    mgraphics.set_font_size(CONFIG.smallFontSize);
    const indexStr = (index + 1).toString();
    const indexWidth = mgraphics.text_measure(indexStr)[0];
    mgraphics.move_to(x + itemWidth - indexWidth - 10, y + CONFIG.itemHeight / 2 + 4);
    mgraphics.show_text(indexStr);
}

function drawScrollIndicator(x, y, direction) {
    setColor(CONFIG.colors.textDim);
    mgraphics.select_font_face(CONFIG.fontName);
    mgraphics.set_font_size(CONFIG.smallFontSize);
    mgraphics.move_to(x, y);
    mgraphics.show_text(direction === "up" ? "\u25B2" : "\u25BC");
}

function drawStatusBar(width, height) {
    const statusY = height - 24;

    // Separator line
    setColor(CONFIG.colors.border);
    mgraphics.move_to(CONFIG.padding, statusY - 6);
    mgraphics.line_to(width - CONFIG.padding, statusY - 6);
    mgraphics.stroke();

    // Status text (left)
    setColor(CONFIG.colors.textDim);
    mgraphics.select_font_face(CONFIG.fontName);
    mgraphics.set_font_size(CONFIG.smallFontSize);

    const statusText = `${displayState.filtered} of ${displayState.total} commands`;
    mgraphics.move_to(CONFIG.padding, statusY + 10);
    mgraphics.show_text(statusText);

    // Keyboard hints (right)
    const hints = "\u2191\u2193 Navigate  \u23CE Execute  Esc Close";
    const hintsExtents = mgraphics.text_measure(hints);
    mgraphics.move_to(width - CONFIG.padding - hintsExtents[0], statusY + 10);
    mgraphics.show_text(hints);
}

// ============================================================================
// DRAWING UTILITIES
// ============================================================================

function setColor(rgba) {
    mgraphics.set_source_rgba(rgba[0], rgba[1], rgba[2], rgba[3]);
}

function roundRect(x, y, w, h, r) {
    mgraphics.move_to(x + r, y);
    mgraphics.line_to(x + w - r, y);
    mgraphics.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
    mgraphics.line_to(x + w, y + h - r);
    mgraphics.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
    mgraphics.line_to(x + r, y + h);
    mgraphics.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    mgraphics.line_to(x, y + r);
    mgraphics.arc(x + r, y + r, r, Math.PI, -Math.PI / 2);
    mgraphics.close_path();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function loadbang() {
    post("Palette UI (v8ui) loaded\n");
    mgraphics.redraw();
}

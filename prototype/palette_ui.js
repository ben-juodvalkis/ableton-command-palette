/*
 * Ableton Command Palette - jsui Display
 *
 * Renders the command palette UI in a jsui object.
 * Receives display data from proto.js and draws the interface.
 */

autowatch = 1;
inlets = 1;
outlets = 1;

// ============================================================================
// JSUI SETUP
// ============================================================================

mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

// ============================================================================
// CONFIGURATION
// ============================================================================

var CONFIG = {
    // Colors (dark theme)
    bgColor: [0.118, 0.118, 0.118, 1.0],        // #1e1e1e
    inputBgColor: [0.157, 0.157, 0.157, 1.0],   // #282828
    textColor: [0.9, 0.9, 0.9, 1.0],            // Light gray
    dimTextColor: [0.5, 0.5, 0.5, 1.0],         // Dim gray
    selectedBgColor: [0.2, 0.4, 0.6, 1.0],      // Blue highlight
    selectedTextColor: [1.0, 1.0, 1.0, 1.0],    // White
    borderColor: [0.3, 0.3, 0.3, 1.0],          // Border gray
    accentColor: [0.4, 0.6, 0.8, 1.0],          // Accent blue

    // Dimensions
    padding: 12,
    inputHeight: 36,
    itemHeight: 28,
    maxVisibleItems: 8,
    borderRadius: 4,

    // Typography
    fontName: "Monaco",
    fontSize: 13,
    smallFontSize: 11
};

// ============================================================================
// STATE
// ============================================================================

var displayState = {
    visible: false,
    query: "",
    selected: 0,
    commands: [],
    total: 0,
    filtered: 0
};

// ============================================================================
// INLET HANDLER
// ============================================================================

function anything() {
    var cmd = messagename;
    var args = arrayfromargs(arguments);

    if (cmd === "display") {
        try {
            var data = JSON.parse(args[0]);
            displayState.visible = data.visible;
            displayState.query = data.query || "";
            displayState.selected = data.selected || 0;
            displayState.commands = data.commands || [];
            displayState.total = data.total || 0;
            displayState.filtered = data.filtered || 0;
            mgraphics.redraw();
        } catch (e) {
            post("Error parsing display data: " + e.message + "\n");
        }
    }
}

function bang() {
    mgraphics.redraw();
}

// ============================================================================
// DRAWING
// ============================================================================

function paint() {
    var width = this.box.rect[2] - this.box.rect[0];
    var height = this.box.rect[3] - this.box.rect[1];

    // Clear background
    mgraphics.set_source_rgba(CONFIG.bgColor);
    mgraphics.rectangle(0, 0, width, height);
    mgraphics.fill();

    if (!displayState.visible) {
        // Draw "Press Cmd+Shift+P" hint when closed
        drawClosedState(width, height);
        return;
    }

    // Draw palette UI
    drawPalette(width, height);
}

function drawClosedState(width, height) {
    mgraphics.set_source_rgba(CONFIG.dimTextColor);
    mgraphics.select_font_face(CONFIG.fontName);
    mgraphics.set_font_size(CONFIG.smallFontSize);

    var hint = "Press Cmd+Shift+P to open";
    var extents = mgraphics.text_measure(hint);
    var x = (width - extents[0]) / 2;
    var y = (height + extents[1]) / 2;

    mgraphics.move_to(x, y);
    mgraphics.show_text(hint);
}

function drawPalette(width, height) {
    var y = CONFIG.padding;

    // Draw search input area
    y = drawSearchInput(CONFIG.padding, y, width - CONFIG.padding * 2);
    y += CONFIG.padding;

    // Draw command list
    drawCommandList(CONFIG.padding, y, width - CONFIG.padding * 2, height - y - CONFIG.padding);

    // Draw status bar at bottom
    drawStatusBar(width, height);
}

function drawSearchInput(x, y, inputWidth) {
    // Input background
    mgraphics.set_source_rgba(CONFIG.inputBgColor);
    roundRect(x, y, inputWidth, CONFIG.inputHeight, CONFIG.borderRadius);
    mgraphics.fill();

    // Input border
    mgraphics.set_source_rgba(CONFIG.borderColor);
    roundRect(x, y, inputWidth, CONFIG.inputHeight, CONFIG.borderRadius);
    mgraphics.stroke();

    // Search icon or ">" prompt
    mgraphics.set_source_rgba(CONFIG.accentColor);
    mgraphics.select_font_face(CONFIG.fontName);
    mgraphics.set_font_size(CONFIG.fontSize);
    mgraphics.move_to(x + 10, y + CONFIG.inputHeight / 2 + 5);
    mgraphics.show_text(">");

    // Query text
    mgraphics.set_source_rgba(CONFIG.textColor);
    var queryText = displayState.query || "";
    mgraphics.move_to(x + 28, y + CONFIG.inputHeight / 2 + 5);
    mgraphics.show_text(queryText);

    // Cursor
    if (queryText.length > 0) {
        var textExtents = mgraphics.text_measure(queryText);
        mgraphics.set_source_rgba(CONFIG.accentColor);
        mgraphics.rectangle(x + 28 + textExtents[0] + 2, y + 8, 2, CONFIG.inputHeight - 16);
        mgraphics.fill();
    } else {
        // Blinking cursor at start
        mgraphics.set_source_rgba(CONFIG.accentColor);
        mgraphics.rectangle(x + 28, y + 8, 2, CONFIG.inputHeight - 16);
        mgraphics.fill();
    }

    return y + CONFIG.inputHeight;
}

function drawCommandList(x, y, listWidth, listHeight) {
    var commands = displayState.commands;
    var selected = displayState.selected;

    if (commands.length === 0) {
        // No results message
        mgraphics.set_source_rgba(CONFIG.dimTextColor);
        mgraphics.select_font_face(CONFIG.fontName);
        mgraphics.set_font_size(CONFIG.fontSize);
        mgraphics.move_to(x + 10, y + 20);
        mgraphics.show_text("No matching commands");
        return;
    }

    // Calculate scroll offset to keep selection visible
    var maxVisible = CONFIG.maxVisibleItems;
    var scrollOffset = 0;
    if (selected >= maxVisible) {
        scrollOffset = selected - maxVisible + 1;
    }

    // Draw visible items
    var itemY = y;
    for (var i = scrollOffset; i < commands.length && i < scrollOffset + maxVisible; i++) {
        var isSelected = (i === selected);
        drawCommandItem(x, itemY, listWidth, commands[i], isSelected, i);
        itemY += CONFIG.itemHeight;
    }

    // Draw scroll indicators if needed
    if (scrollOffset > 0) {
        drawScrollIndicator(x + listWidth - 20, y, "up");
    }
    if (scrollOffset + maxVisible < commands.length) {
        drawScrollIndicator(x + listWidth - 20, y + (maxVisible - 1) * CONFIG.itemHeight, "down");
    }
}

function drawCommandItem(x, y, itemWidth, commandName, isSelected, index) {
    // Background for selected item
    if (isSelected) {
        mgraphics.set_source_rgba(CONFIG.selectedBgColor);
        roundRect(x, y, itemWidth, CONFIG.itemHeight - 2, CONFIG.borderRadius);
        mgraphics.fill();
    }

    // Command text
    mgraphics.set_source_rgba(isSelected ? CONFIG.selectedTextColor : CONFIG.textColor);
    mgraphics.select_font_face(CONFIG.fontName);
    mgraphics.set_font_size(CONFIG.fontSize);

    // Index number (dimmed)
    var indexStr = (index + 1).toString();
    mgraphics.set_source_rgba(isSelected ? CONFIG.selectedTextColor : CONFIG.dimTextColor);
    mgraphics.move_to(x + 10, y + CONFIG.itemHeight / 2 + 4);
    mgraphics.show_text(indexStr + ".");

    // Command name
    mgraphics.set_source_rgba(isSelected ? CONFIG.selectedTextColor : CONFIG.textColor);
    mgraphics.move_to(x + 35, y + CONFIG.itemHeight / 2 + 4);
    mgraphics.show_text(commandName);
}

function drawScrollIndicator(x, y, direction) {
    mgraphics.set_source_rgba(CONFIG.dimTextColor);
    mgraphics.select_font_face(CONFIG.fontName);
    mgraphics.set_font_size(CONFIG.smallFontSize);
    mgraphics.move_to(x, y + 15);
    mgraphics.show_text(direction === "up" ? "▲" : "▼");
}

function drawStatusBar(width, height) {
    var statusY = height - 24;

    // Status text
    mgraphics.set_source_rgba(CONFIG.dimTextColor);
    mgraphics.select_font_face(CONFIG.fontName);
    mgraphics.set_font_size(CONFIG.smallFontSize);

    var statusText = displayState.filtered + " of " + displayState.total + " commands";
    mgraphics.move_to(CONFIG.padding, statusY + 14);
    mgraphics.show_text(statusText);

    // Keyboard hints on the right
    var hints = "↑↓ Navigate  ⏎ Execute  Esc Close";
    var hintsExtents = mgraphics.text_measure(hints);
    mgraphics.move_to(width - CONFIG.padding - hintsExtents[0], statusY + 14);
    mgraphics.show_text(hints);
}

// ============================================================================
// DRAWING UTILITIES
// ============================================================================

function roundRect(x, y, w, h, r) {
    // Draw a rounded rectangle path
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
    post("Palette UI loaded\n");
    mgraphics.redraw();
}

# Contributing to Ableton Command Palette

Thank you for your interest in contributing! This project is in active development and we welcome contributions of all kinds.

## Ways to Contribute

### Report Bugs

Found a bug? Please [open an issue](https://github.com/ben-juodvalkis/ableton-command-palette/issues/new?template=bug_report.md) with:

- Ableton Live version
- Steps to reproduce
- Expected vs actual behavior
- Max console output (if relevant)

### Request Features

Have an idea? [Open an issue](https://github.com/ben-juodvalkis/ableton-command-palette/issues/new?template=feature_request.md) describing:

- What you'd like to see
- Why it would be useful
- Any implementation ideas

### Request Commands

Want a new command added? [Open an issue](https://github.com/ben-juodvalkis/ableton-command-palette/issues/new?template=command_request.md) with:

- Command name and description
- The Live Object Model (LOM) path if known
- Any parameters it should accept

### Contribute Code

Ready to write code? Here's how:

1. Clone the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test in Ableton Live 12
5. Commit with clear messages
6. Push and open a Pull Request

## Development Setup

### Prerequisites

- Ableton Live 12+ with Max for Live
- Git
- A text editor

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/ben-juodvalkis/ableton-command-palette.git
   ```

2. Open the project in your editor

3. To test changes:
   - Open Ableton Live
   - Drag `src/CommandPalette.amxd` onto a track
   - JavaScript files have `autowatch = 1` so they reload automatically

### Project Structure

```
ableton-command-palette/
├── src/                     # Main implementation
│   ├── CommandPalette.amxd  # Max patcher (the device)
│   ├── main.js              # Entry point, command execution
│   ├── core/                # Core modules
│   │   ├── CommandRegistry.js
│   │   ├── FuzzyMatcher.js
│   │   └── LOMInterface.js
│   ├── ui/                  # UI rendering
│   │   └── palette.js
│   └── commands/            # Command definitions
│       ├── transport.js
│       ├── tracks.js
│       ├── navigation.js
│       ├── devices.js
│       ├── clips.js
│       └── scenes.js
├── prototype/               # Original prototype (reference)
├── documentation/           # Technical docs and ADRs
└── COMMANDS.md              # Command reference
```

### Adding a New Command

1. Find the appropriate file in `src/commands/` (or create a new category file)

2. Add the command definition:
   ```javascript
   {
       id: "category.commandName",
       title: "Human Readable Name",
       category: "Category",
       keywords: ["alias", "alternative", "terms"],
       description: "What this command does",
       action: "handlerName"
   }
   ```

3. Add the handler in `src/core/LOMInterface.js`:
   ```javascript
   handlerName: function() {
       var api = new LiveAPI("live_set");
       // Your LOM code here
   }
   ```

4. Test the command in Live

5. Update `COMMANDS.md` to mark it as implemented

### Coding Guidelines

- **JavaScript:** Use CommonJS (`require`/`module.exports`), not ES6 modules
- **Naming:** camelCase for functions/variables, PascalCase for classes
- **Comments:** Add comments for non-obvious LOM interactions
- **Testing:** Test in Live before submitting (we don't have automated tests yet)

### Max for Live Notes

- Use `autowatch = 1` for live reloading during development
- `post()` writes to Max console for debugging
- Max v8 uses CommonJS, not ES6 modules
- v8ui supports ES6+ syntax for UI code

### Commit Messages

Use conventional commits:

- `feat:` New feature or command
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding tests

Examples:
```
feat: Add "Freeze Track" command
fix: Correct clip quantize to 1/16 notes
docs: Update installation instructions
```

## Pull Request Process

1. Update documentation if needed
2. Update COMMANDS.md if adding commands
3. Describe your changes in the PR description
4. Link any related issues

## Questions?

- Open an issue for questions about contributing
- Check existing issues and documentation first

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

---

Thank you for helping make Ableton more keyboard-friendly!

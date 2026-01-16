# CLAUDE.md

Command palette for Ableton Live 12+ built as a Max for Live device.

## Key Files

- `src/main.js` - Entry point, state management
- `src/core/LOMInterface.js` - Command handlers (add new commands here)
- `src/commands/*.js` - Command definitions
- `COMMANDS.md` - Update when adding commands (mark `[x]`)

## Critical Constraints

**Max v8 uses CommonJS only:**
```javascript
// YES
const { Thing } = require('./Thing.js');
module.exports = { Thing };

// NO - will error
import { Thing } from './Thing.js';
```

**Don't declare inlets/outlets with const/let:**
```javascript
// YES
inlets = 1;
outlets = 2;

// NO - "already declared" error
const inlets = 1;
```

## LOM Patterns

```javascript
var api = new LiveAPI("live_set");
api.call("start_playing");

var track = new LiveAPI("live_set view selected_track");
track.set("mute", 1);
track.call("create_device", "Compressor");
```

## Development

- `autowatch = 1` enables live reload
- `post("msg\n")` logs to Max console

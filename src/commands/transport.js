/**
 * Transport Commands
 *
 * Commands for controlling playback, recording, and view switching.
 */

const transportCommands = [
    {
        id: "transport.play",
        title: "Play",
        category: "Transport",
        keywords: ["start", "go", "playback"],
        description: "Start playback",
        action: "transport.play"
    },
    {
        id: "transport.stop",
        title: "Stop",
        category: "Transport",
        keywords: ["pause", "halt", "playback"],
        description: "Stop playback",
        action: "transport.stop"
    },
    {
        id: "transport.record",
        title: "Record",
        category: "Transport",
        keywords: ["rec", "arm", "recording"],
        description: "Toggle recording",
        action: "transport.record"
    },
    {
        id: "transport.loop",
        title: "Toggle Loop",
        category: "Transport",
        keywords: ["repeat", "cycle", "looping"],
        description: "Toggle loop playback",
        action: "transport.loop"
    },
    {
        id: "transport.metronome",
        title: "Toggle Metronome",
        category: "Transport",
        keywords: ["click", "metro", "beat", "tempo"],
        description: "Toggle metronome on/off",
        action: "transport.metronome"
    },
    {
        id: "transport.tapTempo",
        title: "Tap Tempo",
        category: "Transport",
        keywords: ["bpm", "beat", "speed"],
        description: "Tap tempo",
        action: "transport.tapTempo"
    },
    {
        id: "transport.arrangement",
        title: "Go to Arrangement",
        category: "Transport",
        keywords: ["view", "arrange", "timeline"],
        description: "Switch to Arrangement view",
        action: "transport.arrangement"
    },
    {
        id: "transport.session",
        title: "Go to Session",
        category: "Transport",
        keywords: ["view", "clips", "launch"],
        description: "Switch to Session view",
        action: "transport.session"
    }
];

module.exports = transportCommands;

/**
 * Track Commands
 *
 * Commands for track manipulation: mute, solo, arm, create, delete, duplicate.
 */

const trackCommands = [
    {
        id: "track.mute",
        title: "Mute Selected Track",
        category: "Track",
        keywords: ["silence", "quiet", "off"],
        description: "Toggle mute on selected track",
        action: "track.mute"
    },
    {
        id: "track.unmute",
        title: "Unmute Selected Track",
        category: "Track",
        keywords: ["sound", "enable", "on"],
        description: "Unmute selected track",
        action: "track.unmute"
    },
    {
        id: "track.solo",
        title: "Solo Selected Track",
        category: "Track",
        keywords: ["isolate", "only", "single"],
        description: "Toggle solo on selected track",
        action: "track.solo"
    },
    {
        id: "track.unsolo",
        title: "Unsolo Selected Track",
        category: "Track",
        keywords: ["all", "mix", "restore"],
        description: "Unsolo selected track",
        action: "track.unsolo"
    },
    {
        id: "track.arm",
        title: "Arm Selected Track",
        category: "Track",
        keywords: ["record", "enable", "rec"],
        description: "Arm selected track for recording",
        action: "track.arm"
    },
    {
        id: "track.disarm",
        title: "Disarm Selected Track",
        category: "Track",
        keywords: ["record", "disable", "off"],
        description: "Disarm selected track",
        action: "track.disarm"
    },
    {
        id: "track.createAudio",
        title: "Create Audio Track",
        category: "Track",
        keywords: ["new", "add", "audio", "insert"],
        description: "Create a new audio track",
        action: "track.createAudio"
    },
    {
        id: "track.createMidi",
        title: "Create MIDI Track",
        category: "Track",
        keywords: ["new", "add", "midi", "insert"],
        description: "Create a new MIDI track",
        action: "track.createMidi"
    },
    {
        id: "track.delete",
        title: "Delete Selected Track",
        category: "Track",
        keywords: ["remove", "delete", "trash"],
        description: "Delete the selected track",
        action: "track.delete"
    },
    {
        id: "track.duplicate",
        title: "Duplicate Selected Track",
        category: "Track",
        keywords: ["copy", "clone", "dupe"],
        description: "Duplicate the selected track",
        action: "track.duplicate"
    }
];

module.exports = trackCommands;

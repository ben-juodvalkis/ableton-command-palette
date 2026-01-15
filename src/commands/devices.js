/**
 * Device Commands
 *
 * Commands for adding, manipulating, and removing devices.
 * Includes audio effects, MIDI effects, and instruments.
 */

const deviceCommands = [
    // Audio Effects
    {
        id: "device.addCompressor",
        title: "Add Compressor",
        category: "Device",
        keywords: ["dynamics", "compress", "effect", "insert"],
        description: "Add Compressor to selected track",
        action: "device.addCompressor",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addEqEight",
        title: "Add EQ Eight",
        category: "Device",
        keywords: ["equalizer", "eq", "frequency", "effect", "insert"],
        description: "Add EQ Eight to selected track",
        action: "device.addEqEight",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addReverb",
        title: "Add Reverb",
        category: "Device",
        keywords: ["space", "room", "hall", "effect", "insert"],
        description: "Add Reverb to selected track",
        action: "device.addReverb",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addDelay",
        title: "Add Delay",
        category: "Device",
        keywords: ["echo", "repeat", "effect", "insert"],
        description: "Add Delay to selected track",
        action: "device.addDelay",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addAutoFilter",
        title: "Add Auto Filter",
        category: "Device",
        keywords: ["filter", "sweep", "lfo", "effect", "insert"],
        description: "Add Auto Filter to selected track",
        action: "device.addAutoFilter",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addSaturator",
        title: "Add Saturator",
        category: "Device",
        keywords: ["distortion", "warmth", "drive", "effect", "insert"],
        description: "Add Saturator to selected track",
        action: "device.addSaturator",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addLimiter",
        title: "Add Limiter",
        category: "Device",
        keywords: ["dynamics", "loud", "ceiling", "effect", "insert"],
        description: "Add Limiter to selected track",
        action: "device.addLimiter",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addGate",
        title: "Add Gate",
        category: "Device",
        keywords: ["dynamics", "noise", "threshold", "effect", "insert"],
        description: "Add Gate to selected track",
        action: "device.addGate",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addChorus",
        title: "Add Chorus",
        category: "Device",
        keywords: ["modulation", "double", "thick", "effect", "insert"],
        description: "Add Chorus to selected track",
        action: "device.addChorus",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addPhaser",
        title: "Add Phaser",
        category: "Device",
        keywords: ["modulation", "sweep", "effect", "insert"],
        description: "Add Phaser to selected track",
        action: "device.addPhaser",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addUtility",
        title: "Add Utility",
        category: "Device",
        keywords: ["gain", "pan", "phase", "width", "effect", "insert"],
        description: "Add Utility to selected track",
        action: "device.addUtility",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addSpectrum",
        title: "Add Spectrum",
        category: "Device",
        keywords: ["analyzer", "frequency", "visual", "meter", "insert"],
        description: "Add Spectrum analyzer to selected track",
        action: "device.addSpectrum",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addTuner",
        title: "Add Tuner",
        category: "Device",
        keywords: ["pitch", "tune", "guitar", "insert"],
        description: "Add Tuner to selected track",
        action: "device.addTuner",
        requires: { selectedTrack: true }
    },

    // MIDI Effects
    {
        id: "device.addArpeggiator",
        title: "Add Arpeggiator",
        category: "Device",
        keywords: ["midi", "arp", "pattern", "sequence", "insert"],
        description: "Add Arpeggiator MIDI effect to selected track",
        action: "device.addArpeggiator",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addChord",
        title: "Add Chord",
        category: "Device",
        keywords: ["midi", "harmony", "notes", "insert"],
        description: "Add Chord MIDI effect to selected track",
        action: "device.addChord",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addScale",
        title: "Add Scale",
        category: "Device",
        keywords: ["midi", "key", "quantize", "notes", "insert"],
        description: "Add Scale MIDI effect to selected track",
        action: "device.addScale",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addNoteLength",
        title: "Add Note Length",
        category: "Device",
        keywords: ["midi", "duration", "gate", "insert"],
        description: "Add Note Length MIDI effect to selected track",
        action: "device.addNoteLength",
        requires: { selectedTrack: true }
    },

    // Instruments
    {
        id: "device.addWavetable",
        title: "Add Wavetable",
        category: "Device",
        keywords: ["synth", "instrument", "oscillator", "insert"],
        description: "Add Wavetable synthesizer to selected track",
        action: "device.addWavetable",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addOperator",
        title: "Add Operator",
        category: "Device",
        keywords: ["synth", "instrument", "fm", "insert"],
        description: "Add Operator synthesizer to selected track",
        action: "device.addOperator",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addDrift",
        title: "Add Drift",
        category: "Device",
        keywords: ["synth", "instrument", "analog", "insert"],
        description: "Add Drift synthesizer to selected track",
        action: "device.addDrift",
        requires: { selectedTrack: true }
    },
    {
        id: "device.addSimpler",
        title: "Add Simpler",
        category: "Device",
        keywords: ["sampler", "instrument", "sample", "insert"],
        description: "Add Simpler sampler to selected track",
        action: "device.addSimpler",
        requires: { selectedTrack: true }
    },

    // Device Operations
    {
        id: "device.bypass",
        title: "Bypass Selected Device",
        category: "Device",
        keywords: ["disable", "off", "toggle", "mute"],
        description: "Toggle bypass on selected device",
        action: "device.bypass",
        requires: { selectedDevice: true }
    },
    {
        id: "device.delete",
        title: "Delete Selected Device",
        category: "Device",
        keywords: ["remove", "delete"],
        description: "Delete the selected device",
        action: "device.delete",
        requires: { selectedDevice: true }
    },
    {
        id: "device.duplicate",
        title: "Duplicate Selected Device",
        category: "Device",
        keywords: ["copy", "clone"],
        description: "Duplicate the selected device",
        action: "device.duplicate",
        requires: { selectedDevice: true }
    },
    {
        id: "device.showHide",
        title: "Show/Hide Selected Device",
        category: "Device",
        keywords: ["collapse", "expand", "view", "toggle"],
        description: "Toggle visibility of selected device",
        action: "device.showHide",
        requires: { selectedDevice: true }
    }
];

module.exports = deviceCommands;

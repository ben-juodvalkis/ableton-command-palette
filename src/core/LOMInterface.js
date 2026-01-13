/**
 * LOMInterface - Live Object Model Interface
 *
 * Wrapper around Ableton's Live API (LiveAPI) providing
 * a clean interface for command execution.
 *
 * Design Decision: LiveAPI Object Management
 * - Static paths (live_set, live_set view) are cached as singletons
 * - Dynamic paths (tracks N, devices N) are created per-call
 * - See ADR 002 for rationale
 */

class LOMInterface {
    constructor() {
        const self = this;

        // Cached LiveAPI objects for static paths
        // These are safe to reuse as their paths never change
        this._liveSetApi = null;
        this._viewApi = null;

        // Action handlers map action strings to methods
        this.handlers = {
            // Transport
            'transport.play': () => self.transportPlay(),
            'transport.stop': () => self.transportStop(),
            'transport.record': () => self.transportRecord(),
            'transport.loop': () => self.transportLoop(),
            'transport.metronome': () => self.transportMetronome(),
            'transport.tapTempo': () => self.transportTapTempo(),
            'transport.arrangement': () => self.transportArrangement(),
            'transport.session': () => self.transportSession(),

            // Track
            'track.mute': () => self.trackMute(),
            'track.unmute': () => self.trackUnmute(),
            'track.solo': () => self.trackSolo(),
            'track.unsolo': () => self.trackUnsolo(),
            'track.arm': () => self.trackArm(),
            'track.disarm': () => self.trackDisarm(),
            'track.createAudio': () => self.trackCreateAudio(),
            'track.createMidi': () => self.trackCreateMidi(),
            'track.delete': () => self.trackDelete(),
            'track.duplicate': () => self.trackDuplicate(),

            // Navigation
            'nav.nextTrack': () => self.navNextTrack(),
            'nav.prevTrack': () => self.navPrevTrack(),
            'nav.nextDevice': () => self.navNextDevice(),
            'nav.prevDevice': () => self.navPrevDevice(),
            'nav.nextScene': () => self.navNextScene(),
            'nav.prevScene': () => self.navPrevScene(),
            'nav.focusBrowser': () => self.navFocusBrowser(),

            // Device - Add Effects
            'device.addCompressor': () => self.deviceAdd("Compressor"),
            'device.addEqEight': () => self.deviceAdd("EQ Eight"),
            'device.addReverb': () => self.deviceAdd("Reverb"),
            'device.addDelay': () => self.deviceAdd("Delay"),
            'device.addAutoFilter': () => self.deviceAdd("Auto Filter"),
            'device.addSaturator': () => self.deviceAdd("Saturator"),
            'device.addLimiter': () => self.deviceAdd("Limiter"),
            'device.addGate': () => self.deviceAdd("Gate"),
            'device.addChorus': () => self.deviceAdd("Chorus-Ensemble"),
            'device.addPhaser': () => self.deviceAdd("Phaser"),
            'device.addUtility': () => self.deviceAdd("Utility"),
            'device.addSpectrum': () => self.deviceAdd("Spectrum"),
            'device.addTuner': () => self.deviceAdd("Tuner"),

            // Device - Add MIDI Effects
            'device.addArpeggiator': () => self.deviceAdd("Arpeggiator"),
            'device.addChord': () => self.deviceAdd("Chord"),
            'device.addScale': () => self.deviceAdd("Scale"),
            'device.addNoteLength': () => self.deviceAdd("Note Length"),

            // Device - Add Instruments
            'device.addWavetable': () => self.deviceAdd("Wavetable"),
            'device.addOperator': () => self.deviceAdd("Operator"),
            'device.addDrift': () => self.deviceAdd("Drift"),
            'device.addSimpler': () => self.deviceAdd("Simpler"),

            // Device - Operations
            'device.bypass': () => self.deviceBypass(),
            'device.delete': () => self.deviceDelete(),
            'device.duplicate': () => self.deviceDuplicate(),
            'device.showHide': () => self.deviceShowHide(),

            // Clip
            'clip.fire': () => self.clipFire(),
            'clip.stop': () => self.clipStop(),
            'clip.delete': () => self.clipDelete(),
            'clip.duplicate': () => self.clipDuplicate(),
            'clip.quantize14': () => self.clipQuantize(1.0),
            'clip.quantize18': () => self.clipQuantize(0.5),
            'clip.quantize116': () => self.clipQuantize(0.25),
            'clip.loopSelection': () => self.clipLoopSelection(),
            'clip.consolidate': () => self.clipConsolidate(),
            'clip.doubleLoop': () => self.clipDoubleLoop(),
            'clip.halveLoop': () => self.clipHalveLoop(),
            'clip.setLoopOn': () => self.clipSetLoop(true),
            'clip.setLoopOff': () => self.clipSetLoop(false),
            'clip.cropToLoop': () => self.clipCropToLoop(),
            'clip.rename': () => self.clipRename(),

            // Scene
            'scene.fire': () => self.sceneFire(),
            'scene.fireNext': () => self.sceneFireNext(),
            'scene.firePrev': () => self.sceneFirePrev(),
            'scene.stopAll': () => self.sceneStopAll(),
            'scene.create': () => self.sceneCreate(),
            'scene.delete': () => self.sceneDelete(),
            'scene.duplicate': () => self.sceneDuplicate(),
            'scene.capture': () => self.sceneCapture(),
            'scene.rename': () => self.sceneRename(),
            'scene.setTempo': () => self.sceneSetTempo()
        };
    }

    /**
     * Execute a command action
     * @param {string} action - Action identifier (e.g., "transport.play")
     * @param {*} params - Optional parameters
     */
    execute(action, params) {
        const handler = this.handlers[action];
        if (!handler) {
            throw new Error(`Unknown action: ${action}`);
        }
        return handler(params);
    }

    // ============================================================================
    // CACHED API ACCESSORS
    // ============================================================================

    /**
     * Get cached LiveAPI for live_set (singleton)
     * @returns {LiveAPI} Cached live_set API object
     */
    _getLiveSetApi() {
        if (!this._liveSetApi) {
            this._liveSetApi = new LiveAPI("live_set");
        }
        return this._liveSetApi;
    }

    /**
     * Get cached LiveAPI for live_set view (singleton)
     * @returns {LiveAPI} Cached view API object
     */
    _getViewApi() {
        if (!this._viewApi) {
            this._viewApi = new LiveAPI("live_set view");
        }
        return this._viewApi;
    }

    // ============================================================================
    // TRANSPORT COMMANDS
    // ============================================================================

    transportPlay() {
        const api = this._getLiveSetApi();
        api.call("start_playing");
        post("Transport: Play\n");
    }

    transportStop() {
        const api = this._getLiveSetApi();
        api.call("stop_playing");
        post("Transport: Stop\n");
    }

    transportRecord() {
        const api = this._getLiveSetApi();
        const current = api.get("record_mode");
        api.set("record_mode", current == 1 ? 0 : 1);
        post(`Transport: Record ${current == 1 ? "Off" : "On"}\n`);
    }

    transportLoop() {
        const api = this._getLiveSetApi();
        const current = api.get("loop");
        api.set("loop", current == 1 ? 0 : 1);
        post(`Transport: Loop ${current == 1 ? "Off" : "On"}\n`);
    }

    transportMetronome() {
        const api = this._getLiveSetApi();
        const current = api.get("metronome");
        api.set("metronome", current == 1 ? 0 : 1);
        post(`Transport: Metronome ${current == 1 ? "Off" : "On"}\n`);
    }

    transportTapTempo() {
        const api = this._getLiveSetApi();
        api.call("tap_tempo");
        post("Transport: Tap Tempo\n");
    }

    transportArrangement() {
        const api = this._getViewApi();
        api.set("focused_document_view", 1); // 1 = Arrangement
        post("Transport: Arrangement View\n");
    }

    transportSession() {
        const api = this._getViewApi();
        api.set("focused_document_view", 0); // 0 = Session
        post("Transport: Session View\n");
    }

    // ============================================================================
    // TRACK COMMANDS
    // ============================================================================

    _getSelectedTrack() {
        const track = new LiveAPI("live_set view selected_track");
        if (!track.id || track.id == 0) {
            post("No track selected\n");
            return null;
        }
        return track;
    }

    trackMute() {
        const track = this._getSelectedTrack();
        if (!track) return;
        const current = track.get("mute");
        track.set("mute", current == 1 ? 0 : 1);
        post(`Track: Mute ${current == 1 ? "Off" : "On"}\n`);
    }

    trackUnmute() {
        const track = this._getSelectedTrack();
        if (!track) return;
        track.set("mute", 0);
        post("Track: Unmuted\n");
    }

    trackSolo() {
        const track = this._getSelectedTrack();
        if (!track) return;
        const current = track.get("solo");
        track.set("solo", current == 1 ? 0 : 1);
        post(`Track: Solo ${current == 1 ? "Off" : "On"}\n`);
    }

    trackUnsolo() {
        const track = this._getSelectedTrack();
        if (!track) return;
        track.set("solo", 0);
        post("Track: Unsoloed\n");
    }

    trackArm() {
        const track = this._getSelectedTrack();
        if (!track) return;
        // Check if track can be armed (not master or return)
        const canArm = track.get("can_be_armed");
        if (canArm == 0) {
            post("Track: Cannot be armed\n");
            return;
        }
        track.set("arm", 1);
        post("Track: Armed\n");
    }

    trackDisarm() {
        const track = this._getSelectedTrack();
        if (!track) return;
        track.set("arm", 0);
        post("Track: Disarmed\n");
    }

    trackCreateAudio() {
        const api = this._getLiveSetApi();
        api.call("create_audio_track", -1); // -1 = at end
        post("Track: Created Audio Track\n");
    }

    trackCreateMidi() {
        const api = this._getLiveSetApi();
        api.call("create_midi_track", -1); // -1 = at end
        post("Track: Created MIDI Track\n");
    }

    trackDelete() {
        const track = this._getSelectedTrack();
        if (!track) return;

        const api = this._getLiveSetApi();
        const trackPath = track.path;

        // Extract track index from path
        const match = trackPath.match(/tracks\s+(\d+)/);
        if (match) {
            const trackIndex = parseInt(match[1]);
            api.call("delete_track", trackIndex);
            post(`Track: Deleted track at index ${trackIndex}\n`);
        } else {
            post("Track: Could not determine track index\n");
        }
    }

    trackDuplicate() {
        const track = this._getSelectedTrack();
        if (!track) return;

        const api = this._getLiveSetApi();
        const trackPath = track.path;

        // Extract track index from path
        const match = trackPath.match(/tracks\s+(\d+)/);
        if (match) {
            const trackIndex = parseInt(match[1]);
            api.call("duplicate_track", trackIndex);
            post(`Track: Duplicated track at index ${trackIndex}\n`);
        } else {
            post("Track: Could not determine track index\n");
        }
    }

    // ============================================================================
    // NAVIGATION COMMANDS
    // ============================================================================

    navNextTrack() {
        const api = this._getViewApi();
        const liveSet = this._getLiveSetApi();

        // Get all tracks
        const tracks = liveSet.get("tracks");
        const trackCount = tracks.length / 2; // tracks is [id, id, ...]

        // Bounds check: no tracks to navigate
        if (trackCount === 0) {
            post("Navigation: No tracks in set\n");
            return;
        }

        // Get current track index (need fresh API for dynamic path)
        const currentTrack = new LiveAPI("live_set view selected_track");
        const trackPath = currentTrack.path;
        const match = trackPath.match(/tracks\s+(\d+)/);

        if (match) {
            const currentIndex = parseInt(match[1]);
            const nextIndex = Math.min(currentIndex + 1, trackCount - 1);
            api.set("selected_track", `live_set tracks ${nextIndex}`);
            post(`Navigation: Selected track ${nextIndex}\n`);
        }
    }

    navPrevTrack() {
        const api = this._getViewApi();

        // Get current track index (need fresh API for dynamic path)
        const currentTrack = new LiveAPI("live_set view selected_track");
        const trackPath = currentTrack.path;
        const match = trackPath.match(/tracks\s+(\d+)/);

        if (match) {
            const currentIndex = parseInt(match[1]);
            const prevIndex = Math.max(currentIndex - 1, 0);
            api.set("selected_track", `live_set tracks ${prevIndex}`);
            post(`Navigation: Selected track ${prevIndex}\n`);
        }
    }

    navNextDevice() {
        // Need fresh API for dynamic selected_track path
        const track = new LiveAPI("live_set view selected_track");
        if (!track.id || track.id == 0) {
            post("Navigation: No track selected\n");
            return;
        }

        const devices = track.get("devices");
        const deviceCount = devices.length / 2;

        // Bounds check: no devices to navigate
        if (deviceCount === 0) {
            post("Navigation: No devices on track\n");
            return;
        }

        // Get current device index
        const currentDevice = new LiveAPI("live_set view selected_track view selected_device");
        const devicePath = currentDevice.path;
        const match = devicePath.match(/devices\s+(\d+)/);
        const currentIndex = match ? parseInt(match[1]) : -1;
        const nextIndex = Math.min(currentIndex + 1, deviceCount - 1);

        const view = this._getViewApi();
        view.set("select_device", `live_set view selected_track devices ${nextIndex}`);
        post(`Navigation: Selected device ${nextIndex}\n`);
    }

    navPrevDevice() {
        // Need fresh API for dynamic selected_track path
        const track = new LiveAPI("live_set view selected_track");
        if (!track.id || track.id == 0) {
            post("Navigation: No track selected\n");
            return;
        }

        const devices = track.get("devices");
        const deviceCount = devices.length / 2;

        // Bounds check: no devices to navigate
        if (deviceCount === 0) {
            post("Navigation: No devices on track\n");
            return;
        }

        // Get current device index
        const currentDevice = new LiveAPI("live_set view selected_track view selected_device");
        const devicePath = currentDevice.path;
        const match = devicePath.match(/devices\s+(\d+)/);
        const currentIndex = match ? parseInt(match[1]) : 0;
        const prevIndex = Math.max(currentIndex - 1, 0);

        const view = this._getViewApi();
        view.set("select_device", `live_set view selected_track devices ${prevIndex}`);
        post(`Navigation: Selected device ${prevIndex}\n`);
    }

    navNextScene() {
        const api = this._getViewApi();
        const liveSet = this._getLiveSetApi();

        const scenes = liveSet.get("scenes");
        const sceneCount = scenes.length / 2;

        // Bounds check: no scenes to navigate
        if (sceneCount === 0) {
            post("Navigation: No scenes in set\n");
            return;
        }

        // Get current scene index (need fresh API for dynamic path)
        const currentScene = new LiveAPI("live_set view selected_scene");
        const scenePath = currentScene.path;
        const match = scenePath.match(/scenes\s+(\d+)/);

        if (match) {
            const currentIndex = parseInt(match[1]);
            const nextIndex = Math.min(currentIndex + 1, sceneCount - 1);
            api.set("selected_scene", `live_set scenes ${nextIndex}`);
            post(`Navigation: Selected scene ${nextIndex}\n`);
        }
    }

    navPrevScene() {
        const api = this._getViewApi();

        // Get current scene index (need fresh API for dynamic path)
        const currentScene = new LiveAPI("live_set view selected_scene");
        const scenePath = currentScene.path;
        const match = scenePath.match(/scenes\s+(\d+)/);

        if (match) {
            const currentIndex = parseInt(match[1]);
            const prevIndex = Math.max(currentIndex - 1, 0);
            api.set("selected_scene", `live_set scenes ${prevIndex}`);
            post(`Navigation: Selected scene ${prevIndex}\n`);
        }
    }

    navFocusBrowser() {
        const api = this._getViewApi();
        api.set("browse_mode", 1);
        post("Navigation: Browser focused\n");
    }

    // ============================================================================
    // DEVICE COMMANDS
    // ============================================================================

    /**
     * Get the selected device
     * @returns {LiveAPI|null} Device API or null
     */
    _getSelectedDevice() {
        const device = new LiveAPI("live_set view selected_track view selected_device");
        if (!device.id || device.id == 0) {
            post("No device selected\n");
            return null;
        }
        return device;
    }

    /**
     * Add a device to the selected track
     * Uses Live 12's create_device method with browser item references
     * @param {string} deviceName - Name of the device to add
     */
    deviceAdd(deviceName) {
        const track = this._getSelectedTrack();
        if (!track) return;

        try {
            // Live 12 uses create_device with browser item path
            // Format varies by device type - try common paths
            track.call("create_device", deviceName);
            post(`Device: Added ${deviceName}\n`);
        } catch (e) {
            post(`Device: Could not add ${deviceName} - ${e.message}\n`);
        }
    }

    /**
     * Toggle bypass on selected device
     */
    deviceBypass() {
        const device = this._getSelectedDevice();
        if (!device) return;

        const current = device.get("is_active");
        device.set("is_active", current == 1 ? 0 : 1);
        post(`Device: ${current == 1 ? "Bypassed" : "Activated"}\n`);
    }

    /**
     * Delete the selected device
     */
    deviceDelete() {
        const device = this._getSelectedDevice();
        if (!device) return;

        const track = this._getSelectedTrack();
        if (!track) return;

        const devicePath = device.path;
        const match = devicePath.match(/devices\s+(\d+)/);

        if (match) {
            const deviceIndex = parseInt(match[1]);
            track.call("delete_device", deviceIndex);
            post(`Device: Deleted device at index ${deviceIndex}\n`);
        } else {
            post("Device: Could not determine device index\n");
        }
    }

    /**
     * Duplicate the selected device
     */
    deviceDuplicate() {
        const device = this._getSelectedDevice();
        if (!device) return;

        // Copy device to clipboard and paste
        // Note: This requires the device to be selected in the UI
        const api = this._getLiveSetApi();
        api.call("copy_device");
        api.call("paste_device");
        post("Device: Duplicated\n");
    }

    /**
     * Toggle visibility of selected device (collapse/expand)
     */
    deviceShowHide() {
        const device = this._getSelectedDevice();
        if (!device) return;

        const current = device.get("view");
        const collapsed = current && current.get && current.get("is_collapsed");
        // Note: Device view collapse is not directly accessible via LOM in all cases
        // This is a placeholder - actual implementation may need UI scripting
        post("Device: Toggle visibility (limited LOM support)\n");
    }

    // ============================================================================
    // CLIP COMMANDS
    // ============================================================================

    /**
     * Get the selected clip slot and clip
     * @returns {Object|null} {slot, clip} or null
     */
    _getSelectedClipSlot() {
        const slot = new LiveAPI("live_set view highlighted_clip_slot");
        if (!slot.id || slot.id == 0) {
            post("No clip slot selected\n");
            return null;
        }

        // Check if slot has a clip
        const hasClip = slot.get("has_clip");
        if (hasClip == 0) {
            return { slot: slot, clip: null };
        }

        const clip = new LiveAPI("live_set view highlighted_clip_slot clip");
        return { slot: slot, clip: clip };
    }

    /**
     * Fire the selected clip
     */
    clipFire() {
        const result = this._getSelectedClipSlot();
        if (!result) return;

        result.slot.call("fire");
        post("Clip: Fired\n");
    }

    /**
     * Stop the selected clip slot
     */
    clipStop() {
        const result = this._getSelectedClipSlot();
        if (!result) return;

        result.slot.call("stop");
        post("Clip: Stopped\n");
    }

    /**
     * Delete the clip in the selected slot
     */
    clipDelete() {
        const result = this._getSelectedClipSlot();
        if (!result || !result.clip) {
            post("Clip: No clip in selected slot\n");
            return;
        }

        result.slot.call("delete_clip");
        post("Clip: Deleted\n");
    }

    /**
     * Duplicate the selected clip
     */
    clipDuplicate() {
        const result = this._getSelectedClipSlot();
        if (!result || !result.clip) {
            post("Clip: No clip in selected slot\n");
            return;
        }

        result.slot.call("duplicate_clip_to", result.slot.path);
        post("Clip: Duplicated\n");
    }

    /**
     * Quantize clip notes to specified grid
     * @param {number} gridSize - Grid size in beats (1.0 = quarter, 0.5 = eighth, 0.25 = sixteenth)
     */
    clipQuantize(gridSize) {
        const result = this._getSelectedClipSlot();
        if (!result || !result.clip) {
            post("Clip: No clip in selected slot\n");
            return;
        }

        // Quantize is only available for MIDI clips
        try {
            result.clip.call("quantize", gridSize, 1.0); // gridSize, strength
            post(`Clip: Quantized to ${gridSize} beats\n`);
        } catch (e) {
            post(`Clip: Could not quantize - ${e.message}\n`);
        }
    }

    /**
     * Set loop to current selection (arrangement view)
     */
    clipLoopSelection() {
        const api = this._getLiveSetApi();
        api.call("set_loop_from_selection");
        post("Clip: Loop set from selection\n");
    }

    /**
     * Consolidate selected clips (arrangement view)
     */
    clipConsolidate() {
        const api = this._getLiveSetApi();
        api.call("consolidate_selected");
        post("Clip: Consolidated\n");
    }

    /**
     * Double the clip loop length
     */
    clipDoubleLoop() {
        const result = this._getSelectedClipSlot();
        if (!result || !result.clip) {
            post("Clip: No clip in selected slot\n");
            return;
        }

        const loopEnd = result.clip.get("loop_end");
        const loopStart = result.clip.get("loop_start");
        const length = loopEnd - loopStart;

        result.clip.set("loop_end", loopEnd + length);
        post(`Clip: Doubled loop length to ${loopEnd + length}\n`);
    }

    /**
     * Halve the clip loop length
     */
    clipHalveLoop() {
        const result = this._getSelectedClipSlot();
        if (!result || !result.clip) {
            post("Clip: No clip in selected slot\n");
            return;
        }

        const loopEnd = result.clip.get("loop_end");
        const loopStart = result.clip.get("loop_start");
        const length = loopEnd - loopStart;

        if (length > 0.25) { // Don't go below minimum length
            result.clip.set("loop_end", loopStart + (length / 2));
            post(`Clip: Halved loop length to ${loopStart + (length / 2)}\n`);
        } else {
            post("Clip: Loop already at minimum length\n");
        }
    }

    /**
     * Enable or disable clip looping
     * @param {boolean} enabled - Whether to enable looping
     */
    clipSetLoop(enabled) {
        const result = this._getSelectedClipSlot();
        if (!result || !result.clip) {
            post("Clip: No clip in selected slot\n");
            return;
        }

        result.clip.set("looping", enabled ? 1 : 0);
        post(`Clip: Looping ${enabled ? "enabled" : "disabled"}\n`);
    }

    /**
     * Crop clip to loop region
     */
    clipCropToLoop() {
        const result = this._getSelectedClipSlot();
        if (!result || !result.clip) {
            post("Clip: No clip in selected slot\n");
            return;
        }

        result.clip.call("crop");
        post("Clip: Cropped to loop\n");
    }

    /**
     * Rename selected clip (placeholder - requires UI interaction)
     */
    clipRename() {
        const result = this._getSelectedClipSlot();
        if (!result || !result.clip) {
            post("Clip: No clip in selected slot\n");
            return;
        }

        // Note: Renaming requires setting the name property
        // For now just log - a full implementation would need a text input dialog
        post("Clip: Rename (requires text input)\n");
    }

    // ============================================================================
    // SCENE COMMANDS
    // ============================================================================

    /**
     * Get the selected scene
     * @returns {LiveAPI|null} Scene API or null
     */
    _getSelectedScene() {
        const scene = new LiveAPI("live_set view selected_scene");
        if (!scene.id || scene.id == 0) {
            post("No scene selected\n");
            return null;
        }
        return scene;
    }

    /**
     * Fire the selected scene
     */
    sceneFire() {
        const scene = this._getSelectedScene();
        if (!scene) return;

        scene.call("fire");
        post("Scene: Fired\n");
    }

    /**
     * Fire the next scene
     */
    sceneFireNext() {
        const liveSet = this._getLiveSetApi();
        const scenes = liveSet.get("scenes");
        const sceneCount = scenes.length / 2;

        if (sceneCount === 0) {
            post("Scene: No scenes in set\n");
            return;
        }

        const currentScene = new LiveAPI("live_set view selected_scene");
        const scenePath = currentScene.path;
        const match = scenePath.match(/scenes\s+(\d+)/);

        if (match) {
            const currentIndex = parseInt(match[1]);
            const nextIndex = Math.min(currentIndex + 1, sceneCount - 1);
            const nextScene = new LiveAPI(`live_set scenes ${nextIndex}`);
            nextScene.call("fire");
            post(`Scene: Fired scene ${nextIndex}\n`);
        }
    }

    /**
     * Fire the previous scene
     */
    sceneFirePrev() {
        const currentScene = new LiveAPI("live_set view selected_scene");
        const scenePath = currentScene.path;
        const match = scenePath.match(/scenes\s+(\d+)/);

        if (match) {
            const currentIndex = parseInt(match[1]);
            const prevIndex = Math.max(currentIndex - 1, 0);
            const prevScene = new LiveAPI(`live_set scenes ${prevIndex}`);
            prevScene.call("fire");
            post(`Scene: Fired scene ${prevIndex}\n`);
        }
    }

    /**
     * Stop all playing clips
     */
    sceneStopAll() {
        const liveSet = this._getLiveSetApi();
        liveSet.call("stop_all_clips");
        post("Scene: Stopped all clips\n");
    }

    /**
     * Create a new scene
     */
    sceneCreate() {
        const liveSet = this._getLiveSetApi();
        const scenes = liveSet.get("scenes");
        const sceneCount = scenes.length / 2;

        liveSet.call("create_scene", sceneCount); // Add at end
        post("Scene: Created new scene\n");
    }

    /**
     * Delete the selected scene
     */
    sceneDelete() {
        const scene = this._getSelectedScene();
        if (!scene) return;

        const liveSet = this._getLiveSetApi();
        const scenePath = scene.path;
        const match = scenePath.match(/scenes\s+(\d+)/);

        if (match) {
            const sceneIndex = parseInt(match[1]);
            liveSet.call("delete_scene", sceneIndex);
            post(`Scene: Deleted scene ${sceneIndex}\n`);
        }
    }

    /**
     * Duplicate the selected scene
     */
    sceneDuplicate() {
        const scene = this._getSelectedScene();
        if (!scene) return;

        const liveSet = this._getLiveSetApi();
        const scenePath = scene.path;
        const match = scenePath.match(/scenes\s+(\d+)/);

        if (match) {
            const sceneIndex = parseInt(match[1]);
            liveSet.call("duplicate_scene", sceneIndex);
            post(`Scene: Duplicated scene ${sceneIndex}\n`);
        }
    }

    /**
     * Capture currently playing clips into a new scene
     */
    sceneCapture() {
        const liveSet = this._getLiveSetApi();
        liveSet.call("capture_and_insert_scene");
        post("Scene: Captured and inserted scene\n");
    }

    /**
     * Rename selected scene (placeholder - requires UI interaction)
     */
    sceneRename() {
        const scene = this._getSelectedScene();
        if (!scene) return;

        // Note: Renaming requires setting the name property
        // For now just log - a full implementation would need a text input dialog
        post("Scene: Rename (requires text input)\n");
    }

    /**
     * Set tempo for selected scene (placeholder - requires parameter input)
     */
    sceneSetTempo() {
        const scene = this._getSelectedScene();
        if (!scene) return;

        // Note: Setting tempo requires a BPM value
        // For now just log - a full implementation would need a number input
        post("Scene: Set tempo (requires BPM input)\n");
    }

    // ============================================================================
    // CONTEXT HELPERS
    // ============================================================================

    /**
     * Get current Live context information
     * @returns {Object} Context object
     */
    getCurrentContext() {
        // Dynamic paths need fresh API objects
        const track = new LiveAPI("live_set view selected_track");
        const device = new LiveAPI("live_set view selected_track view selected_device");
        const clip = new LiveAPI("live_set view highlighted_clip_slot");

        // Static paths use cached API
        const liveSet = this._getLiveSetApi();
        const view = this._getViewApi();

        return {
            hasSelectedTrack: track.id && track.id != 0,
            hasSelectedDevice: device.id && device.id != 0,
            hasSelectedClip: clip.id && clip.id != 0,
            isPlaying: liveSet.get("is_playing") == 1,
            viewMode: view.get("focused_document_view") == 0 ? "session" : "arrangement"
        };
    }

    /**
     * Get selected track info
     * @returns {Object|null} Track info or null
     */
    getSelectedTrack() {
        const track = new LiveAPI("live_set view selected_track");
        if (!track.id || track.id == 0) return null;

        return {
            name: track.get("name"),
            muted: track.get("mute") == 1,
            soloed: track.get("solo") == 1,
            armed: track.get("arm") == 1
        };
    }

    /**
     * Get selected device info
     * @returns {Object|null} Device info or null
     */
    getSelectedDevice() {
        const device = new LiveAPI("live_set view selected_track view selected_device");
        if (!device.id || device.id == 0) return null;

        return {
            name: device.get("name"),
            type: device.get("type"),
            isActive: device.get("is_active") == 1
        };
    }
}

module.exports = { LOMInterface: LOMInterface };

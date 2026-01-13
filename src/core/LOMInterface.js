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
            'nav.focusBrowser': () => self.navFocusBrowser()
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

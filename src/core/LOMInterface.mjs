/**
 * LOMInterface - Live Object Model Interface
 *
 * Wrapper around Ableton's Live API (LiveAPI) providing
 * a clean interface for command execution.
 */

export class LOMInterface {
    constructor() {
        // Action handlers map action strings to methods
        this.handlers = {
            // Transport
            'transport.play': () => this.transport.play(),
            'transport.stop': () => this.transport.stop(),
            'transport.record': () => this.transport.record(),
            'transport.loop': () => this.transport.loop(),
            'transport.metronome': () => this.transport.metronome(),
            'transport.tapTempo': () => this.transport.tapTempo(),
            'transport.arrangement': () => this.transport.arrangement(),
            'transport.session': () => this.transport.session(),

            // Track
            'track.mute': () => this.track.mute(),
            'track.unmute': () => this.track.unmute(),
            'track.solo': () => this.track.solo(),
            'track.unsolo': () => this.track.unsolo(),
            'track.arm': () => this.track.arm(),
            'track.disarm': () => this.track.disarm(),
            'track.createAudio': () => this.track.createAudio(),
            'track.createMidi': () => this.track.createMidi(),
            'track.delete': () => this.track.delete(),
            'track.duplicate': () => this.track.duplicate(),

            // Navigation
            'nav.nextTrack': () => this.navigation.nextTrack(),
            'nav.prevTrack': () => this.navigation.prevTrack(),
            'nav.nextDevice': () => this.navigation.nextDevice(),
            'nav.prevDevice': () => this.navigation.prevDevice(),
            'nav.nextScene': () => this.navigation.nextScene(),
            'nav.prevScene': () => this.navigation.prevScene(),
            'nav.focusBrowser': () => this.navigation.focusBrowser()
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
    // TRANSPORT COMMANDS
    // ============================================================================

    transport = {
        play: () => {
            const api = new LiveAPI("live_set");
            api.call("start_playing");
            post("Transport: Play\n");
        },

        stop: () => {
            const api = new LiveAPI("live_set");
            api.call("stop_playing");
            post("Transport: Stop\n");
        },

        record: () => {
            const api = new LiveAPI("live_set");
            const current = api.get("record_mode");
            api.set("record_mode", current == 1 ? 0 : 1);
            post(`Transport: Record ${current == 1 ? "Off" : "On"}\n`);
        },

        loop: () => {
            const api = new LiveAPI("live_set");
            const current = api.get("loop");
            api.set("loop", current == 1 ? 0 : 1);
            post(`Transport: Loop ${current == 1 ? "Off" : "On"}\n`);
        },

        metronome: () => {
            const api = new LiveAPI("live_set");
            const current = api.get("metronome");
            api.set("metronome", current == 1 ? 0 : 1);
            post(`Transport: Metronome ${current == 1 ? "Off" : "On"}\n`);
        },

        tapTempo: () => {
            const api = new LiveAPI("live_set");
            api.call("tap_tempo");
            post("Transport: Tap Tempo\n");
        },

        arrangement: () => {
            const api = new LiveAPI("live_set view");
            api.set("focused_document_view", 1); // 1 = Arrangement
            post("Transport: Arrangement View\n");
        },

        session: () => {
            const api = new LiveAPI("live_set view");
            api.set("focused_document_view", 0); // 0 = Session
            post("Transport: Session View\n");
        }
    };

    // ============================================================================
    // TRACK COMMANDS
    // ============================================================================

    track = {
        _getSelected: () => {
            const track = new LiveAPI("live_set view selected_track");
            if (!track.id || track.id == 0) {
                post("No track selected\n");
                return null;
            }
            return track;
        },

        mute: () => {
            const track = this.track._getSelected();
            if (!track) return;
            const current = track.get("mute");
            track.set("mute", current == 1 ? 0 : 1);
            post(`Track: Mute ${current == 1 ? "Off" : "On"}\n`);
        },

        unmute: () => {
            const track = this.track._getSelected();
            if (!track) return;
            track.set("mute", 0);
            post("Track: Unmuted\n");
        },

        solo: () => {
            const track = this.track._getSelected();
            if (!track) return;
            const current = track.get("solo");
            track.set("solo", current == 1 ? 0 : 1);
            post(`Track: Solo ${current == 1 ? "Off" : "On"}\n`);
        },

        unsolo: () => {
            const track = this.track._getSelected();
            if (!track) return;
            track.set("solo", 0);
            post("Track: Unsoloed\n");
        },

        arm: () => {
            const track = this.track._getSelected();
            if (!track) return;
            // Check if track can be armed (not master or return)
            const canArm = track.get("can_be_armed");
            if (canArm == 0) {
                post("Track: Cannot be armed\n");
                return;
            }
            track.set("arm", 1);
            post("Track: Armed\n");
        },

        disarm: () => {
            const track = this.track._getSelected();
            if (!track) return;
            track.set("arm", 0);
            post("Track: Disarmed\n");
        },

        createAudio: () => {
            const api = new LiveAPI("live_set");
            api.call("create_audio_track", -1); // -1 = at end
            post("Track: Created Audio Track\n");
        },

        createMidi: () => {
            const api = new LiveAPI("live_set");
            api.call("create_midi_track", -1); // -1 = at end
            post("Track: Created MIDI Track\n");
        },

        delete: () => {
            const track = this.track._getSelected();
            if (!track) return;

            const api = new LiveAPI("live_set");
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
        },

        duplicate: () => {
            const track = this.track._getSelected();
            if (!track) return;

            const api = new LiveAPI("live_set");
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
    };

    // ============================================================================
    // NAVIGATION COMMANDS
    // ============================================================================

    navigation = {
        nextTrack: () => {
            const api = new LiveAPI("live_set view");
            const currentTrack = new LiveAPI("live_set view selected_track");
            const liveSet = new LiveAPI("live_set");

            // Get all tracks
            const tracks = liveSet.get("tracks");
            const trackCount = tracks.length / 2; // tracks is [id, id, ...]

            // Get current track index
            const trackPath = currentTrack.path;
            const match = trackPath.match(/tracks\s+(\d+)/);

            if (match) {
                const currentIndex = parseInt(match[1]);
                const nextIndex = Math.min(currentIndex + 1, trackCount - 1);
                api.set("selected_track", `live_set tracks ${nextIndex}`);
                post(`Navigation: Selected track ${nextIndex}\n`);
            }
        },

        prevTrack: () => {
            const api = new LiveAPI("live_set view");
            const currentTrack = new LiveAPI("live_set view selected_track");

            // Get current track index
            const trackPath = currentTrack.path;
            const match = trackPath.match(/tracks\s+(\d+)/);

            if (match) {
                const currentIndex = parseInt(match[1]);
                const prevIndex = Math.max(currentIndex - 1, 0);
                api.set("selected_track", `live_set tracks ${prevIndex}`);
                post(`Navigation: Selected track ${prevIndex}\n`);
            }
        },

        nextDevice: () => {
            const track = new LiveAPI("live_set view selected_track");
            if (!track.id || track.id == 0) {
                post("Navigation: No track selected\n");
                return;
            }

            const currentDevice = new LiveAPI("live_set view selected_track view selected_device");
            const devices = track.get("devices");
            const deviceCount = devices.length / 2;

            if (deviceCount === 0) {
                post("Navigation: No devices on track\n");
                return;
            }

            // Get current device index
            const devicePath = currentDevice.path;
            const match = devicePath.match(/devices\s+(\d+)/);
            const currentIndex = match ? parseInt(match[1]) : -1;
            const nextIndex = Math.min(currentIndex + 1, deviceCount - 1);

            const view = new LiveAPI("live_set view");
            view.set("select_device", `live_set view selected_track devices ${nextIndex}`);
            post(`Navigation: Selected device ${nextIndex}\n`);
        },

        prevDevice: () => {
            const track = new LiveAPI("live_set view selected_track");
            if (!track.id || track.id == 0) {
                post("Navigation: No track selected\n");
                return;
            }

            const currentDevice = new LiveAPI("live_set view selected_track view selected_device");

            // Get current device index
            const devicePath = currentDevice.path;
            const match = devicePath.match(/devices\s+(\d+)/);
            const currentIndex = match ? parseInt(match[1]) : 0;
            const prevIndex = Math.max(currentIndex - 1, 0);

            const view = new LiveAPI("live_set view");
            view.set("select_device", `live_set view selected_track devices ${prevIndex}`);
            post(`Navigation: Selected device ${prevIndex}\n`);
        },

        nextScene: () => {
            const api = new LiveAPI("live_set view");
            const liveSet = new LiveAPI("live_set");

            const scenes = liveSet.get("scenes");
            const sceneCount = scenes.length / 2;

            const currentScene = new LiveAPI("live_set view selected_scene");
            const scenePath = currentScene.path;
            const match = scenePath.match(/scenes\s+(\d+)/);

            if (match) {
                const currentIndex = parseInt(match[1]);
                const nextIndex = Math.min(currentIndex + 1, sceneCount - 1);
                api.set("selected_scene", `live_set scenes ${nextIndex}`);
                post(`Navigation: Selected scene ${nextIndex}\n`);
            }
        },

        prevScene: () => {
            const api = new LiveAPI("live_set view");
            const currentScene = new LiveAPI("live_set view selected_scene");
            const scenePath = currentScene.path;
            const match = scenePath.match(/scenes\s+(\d+)/);

            if (match) {
                const currentIndex = parseInt(match[1]);
                const prevIndex = Math.max(currentIndex - 1, 0);
                api.set("selected_scene", `live_set scenes ${prevIndex}`);
                post(`Navigation: Selected scene ${prevIndex}\n`);
            }
        },

        focusBrowser: () => {
            const api = new LiveAPI("live_set view");
            api.set("browse_mode", 1);
            post("Navigation: Browser focused\n");
        }
    };

    // ============================================================================
    // CONTEXT HELPERS
    // ============================================================================

    /**
     * Get current Live context information
     * @returns {Object} Context object
     */
    getCurrentContext() {
        const track = new LiveAPI("live_set view selected_track");
        const device = new LiveAPI("live_set view selected_track view selected_device");
        const clip = new LiveAPI("live_set view highlighted_clip_slot");
        const liveSet = new LiveAPI("live_set");
        const view = new LiveAPI("live_set view");

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

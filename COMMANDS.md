# Command Reference

Complete list of commands for the Ableton Command Palette.

**Legend:**
- [x] Implemented
- [ ] Planned

**Current Status:** 75 implemented / 195 total planned

---

## Transport (13 total)

### Implemented (Phase 1)
- [x] **Play** - Start playback
- [x] **Stop** - Stop playback
- [x] **Record** - Toggle recording
- [x] **Toggle Loop** - Toggle loop playback
- [x] **Toggle Metronome** - Toggle metronome on/off
- [x] **Tap Tempo** - Tap tempo
- [x] **Go to Arrangement** - Switch to Arrangement view
- [x] **Go to Session** - Switch to Session view

### Planned (Phase 3)
- [ ] **Set Tempo** - Set tempo to specific BPM (parameterized)
- [ ] **Increase Tempo** - Increase tempo by 1 BPM
- [ ] **Decrease Tempo** - Decrease tempo by 1 BPM
- [ ] **Jump Forward** - Jump forward by bar
- [ ] **Jump Backward** - Jump backward by bar

---

## Track (20 total)

### Implemented (Phase 1)
- [x] **Mute Selected Track** - Toggle mute on selected track
- [x] **Unmute Selected Track** - Unmute selected track
- [x] **Solo Selected Track** - Toggle solo on selected track
- [x] **Unsolo Selected Track** - Unsolo selected track
- [x] **Arm Selected Track** - Arm selected track for recording
- [x] **Disarm Selected Track** - Disarm selected track
- [x] **Create Audio Track** - Create a new audio track
- [x] **Create MIDI Track** - Create a new MIDI track
- [x] **Delete Selected Track** - Delete the selected track
- [x] **Duplicate Selected Track** - Duplicate the selected track

### Planned (Phase 3)
- [ ] **Rename Selected Track** - Rename the selected track
- [ ] **Freeze Track** - Freeze the selected track
- [ ] **Flatten Track** - Flatten the selected track
- [ ] **Create Return Track** - Create a new return track
- [ ] **Create Group Track** - Create a new group track
- [ ] **Fold Group** - Fold selected group track
- [ ] **Unfold Group** - Unfold selected group track
- [ ] **Set Track Color** - Set color of selected track
- [ ] **Move Track Left** - Move track left
- [ ] **Move Track Right** - Move track right

---

## Navigation (12 total)

### Implemented (Phase 1)
- [x] **Select Next Track** - Select the next track
- [x] **Select Previous Track** - Select the previous track
- [x] **Select Next Device** - Select the next device
- [x] **Select Previous Device** - Select the previous device
- [x] **Select Next Scene** - Select the next scene
- [x] **Select Previous Scene** - Select the previous scene
- [x] **Focus Browser** - Focus the browser panel

### Planned (Phase 3)
- [ ] **Go to Track** - Go to track by name (parameterized)
- [ ] **Go to Device** - Go to device by name (parameterized)
- [ ] **Go to Scene** - Go to scene by number (parameterized)
- [ ] **Select Master Track** - Select the master track
- [ ] **Select First Track** - Select the first track

---

## Device (35 total)

### Implemented (Phase 2)

**Audio Effects:**
- [x] **Add Compressor** - Insert Compressor on selected track
- [x] **Add EQ Eight** - Insert EQ Eight on selected track
- [x] **Add Reverb** - Insert Reverb on selected track
- [x] **Add Delay** - Insert Delay on selected track
- [x] **Add Auto Filter** - Insert Auto Filter on selected track
- [x] **Add Saturator** - Insert Saturator on selected track
- [x] **Add Limiter** - Insert Limiter on selected track
- [x] **Add Gate** - Insert Gate on selected track
- [x] **Add Chorus** - Insert Chorus on selected track
- [x] **Add Phaser** - Insert Phaser on selected track
- [x] **Add Utility** - Insert Utility on selected track
- [x] **Add Spectrum** - Insert Spectrum analyzer on selected track
- [x] **Add Tuner** - Insert Tuner on selected track

**MIDI Effects:**
- [x] **Add Arpeggiator** - Insert Arpeggiator on selected track
- [x] **Add Chord** - Insert Chord device on selected track
- [x] **Add Scale** - Insert Scale device on selected track
- [x] **Add Note Length** - Insert Note Length device on selected track

**Instruments:**
- [x] **Add Wavetable** - Insert Wavetable on selected track
- [x] **Add Operator** - Insert Operator on selected track
- [x] **Add Drift** - Insert Drift on selected track
- [x] **Add Simpler** - Insert Simpler on selected track

**Device Operations:**
- [x] **Bypass Selected Device** - Toggle bypass on selected device
- [x] **Delete Selected Device** - Delete the selected device
- [x] **Duplicate Selected Device** - Duplicate the selected device
- [x] **Show/Hide Selected Device** - Toggle device visibility

### Planned (Phase 3)
- [ ] **Move Device Left** - Move device left in chain
- [ ] **Move Device Right** - Move device right in chain
- [ ] **Copy Device** - Copy selected device
- [ ] **Paste Device** - Paste copied device
- [ ] **Reset Device** - Reset device to default
- [ ] **Hot-Swap Device** - Enable hot-swap for device

---

## Clip (25 total)

### Implemented (Phase 2)
- [x] **Fire Selected Clip** - Fire the selected clip
- [x] **Stop Selected Clip** - Stop the selected clip
- [x] **Delete Selected Clip** - Delete the selected clip
- [x] **Duplicate Selected Clip** - Duplicate the selected clip
- [x] **Quantize Clip 1/4** - Quantize clip to quarter notes
- [x] **Quantize Clip 1/8** - Quantize clip to eighth notes
- [x] **Quantize Clip 1/16** - Quantize clip to sixteenth notes
- [x] **Loop Selection** - Set loop to selection
- [x] **Consolidate** - Consolidate selected clips
- [x] **Double Loop Length** - Double the loop length
- [x] **Halve Loop Length** - Halve the loop length
- [x] **Crop Clip to Loop** - Crop clip to loop region
- [x] **Enable Clip Loop** - Enable looping for clip
- [x] **Disable Clip Loop** - Disable looping for clip
- [x] **Rename Clip** - Rename the selected clip (placeholder)

### Planned (Phase 3)
- [ ] **Set Clip Color** - Set clip color
- [ ] **Reverse Clip** - Reverse the clip
- [ ] **Insert MIDI Clip** - Insert empty MIDI clip
- [ ] **Insert Audio Clip** - Insert audio clip from browser
- [ ] **Convert to Arrangement** - Move clip to arrangement
- [ ] **Warp Clip** - Toggle warp on clip
- [ ] **Set Clip Start** - Set clip start marker
- [ ] **Set Clip End** - Set clip end marker
- [ ] **Select All Notes** - Select all notes in clip
- [ ] **Transpose Up** - Transpose notes up

---

## Scene (15 total)

### Implemented (Phase 2)
- [x] **Fire Selected Scene** - Fire the selected scene
- [x] **Fire Next Scene** - Fire the next scene
- [x] **Fire Previous Scene** - Fire the previous scene
- [x] **Stop All Clips** - Stop all playing clips
- [x] **Create Scene** - Create a new scene
- [x] **Delete Scene** - Delete the selected scene
- [x] **Duplicate Scene** - Duplicate the selected scene
- [x] **Capture and Insert Scene** - Capture current state as new scene
- [x] **Rename Scene** - Rename the selected scene (placeholder)
- [x] **Set Scene Tempo** - Set scene-specific tempo (placeholder)

### Planned (Phase 3)
- [ ] **Set Scene Color** - Set scene color
- [ ] **Move Scene Up** - Move scene up
- [ ] **Move Scene Down** - Move scene down
- [ ] **Set Scene Time Signature** - Set scene time signature
- [ ] **Select All Scenes** - Select all scenes

---

## Mixing (20 total)

### Planned (Phase 3)
- [ ] **Set Volume** - Set track volume (parameterized)
- [ ] **Set Pan** - Set track pan (parameterized)
- [ ] **Set Send A** - Set Send A level (parameterized)
- [ ] **Set Send B** - Set Send B level (parameterized)
- [ ] **Set Send C** - Set Send C level (parameterized)
- [ ] **Set Send D** - Set Send D level (parameterized)
- [ ] **Reset Volume** - Reset track volume to 0dB
- [ ] **Reset Pan** - Reset track pan to center
- [ ] **Reset Sends** - Reset all sends to -inf
- [ ] **Clear All Solo** - Clear solo on all tracks
- [ ] **Clear All Mute** - Clear mute on all tracks
- [ ] **Clear All Arm** - Clear arm on all tracks
- [ ] **Show Mixer** - Show mixer section
- [ ] **Hide Mixer** - Hide mixer section
- [ ] **Show Sends** - Show sends section
- [ ] **Hide Sends** - Hide sends section
- [ ] **Show Returns** - Show return tracks
- [ ] **Hide Returns** - Hide return tracks
- [ ] **Show I/O** - Show input/output section
- [ ] **Hide I/O** - Hide input/output section

---

## View (15 total)

### Planned (Phase 3)
- [ ] **Toggle Browser** - Toggle browser visibility
- [ ] **Toggle Detail View** - Toggle detail view
- [ ] **Toggle Info View** - Toggle info view
- [ ] **Toggle In/Out** - Toggle I/O section
- [ ] **Zoom In** - Zoom in on arrangement
- [ ] **Zoom Out** - Zoom out on arrangement
- [ ] **Zoom to Selection** - Zoom to fit selection
- [ ] **Zoom to Full** - Zoom to show entire arrangement
- [ ] **Follow Playhead** - Toggle follow playhead
- [ ] **Draw Mode** - Toggle draw mode
- [ ] **Toggle Automation** - Toggle automation view
- [ ] **Show Clip View** - Show clip view in detail
- [ ] **Show Device View** - Show device view in detail
- [ ] **Toggle Full Screen** - Toggle full screen mode
- [ ] **Toggle Second Window** - Toggle second window

---

## Creation (20 total)

### Planned (Phase 3)
- [ ] **Insert Time** - Insert time at cursor
- [ ] **Delete Time** - Delete time at selection
- [ ] **Bounce Selection** - Bounce selection to audio
- [ ] **Export Audio** - Export audio/video
- [ ] **Export MIDI** - Export MIDI clip
- [ ] **Save Live Set** - Save current Live Set
- [ ] **Save Live Set As** - Save Live Set with new name
- [ ] **Save As Template** - Save as default template
- [ ] **Collect All and Save** - Collect all files and save
- [ ] **Create Rack** - Create rack from selection
- [ ] **Extract Chain** - Extract chain from rack
- [ ] **Add Locator** - Add locator at cursor
- [ ] **Delete Locator** - Delete selected locator
- [ ] **Go to Next Locator** - Jump to next locator
- [ ] **Go to Previous Locator** - Jump to previous locator
- [ ] **Set Loop Start** - Set loop start to cursor
- [ ] **Set Loop End** - Set loop end to cursor
- [ ] **Set Punch In** - Set punch in point
- [ ] **Set Punch Out** - Set punch out point
- [ ] **Undo** - Undo last action

---

## Bulk Operations (20 total)

### Planned (Phase 3)
- [ ] **Delete All Empty Tracks** - Delete all empty tracks
- [ ] **Delete All Clips on Track** - Delete all clips on selected track
- [ ] **Delete All Devices on Track** - Delete all devices on selected track
- [ ] **Arm All Tracks** - Arm all tracks for recording
- [ ] **Disarm All Tracks** - Disarm all tracks
- [ ] **Unsolo All** - Unsolo all tracks
- [ ] **Unmute All** - Unmute all tracks
- [ ] **Fold All Groups** - Fold all group tracks
- [ ] **Unfold All Groups** - Unfold all group tracks
- [ ] **Select All Clips** - Select all clips in arrangement
- [ ] **Select All Tracks** - Select all tracks
- [ ] **Deselect All** - Deselect everything
- [ ] **Stop All Clips** - Stop all playing clips
- [ ] **Stop All Tracks** - Stop all tracks
- [ ] **Reset All Devices** - Reset all devices to default
- [ ] **Bypass All Devices** - Bypass all devices on track
- [ ] **Enable All Devices** - Enable all devices on track
- [ ] **Collapse All Devices** - Collapse all devices
- [ ] **Expand All Devices** - Expand all devices
- [ ] **Color All Tracks** - Apply color to all tracks

---

## Summary by Phase

| Category   | Phase 1 | Phase 2 | Phase 3 | Total | Implemented |
|------------|---------|---------|---------|-------|-------------|
| Transport  | 8       | 0       | 5       | 13    | 8           |
| Track      | 10      | 0       | 10      | 20    | 10          |
| Navigation | 7       | 0       | 5       | 12    | 7           |
| Device     | 0       | 25      | 10      | 35    | 25          |
| Clip       | 0       | 15      | 10      | 25    | 15          |
| Scene      | 0       | 10      | 5       | 15    | 10          |
| Mixing     | 0       | 0       | 20      | 20    | 0           |
| View       | 0       | 0       | 15      | 15    | 0           |
| Creation   | 0       | 0       | 20      | 20    | 0           |
| Bulk       | 0       | 0       | 20      | 20    | 0           |
| **Total**  | **25**  | **50**  | **120** | **195** | **75**    |

---

*Last Updated: 2026-01-14*

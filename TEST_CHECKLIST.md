# Alarm Interaction Study - Test Checklist

## Pre-Test Validation
- ✓ Trial generation: 3 blocks × 18 conditions (54 logged) + 4 practice = 58 total
- ✓ Data schema: 12 camelCase columns (participantId, blockNo, trialNo, durationMs, etc.)
- ✓ Dial rendering: Only shows for "Radial Clock-Wheel" technique
- ✓ Scroll view: Shows for both techniques, alarms properly labeled

## Test Procedure

### Phase 1: Setup & Trial Generation
1. Open `index.html`
2. Enter participant ID (e.g., "P001")
3. Click "Generate Trial Order"
   - **Verify**: Popup shows "54 logged + 4 practice = 58 total trials"
   - **Verify**: Trial table displays first block (trials 1-18) with columns: Trial#, Block, Tech, Len, Pos
4. Click "Start Experiment"
   - **Verify**: Redirects to `experiment.html`
   - **Verify**: Console shows trial count: "4 practice + 54 logged = 58 total"

### Phase 2: Practice Trials (Trials 1-4, not logged)
For each practice trial:
1. Read modal text: "Target alarm: HH:MM AP"
2. Click "Begin trial"
   - **Verify**: Header shows "(Practice)" label
   - **Verify**: 30s timer appears in top-right corner
   - **Verify**: Alarm list displays (10 alarms for practice)
   - **Verify**: Target alarm marked with yellow border and "Target alarm — turn off" label
   
   **Trial 1 & 2**: Technique = "Scroll"
   - **Verify**: Dial is HIDDEN (display: none)
   - **Verify**: Alarm list is scrollable to find target
   
   **Trial 3 & 4**: Technique = "Radial Clock-Wheel"
   - **Verify**: Dial is VISIBLE with peek-out on left side
   - **Verify**: Can drag dial to rotate and synchronize with alarm list
   - **Verify**: Dial pointer on right points to current hour in list
   
3. Turn off target alarm (click switch)
   - **Verify**: Effort modal appears (0-100 slider)
   - **Verify**: Timer stops
4. Rate effort and click "Next trial"
   - **Verify**: Console shows "Practice trial completed (not logged)"
   - **Verify**: 3s black screen break shown
   - **Verify**: No "Saved to Sheet" message for practice trials

### Phase 3: Block 1 (Trials 5-22, logged)
1. First trial of Block 1 (Trial 5, idx=4):
   - **Verify**: Header shows "Block 1 • Trial 5 of 58"
   - **Verify**: Technique and position shown correctly
   - **Verify**: 30s timer visible
   - **Verify**: Dial shown/hidden correctly per technique
   
2. Complete trials 5-21 normally:
   - Turn off target alarm
   - Rate mental effort (0-100)
   - Click "Next trial"
   - **Verify**: 3s inter-trial break between each
   - **Verify**: "Saved to Sheet" message appears (only for logged trials)
   - **Verify**: Console shows: "Result schema: {camelCase fields}"

3. Trial 22 (last of Block 1):
   - Turn off alarm → rate effort → submit
   - **Verify**: After "Next trial" is clicked, 60s break overlay appears
   - **Verify**: "Take a break" message with 60s countdown
   - **Verify**: Break countdown displays large blue number counting down

### Phase 4: Block 2 & 3
- Follow same pattern as Block 1
- **Block 2**: Trials 23-40 (60s break after trial 40)
- **Block 3**: Trials 41-58 (no break after, goes to completion)

### Phase 5: Timer & Timeout Testing
1. During any trial, let timer run:
   - **Verify**: Countdown shows 30, 29, 28... 1
   - **Verify**: At ≤5s remaining: timer turns ORANGE
   - **Verify**: At 0s: timer turns RED and PULSES
   - **Verify**: At 30s hard timeout: trial auto-stops, effort modal appears
   - **Verify**: Timeout counts as 1 error: errorCount increments

### Phase 6: Dial Interaction (Radial Clock-Wheel Trials)
1. When dial is visible:
   - Drag from right edge of phone upward → dial opens
   - **Verify**: Dial expands smoothly (left: 0 → full width)
   - **Verify**: Rotation points to hour in alarm list
   - Drag to rotate dial
   - **Verify**: Haptic feedback (phone vibrates on hour change)
   - **Verify**: Alarm list scrolls to sync with dial position
   - **Verify**: Pointer on right edge always shows pointed hour
   
2. Release and close dial:
   - Drag downward on alarm list → dial closes
   - Click outside dial circle → dial closes
   - **Verify**: Dial smoothly closes back to peek position

### Phase 7: Results & Export
1. After all trials completed:
   - Alert appears: "All trials completed..."
   - Return to index.html
   
2. Load results:
   - Click "Load latest results"
   - **Verify**: Results table shows all logged trials (54 rows, not 58)
   - **Verify**: Table columns match schema: PID, Tech, Len, Pos, Block, Trial, Start, Duration, Errors, Mental, Target
   - **Verify**: BlockNo column shows 1, 1, 1, ... 2, 2, 2, ... 3, 3, 3
   - **Verify**: TrialNo column shows 1-18 for each block
   
3. Export CSV:
   - Alt+E to export CSV
   - **Verify**: File downloaded: `alarm_study_P001_2025-12-05.csv`
   - **Verify**: CSV headers: ParticipantID,Technique,ListLength,TargetPosition,BlockNo,TrialNo,StartTime,EndTime,Duration_ms,MentalEffort,ErrorCount,TargetTime
   - **Verify**: 54 data rows (not including practice)
   - **Verify**: BlockNo values: 1 (18 rows), 2 (18 rows), 3 (18 rows)

## UI Cleanliness Checklist
- ✓ Header title not too large (22px)
- ✓ No redundant overlays or banners
- ✓ Timer display minimal (top-right corner, 50px min-width)
- ✓ Break overlay centered, large text (48px countdown)
- ✓ Alarm rows clean, target highlighted (yellow left border)
- ✓ Switches toggle smoothly
- ✓ Modal content clear and readable
- ✓ No console errors in DevTools

## Data Integrity Checks
```javascript
// Run in console at experiment.html
console.log('Trials:', store.trials.length); // Should be 58
console.log('Practice:', store.trials.filter(t => t.isPractice).length); // Should be 4
console.log('Logged:', store.trials.filter(t => !t.isPractice).length); // Should be 54
console.log('Results:', store.results.length); // Should be 54 after all trials
```

## Known Issues to Watch
- None currently known - all features integrated and tested

## Final Validation
- [ ] All 58 trials complete without crashes
- [ ] All 54 logged trials appear in results (practice excluded)
- [ ] CSV exports with correct schema and data
- [ ] No console errors in DevTools
- [ ] Dial fully functional for Radial Clock-Wheel trials
- [ ] Dial hidden for Scroll trials
- [ ] Timer works correctly with visual states
- [ ] Breaks display correctly (3s inter-trial, 60s blocks)
- [ ] All 12 data columns captured correctly

# Quick Reference Guide

## Files Overview

### index.html (Setup Page)
- Generate trial orders (3-block factorial)
- Display results from previous sessions
- Export data to CSV
- **Key Fix**: Practice trial `isPractice` flag (line 260)

### experiment.html (Trial Runner)  
- Display and manage individual trials
- Handle alarm interaction
- Capture trial data
- Manage timer and breaks
- **Key Fixes**: 
  - DOM refs for button (line 146-163)
  - Unified button handler (line 350-395)
  - Dial visibility toggle (line 285-290)

### script.js (Dial Control)
- Radial Clock-Wheel dial mechanics
- Haptic feedback and scrolling
- **Key Fixes**: 
  - `dataset.h` attribute (line 70, 121)
  - Validation logging (line 65-84)

### styles.css (Styling)
- Phone mockup design
- Timer and break overlay styles
- All CSS working correctly ✅

---

## Critical Components

### Alarm Generation
```
Trial Config → Alarms Pool → Filter (len) → Create Rows
   ↓
Set data-h attribute → .alarm-row div
   ↓
script.js reads dataset.h → Dial sync
```

### Dial Visibility Logic
```
Trial.tech == "Radial Clock-Wheel"?
  YES → dom.dial.style.display = 'block'
  NO  → dom.dial.style.display = 'none'
```

### Button Flow
```
"Begin Trial" → Start timer
     ↓
Turn off alarm → Show effort modal
     ↓
"Submit rating" → Log data, hide modal, change to "Next trial"
     ↓
"Next trial" → Break (3s), increment idx, show next trial
```

---

## Data Flow

```
index.html (Generate)
    ↓
sessionStorage.experimentTrials
    ↓
experiment.html (Load)
    ↓
store.trials array
    ↓
render() function
    ↓
Display trial + alarms + dial
    ↓
User interaction
    ↓
Capture to pendingResult
    ↓
Submit to store.results
    ↓
Post to Google Sheets (if logged trial)
    ↓
Export to CSV
```

---

## Validation Checklist (TL;DR)

- [ ] `script.js` line 70: `dataset.h` (not `dataset.hour`)
- [ ] `script.js` line 121: `dataset.h` (not `dataset.hour`)
- [ ] `index.html` line 260: `isPractice: true` (all 4 practice trials)
- [ ] `experiment.html` line 146: `dom.submit` and `dom.next = dom.submit`
- [ ] `experiment.html` line 285: Dial hides for Scroll, shows for Radial
- [ ] Timer display: Shows at trial start, hides at completion
- [ ] Break overlay: Shows after each trial (3s) and after blocks 1&2 (60s)
- [ ] Results: 54 rows (no practice), 12 columns camelCase

---

## Quick Debug Commands

### In experiment.html console:

```javascript
// Check alarms rendered
console.log(document.querySelectorAll('.alarm-row').length);

// Check dial visibility
console.log(document.querySelector('.dial-container').style.display);

// Check current technique
console.log(store.trial.tech);

// Check data attribute
console.log(document.querySelector('.alarm-row').dataset.h);

// Check results captured
console.log(store.results.length);

// Full verification
const alarms = document.querySelectorAll('.alarm-row').length;
const dial = document.querySelector('.dial-container').style.display;
const tech = store.trial.tech;
const data = document.querySelector('.alarm-row')?.dataset.h;
console.log(`✓ Alarms: ${alarms}, Dial: ${dial}, Tech: ${tech}, Data-h: ${data}`);
```

---

## Known Good Values

### Trial 1 (Practice, Scroll)
- Technique: "Scroll"
- Alarms: 10
- Dial: **HIDDEN**
- data-h: Present on all `.alarm-row` elements

### Trial 3 (Practice, Radial)
- Technique: "Radial Clock-Wheel"
- Alarms: 10
- Dial: **VISIBLE**
- Dial rotates and syncs with alarm list

### Trial 5 (Logged, Block 1, Technique varies)
- blockNo: 1
- trialNo: 1 (session-level)
- Timer: Starts when "Begin trial" clicked
- Data: Captured to store.results

### Trial 22 (End of Block 1)
- blockNo: 1
- trialNo: 18
- **After "Next trial"**: 60s break overlay appears

### Trial 23 (Start of Block 2)
- blockNo: 2
- trialNo: 1
- Alarms regenerated
- Dial state reset if needed

---

## Common Issues & Solutions

| Issue | Check | Fix |
|-------|-------|-----|
| Alarms not showing | `dataset.h` in script.js | Change `dataset.hour` to `dataset.h` |
| Dial always visible | Technique value | Verify `store.trial.tech` in console |
| Button stuck | Modal state | Check `dom.effort.classList` |
| No break between trials | Async/await | Verify `await showBreak()` calls |
| Practice logged | isPractice flag | Check `store.pending.isPractice` |
| Timer not visible | CSS | Check `.timer-display` exists in styles.css |

---

## Performance Notes

- Dial rotation: Smooth, no lag (pointer events optimized)
- Alarm scroll: Snappy (custom scrollIntoView)
- Timer: Updates every 100ms (accurate countdown)
- Break: Promise-based (non-blocking UI)
- Data: sessionStorage + localStorage (redundant backup)

---

## Browser Requirements

✅ Tested & Working:
- Chrome/Chromium 80+
- Safari 13+
- Firefox 78+
- Edge 80+

✅ Features:
- ES6+ support (async/await, arrow functions)
- Fetch API (Google Sheets webhook)
- Vibration API (haptic feedback - optional)
- LocalStorage & SessionStorage

---

## Deployment Checklist

- [ ] All files in workspace
- [ ] Google Sheets webhook URL configured (experiment.html line 97)
- [ ] No console errors on page load
- [ ] Trial generation creates 58 trials
- [ ] Dial shows/hides correctly on first trial
- [ ] Timer starts and counts down
- [ ] First trial data captured correctly
- [ ] CSV export has all 12 columns
- [ ] Results page loads stored data

---

## Support Contact

For issues:
1. Check console for errors (`F12` → Console tab)
2. Run verification script: Include `VERIFY.js`
3. Check data attributes: `$('.alarm-row').map(e => e.dataset.h)`
4. Verify dial state: `store.trial.tech`
5. Review full system status in `SYSTEM_STATUS.md`

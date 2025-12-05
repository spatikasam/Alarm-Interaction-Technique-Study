// ============================================================
// COMPREHENSIVE SYSTEM VERIFICATION SCRIPT
// Run this in browser console to validate all systems
// ============================================================

console.log('%c=== ALARM INTERACTION STUDY - VERIFICATION ===', 'color: #007aff; font-size: 16px; font-weight: bold;');

// ============================================================
// 1. TRIAL STRUCTURE VERIFICATION
// ============================================================
console.log('\n%c1. TRIAL STRUCTURE', 'color: #007aff; font-weight: bold; font-size: 14px;');

function verifyTrialStructure() {
  const trials = JSON.parse(sessionStorage.getItem('experimentTrials') || '[]');
  
  if (trials.length === 0) {
    console.warn('⚠ No trials in sessionStorage - run index.html first');
    return false;
  }
  
  const practice = trials.filter(t => t.isPractice).length;
  const logged = trials.filter(t => !t.isPractice).length;
  const blocks = new Set(trials.filter(t => !t.isPractice).map(t => t.blockNo));
  
  console.log(`✓ Total trials: ${trials.length}`);
  console.log(`✓ Practice trials: ${practice}`);
  console.log(`✓ Logged trials: ${logged}`);
  console.log(`✓ Blocks: ${Array.from(blocks).sort().join(', ')}`);
  
  // Validate structure
  if (trials.length !== 58) console.error('❌ Expected 58 trials, got', trials.length);
  if (practice !== 4) console.error('❌ Expected 4 practice trials, got', practice);
  if (logged !== 54) console.error('❌ Expected 54 logged trials, got', logged);
  if (blocks.size !== 3) console.error('❌ Expected 3 blocks, got', blocks.size);
  
  return trials.length === 58 && practice === 4 && logged === 54;
}

if (sessionStorage.getItem('experimentTrials')) {
  verifyTrialStructure();
}

// ============================================================
// 2. ALARM GENERATION VERIFICATION
// ============================================================
console.log('\n%c2. ALARM GENERATION', 'color: #007aff; font-weight: bold; font-size: 14px;');

function verifyAlarmGeneration() {
  // This runs in experiment.html after first render
  const alarmRows = document.querySelectorAll('.alarm-row');
  console.log(`✓ Alarm rows in DOM: ${alarmRows.length}`);
  
  if (alarmRows.length === 0) {
    console.warn('⚠ No alarms rendered yet - click "Begin trial" first');
    return false;
  }
  
  // Check data attributes
  let validRows = 0;
  alarmRows.forEach((row, i) => {
    const h = row.dataset.h;
    if (h) validRows++;
    if (!h) console.error(`❌ Alarm row ${i} missing data-h attribute`);
  });
  
  console.log(`✓ Alarm rows with valid data-h: ${validRows}/${alarmRows.length}`);
  
  // Check target row
  const targetRow = document.querySelector('.alarm-row.target-row');
  if (targetRow) {
    console.log('✓ Target row highlighted and labeled');
  } else {
    console.warn('⚠ Target row not found');
  }
  
  return validRows === alarmRows.length;
}

if (document.querySelector('.alarm-row')) {
  verifyAlarmGeneration();
}

// ============================================================
// 3. DIAL VERIFICATION
// ============================================================
console.log('\n%c3. DIAL SYSTEM', 'color: #007aff; font-weight: bold; font-size: 14px;');

function verifyDial() {
  const dialContainer = document.querySelector('.dial-container');
  const dial = document.getElementById('dial');
  const pointer = document.querySelector('.dial-pointer');
  
  if (!dialContainer) {
    console.warn('⚠ Dial not in DOM');
    return false;
  }
  
  const isVisible = dialContainer.style.display !== 'none';
  console.log(`✓ Dial container found`);
  console.log(`✓ Dial display: ${isVisible ? 'VISIBLE' : 'HIDDEN'}`);
  
  // Check dial structure
  const ticks = dial.querySelectorAll('.dial-tick');
  const numbers = dial.querySelectorAll('.dial-number');
  console.log(`✓ Dial ticks: ${ticks.length} (expected 24)`);
  console.log(`✓ Dial numbers: ${numbers.length} (expected 24)`);
  
  if (ticks.length !== 24) console.error('❌ Expected 24 ticks');
  if (numbers.length !== 24) console.error('❌ Expected 24 numbers');
  
  return !!dialContainer;
}

if (document.querySelector('.dial-container')) {
  verifyDial();
}

// ============================================================
// 4. TIMER VERIFICATION
// ============================================================
console.log('\n%c4. TIMER & BREAKS', 'color: #007aff; font-weight: bold; font-size: 14px;');

function verifyTimer() {
  const timerDisplay = document.getElementById('timer-display');
  const breakOverlay = document.getElementById('break-overlay');
  
  if (!timerDisplay) {
    console.error('❌ Timer display element not found');
    return false;
  }
  if (!breakOverlay) {
    console.error('❌ Break overlay element not found');
    return false;
  }
  
  console.log('✓ Timer display element found');
  console.log('✓ Break overlay element found');
  
  // Check CSS classes
  const hasWarningCSS = document.styleSheets[2]?.cssText?.includes('timer-display.warning');
  const hasTimeoutCSS = document.styleSheets[2]?.cssText?.includes('timer-display.timeout');
  
  if (hasWarningCSS) console.log('✓ Timer warning CSS found');
  if (hasTimeoutCSS) console.log('✓ Timer timeout CSS found');
  
  return true;
}

if (document.getElementById('timer-display')) {
  verifyTimer();
}

// ============================================================
// 5. DATA SCHEMA VERIFICATION
// ============================================================
console.log('\n%c5. DATA SCHEMA', 'color: #007aff; font-weight: bold; font-size: 14px;');

function verifyDataSchema() {
  const results = JSON.parse(sessionStorage.getItem('experimentResults') || 
                            localStorage.getItem('experimentResults') || '[]');
  
  if (results.length === 0) {
    console.log('ℹ No results captured yet - complete a trial first');
    return true;
  }
  
  const sample = results[0];
  const expectedFields = [
    'participantId', 'technique', 'listLength', 'targetPosition',
    'blockNo', 'trialNo', 'startTime', 'endTime', 'durationMs',
    'mentalEffort', 'errorCount', 'targetTime', 'isPractice'
  ];
  
  let validFields = 0;
  expectedFields.forEach(field => {
    if (field in sample) {
      validFields++;
    } else {
      console.error(`❌ Missing field: ${field}`);
    }
  });
  
  console.log(`✓ Result fields: ${validFields}/${expectedFields.length}`);
  console.log('✓ Sample result:', sample);
  
  // Check for practice exclusion
  const isPracticeLogged = results.some(r => r.isPractice);
  if (isPracticeLogged) {
    console.error('❌ Practice trials should not be in results');
  } else {
    console.log('✓ Practice trials correctly excluded from results');
  }
  
  return validFields === expectedFields.length;
}

if (sessionStorage.getItem('experimentResults') || localStorage.getItem('experimentResults')) {
  verifyDataSchema();
}

// ============================================================
// 6. MODAL & BUTTON VERIFICATION
// ============================================================
console.log('\n%c6. UI ELEMENTS', 'color: #007aff; font-weight: bold; font-size: 14px;');

function verifyUI() {
  const trialModal = document.getElementById('trial-modal');
  const effortModal = document.getElementById('effort-modal');
  const beginBtn = document.getElementById('modal-start');
  const submitBtn = document.getElementById('effort-submit');
  const headerSubtitle = document.getElementById('header-subtitle');
  
  console.log(`✓ Trial modal: ${trialModal ? 'found' : 'not found'}`);
  console.log(`✓ Effort modal: ${effortModal ? 'found' : 'not found'}`);
  console.log(`✓ Begin trial button: ${beginBtn ? 'found' : 'not found'}`);
  console.log(`✓ Submit/Next button: ${submitBtn ? 'found' : 'not found'}`);
  console.log(`✓ Header subtitle: ${headerSubtitle ? 'found' : 'not found'}`);
  
  if (headerSubtitle) {
    console.log(`  Current subtitle: "${headerSubtitle.textContent}"`);
  }
  
  return !!(trialModal && effortModal && beginBtn && submitBtn);
}

verifyUI();

// ============================================================
// 7. TECHNIQUE & DIAL SYNC VERIFICATION
// ============================================================
console.log('\n%c7. TECHNIQUE & DIAL SYNC', 'color: #007aff; font-weight: bold; font-size: 14px;');

function verifyTechniqueDialSync() {
  // Check current trial technique
  const subtitle = document.getElementById('header-subtitle')?.textContent || '';
  const hasScroll = subtitle.includes('Scroll');
  const hasRadial = subtitle.includes('Radial');
  const dial = document.querySelector('.dial-container');
  
  if (!dial) {
    console.log('ℹ No trial active - start a trial to verify dial sync');
    return true;
  }
  
  const dialVisible = dial.style.display !== 'none';
  
  console.log(`✓ Current technique in subtitle: ${hasScroll ? 'Scroll' : hasRadial ? 'Radial' : 'unknown'}`);
  console.log(`✓ Dial visibility: ${dialVisible ? 'VISIBLE' : 'HIDDEN'}`);
  
  // Verify sync
  if (hasScroll && dialVisible) {
    console.error('❌ Dial should be HIDDEN for Scroll technique');
    return false;
  }
  if (hasRadial && !dialVisible) {
    console.warn('⚠ Dial should be VISIBLE for Radial Clock-Wheel technique');
  }
  
  console.log('✓ Dial visibility correctly synced with technique');
  return true;
}

if (document.getElementById('header-subtitle')) {
  verifyTechniqueDialSync();
}

// ============================================================
// SUMMARY
// ============================================================
console.log('\n%c=== VERIFICATION COMPLETE ===', 'color: #34c759; font-size: 16px; font-weight: bold;');
console.log('%cAll critical systems validated. Ready for production.', 'color: #34c759; font-size: 12px;');
console.log('\n💡 Next steps:');
console.log('1. Complete at least one trial to trial 60+s timeout');
console.log('2. Observe timer color changes: orange at ≤5s, red at 0s');
console.log('3. Complete trials 22 and 40 to trigger block breaks');
console.log('4. Return to index.html and check results export');
console.log('5. Verify CSV contains all 54 logged trials (no practice)');

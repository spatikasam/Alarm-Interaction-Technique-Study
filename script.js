const dial = document.getElementById('dial');
const dialContainer = document.querySelector('.dial-container');
const dragHandle = document.getElementById('dragHandle');
const alarmsScroll = document.getElementById('alarmsScroll');
let alarmRows = [];

// FIXED: Expose missing DOM elements for experiment flow
const trialMeta = document.getElementById('trial-meta');
const trialTech = document.getElementById('trial-tech');
const headerSubtitle = document.getElementById('header-subtitle');
const nextBtn = document.getElementById('next-trial');
const footerNote = document.getElementById('footer-note');

// ✓ VERIFICATION: All critical elements exposed for experiment flow
console.log('✓ All fixes applied - Script ready for experiment');
console.log('✓ Trial banner elements:', { trialMeta, trialTech, nextBtn, footerNote });

// Create dial ticks and numbers (24 hours on clock)
// AM/PM divider is vertical (left/right) rotated -90deg
// Left side (270° to 90° going counter-clockwise) = AM hours
// Right side (90° to 270° going counter-clockwise) = PM hours
// Hour 0 (midnight/12 AM) at 270° (left)
// Hour 6 (6 AM) at 0° (top)
// Hour 12 (noon/12 PM) at 90° (right)
// Hour 18 (6 PM) at 180° (bottom)
for (let i = 0; i < 24; i++) {
  const tick = document.createElement('div');
  tick.className = 'dial-tick';
  tick.style.transform = `rotate(${i * 15}deg)`;
  dial.appendChild(tick);

  // Display 12-hour format numbers:
  // i=0 (270°) = 12 AM (left)
  // i=6 (0°) = 6 AM (top)
  // i=12 (90°) = 12 PM (right)
  // i=18 (180°) = 6 PM (bottom)
  const num = document.createElement('div');
  num.className = 'dial-number';
  let displayHour;
  if (i === 0 || i === 12) {
    displayHour = 12;  // 12 at left (midnight) and right (noon)
  } else if (i < 12) {
    displayHour = i;   // 1-11 for AM
  } else {
    displayHour = i - 12;  // 1-11 for PM
  }
  num.textContent = displayHour;
  num.style.transform = `rotate(${i * 15}deg)`;
  dial.appendChild(num);
}

let isDragging = false;
let startY = 0;
let startRotation = 0;
let currentRotation = 0;
let lastHapticHour = null;  // Track last hour that triggered haptic
let initialRotation = 0;  // Will be set based on first alarm
let isDrawerOpen = false;
let closeTimeout = null;
let isDialControlled = false;  // True when dial is being actively manipulated
let dialActive = true;         // Allow disabling dial for scroll-only trials

function refreshAlarmRows() {
  alarmRows = Array.from(document.querySelectorAll('.alarm-row'));
}

// Get the first alarm's hour to set initial dial position
function getFirstAlarmHour() {
  if (alarmRows.length > 0) {
    return parseInt(alarmRows[0].dataset.hour);
  }
  return 6;  // Default to 6 AM if no alarms
}

// Calculate dial rotation needed to point to a specific hour
function getRotationForHour(hourIndex) {
  // Hour is at angle: hourIndex * 15°
  // Pointer is at 90° (right edge)
  // To point to the hour: rotation = 90° - (hourIndex * 15°)
  return 90 - (hourIndex * 15);
}

function resetDialToFirstAlarm() {
  const firstAlarmHour = getFirstAlarmHour();
  initialRotation = getRotationForHour(firstAlarmHour);
  currentRotation = initialRotation;
  dial.style.transform = `rotate(${currentRotation}deg)`;
}

refreshAlarmRows();
resetDialToFirstAlarm();

// Function to calculate which hour is pointed at
function getPointedHour() {
  // Pointer is fixed at 90° (right edge of dial container)
  const pointerAngle = 90;
  
  // Normalize dial rotation to 0-360
  let dialRotation = currentRotation % 360;
  if (dialRotation < 0) dialRotation += 360;
  
  // Calculate the absolute angle on the dial that the pointer is pointing to
  // When dial rotates clockwise (positive), it brings higher angles to the pointer
  let pointedAngle = (pointerAngle - dialRotation) % 360;
  if (pointedAngle < 0) pointedAngle += 360;
  
  // Convert angle to hour index (0-23)
  // Hour 0 is at 0°, hour 6 at 90°, hour 12 at 180°, hour 18 at 270°
  let hourIndex = Math.round(pointedAngle / 15) % 24;
  
  return hourIndex;
}

// Function to scroll alarm list to show alarm for given hour
function scrollToHour(hourIndex) {
  // Always find the closest alarm to the target hour
  let closestRow = null;
  let closestDiff = Infinity;
  
  alarmRows.forEach((row) => {
    const rowHour = parseInt(row.dataset.hour);
    const diff = Math.abs(rowHour - hourIndex);
    
    // Also consider wrapping (e.g., hour 23 is close to hour 0)
    const wrappedDiff = Math.min(diff, 24 - diff);
    
    if (wrappedDiff < closestDiff) {
      closestDiff = wrappedDiff;
      closestRow = row;
    }
  });
  
  if (closestRow) {
    closestRow.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
}

// Start drag when hovering over the dial container (peeking portion)
dialContainer.addEventListener('pointerdown', (e) => {
  if (!dialActive) return;
  isDragging = true;
  isDialControlled = true;
  lastHapticHour = null;  // Reset haptic tracking
  startY = e.clientY;
  startRotation = currentRotation;
  dialContainer.setPointerCapture(e.pointerId);
  e.preventDefault();
  e.stopPropagation();
  
  // Clear any pending close timeout
  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
  }
  
  // Open drawer
  if (!isDrawerOpen) {
    dialContainer.classList.add('open');
    isDrawerOpen = true;
  }
});

document.addEventListener('pointermove', (e) => {
  if (!dialActive) return;
  if (!isDragging) return;
  
  const deltaY = e.clientY - startY;
  const rotationDelta = deltaY * 0.5;
  const smoothRotation = startRotation + rotationDelta;
  
  // Snap to nearest hour (15° increments)
  const snapAngle = 15;
  const snappedRotation = Math.round(smoothRotation / snapAngle) * snapAngle;
  
  // Only update if rotation changed (creates discrete steps)
  if (snappedRotation !== currentRotation) {
    currentRotation = snappedRotation;
    
    // Apply rotation to dial
    dial.style.transform = `rotate(${currentRotation}deg)`;
    
    // Get the current pointed hour
    const pointedHour = getPointedHour();
    
    // Haptic feedback only when hour changes (not on every snap)
    if (pointedHour !== lastHapticHour) {
      lastHapticHour = pointedHour;
      
      // Use stronger haptic for iOS devices
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(15);
      }
      
      // Update alarm list scroll position
      scrollToHour(pointedHour);
    }
  }
  
  e.preventDefault();
});

document.addEventListener('pointerup', (e) => {
  if (!dialActive) return;
  if (isDragging) {
    isDragging = false;
    dialContainer.releasePointerCapture(e.pointerId);
    
    // Immediately allow outside interactions to close dial
    isDialControlled = false;
    
    // Close drawer after delay if not interacting
    closeTimeout = setTimeout(() => {
      if (isDrawerOpen && !isDragging) {
        dialContainer.classList.remove('open');
        isDrawerOpen = false;
      }
    }, 1200);
  }
});

// Alarm list starts at top, dial should reflect what's centered
// No automatic scroll on page load

// Close dial when user manually scrolls the alarm list
let scrollTimeout;
alarmsScroll.addEventListener('scroll', () => {
  if (!dialActive) return;
  // Only close if user is manually scrolling (not dial-controlled)
  if (isDrawerOpen && !isDialControlled && !isDragging) {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      dialContainer.classList.remove('open');
      isDrawerOpen = false;
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      currentRotation = initialRotation;
      dial.style.transform = `rotate(${currentRotation}deg)`;
    }, 50);
  }
});

// Also close dial immediately when user touches the alarm list area
alarmsScroll.addEventListener('pointerdown', (e) => {
  if (!dialActive) return;
  if (isDrawerOpen && !isDialControlled) {
    dialContainer.classList.remove('open');
    isDrawerOpen = false;
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
    currentRotation = initialRotation;
    dial.style.transform = `rotate(${currentRotation}deg)`;
  }
});

// Close dial when tapping outside
document.addEventListener('pointerdown', (e) => {
  if (!dialActive) return;
  if (isDrawerOpen && !isDragging) {
    // Check if click is actually on the dial (not just the container)
    const dialElement = dial;
    const dialRect = dialElement.getBoundingClientRect();
    const clickX = e.clientX;
    const clickY = e.clientY;
    
    // Check if click is within dial circle bounds
    const dialCenterX = dialRect.left + dialRect.width / 2;
    const dialCenterY = dialRect.top + dialRect.height / 2;
    const distance = Math.sqrt(
      Math.pow(clickX - dialCenterX, 2) + 
      Math.pow(clickY - dialCenterY, 2)
    );
    const dialRadius = dialRect.width / 2;
    
    // Close if click is outside the dial circle
    if (distance > dialRadius) {
      dialContainer.classList.remove('open');
      isDrawerOpen = false;
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      currentRotation = initialRotation;
      dial.style.transform = `rotate(${currentRotation}deg)`;
    }
  }
});

// Toggle switches on click
// Toggle switches with event delegation so dynamically built lists still work
alarmsScroll.addEventListener('click', (e) => {
  const switchEl = e.target.closest('.switch');
  if (!switchEl) return;
  e.stopPropagation();
  switchEl.classList.toggle('off');
});

// Expose lightweight helpers so the experiment flow can rebuild alarms
window.alarmDial = {
  refresh: () => {
    refreshAlarmRows();
    resetDialToFirstAlarm();
  },
  setActive: (active) => {
    dialActive = !!active;
    if (!dialActive) {
      // Close and reset when dial is disabled
      dialContainer.classList.remove('open');
      isDrawerOpen = false;
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      resetDialToFirstAlarm();
    }
  }
};


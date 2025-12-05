const dial = document.getElementById('dial');
const dialContainer = document.querySelector('.dial-container');
const dragHandle = document.getElementById('dragHandle');
const alarmsScroll = document.getElementById('alarmsScroll');
const alarmRows = document.querySelectorAll('.alarm-row');

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
let currentRotation = 0;  // Start at 0° so hour 6 (6 AM at 90°) is at pointer
let isDrawerOpen = false;
let closeTimeout = null;
let isDialControlled = false;  // True when dial is being actively manipulated

// Apply initial dial rotation
dial.style.transform = `rotate(${currentRotation}deg)`;

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
  let found = false;
  alarmRows.forEach((row) => {
    if (!found && parseInt(row.dataset.hour) === hourIndex) {
      row.scrollIntoView({ behavior: 'auto', block: 'start' });
      found = true;
    }
  });
}

// Start drag when hovering over the dial container (peeking portion)
dialContainer.addEventListener('pointerdown', (e) => {
  isDragging = true;
  isDialControlled = true;
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
  if (!isDragging) return;
  
  const deltaY = e.clientY - startY;
  const rotationDelta = deltaY * 0.5;
  currentRotation = startRotation + rotationDelta;
  
  // Apply rotation to dial
  dial.style.transform = `rotate(${currentRotation}deg)`;
  
  // Update alarm list scroll position
  const pointedHour = getPointedHour();
  scrollToHour(pointedHour);
  
  e.preventDefault();
});

document.addEventListener('pointerup', (e) => {
  if (isDragging) {
    isDragging = false;
    dialContainer.releasePointerCapture(e.pointerId);
    
    // Allow scroll events to settle before allowing manual scroll detection
    setTimeout(() => {
      isDialControlled = false;
    }, 250);
    
    // Close drawer after delay
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
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    if (isDrawerOpen && !isDialControlled && !isDragging) {
      dialContainer.classList.remove('open');
      isDrawerOpen = false;
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      currentRotation = 0;
      dial.style.transform = `rotate(${currentRotation}deg)`;
    }
  }, 100);
});

// Close dial when tapping outside
document.addEventListener('pointerdown', (e) => {
  if (isDrawerOpen && !dialContainer.contains(e.target) && !isDragging) {
    dialContainer.classList.remove('open');
    isDrawerOpen = false;
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
    currentRotation = 0;
    dial.style.transform = `rotate(${currentRotation}deg)`;
  }
});

// Toggle switches on click
document.querySelectorAll('.switch').forEach(switchEl => {
  switchEl.addEventListener('click', (e) => {
    e.stopPropagation();
    switchEl.classList.toggle('off');
  });
});


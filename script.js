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
let currentRotation = 90;  // Start with pointer at 12 AM (hour 0)
let isDrawerOpen = false;
let closeTimeout = null;
let isDialScrolling = false;  // Track if dial is controlling the scroll

// Apply initial dial rotation
dial.style.transform = `rotate(${currentRotation}deg)`;

// Function to calculate which hour is pointed at
function getPointedHour() {
  let pointerAngle = 90; // Pointer at right edge
  let dialRotation = currentRotation % 360;
  
  // Calculate the angle the pointer is pointing to on the dial
  let pointedAngle = (pointerAngle - dialRotation) % 360;
  if (pointedAngle < 0) pointedAngle += 360;
  
  // Convert angle to 24-hour index (0-23)
  // With initial rotation at 90°, pointer at 90° should equal hour 0 (12 AM)
  // Formula: hour = (pointedAngle / 15 + 6) % 24
  let hourIndex = Math.round((pointedAngle / 15 + 6) % 24);
  if (hourIndex < 0) hourIndex += 24;
  
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
  startY = e.clientY;
  startRotation = currentRotation;
  dialContainer.setPointerCapture(e.pointerId);
  e.preventDefault();
  e.stopPropagation();  // Prevent document listener from closing dial
  
  // Clear any pending close timeout
  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
  }
  
  // Open drawer on drag start
  if (!isDrawerOpen) {
    dialContainer.classList.add('open');
    isDrawerOpen = true;
  }
});

document.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  
  const deltaY = e.clientY - startY;
  const rotationDelta = deltaY * 0.5;
  currentRotation = startRotation + rotationDelta;  // Finger movement directly controls dial
  
  // Apply rotation to dial
  dial.style.transform = `rotate(${currentRotation}deg)`;
  
  // Update alarm list scroll to reflect dial position
  isDialScrolling = true;  // Flag that dial is controlling the scroll
  const pointedHour = getPointedHour();
  scrollToHour(pointedHour);
  
  // Prevent default scrolling behavior
  e.preventDefault();
});

document.addEventListener('pointerup', (e) => {
  if (isDragging) {
    isDragging = false;
    dialContainer.releasePointerCapture(e.pointerId);
    
    // Reset the dial scrolling flag after a short delay to allow scroll event to complete
    setTimeout(() => {
      isDialScrolling = false;
    }, 100);
    
    // Close drawer after a delay only if still open
    closeTimeout = setTimeout(() => {
      if (isDrawerOpen) {
        dialContainer.classList.remove('open');
        isDrawerOpen = false;
      }
    }, 800);
  }
});

// Alarm list starts at top, dial should reflect what's centered
// No automatic scroll on page load

// Close dial when scrolling alarm list (but not when dial is controlling the scroll)
alarmsScroll.addEventListener('scroll', () => {
  // Only close if user is manually scrolling (not dial-controlled)
  if (isDrawerOpen && !isDialScrolling && !isDragging) {
    dialContainer.classList.remove('open');
    isDrawerOpen = false;
    // Clear any pending close timeout
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
    // Reset dial rotation to initial position (12 AM)
    currentRotation = 90;
    dial.style.transform = `rotate(${currentRotation}deg)`;
  }
});

// Close dial when tapping outside dial boundaries
document.addEventListener('pointerdown', (e) => {
  if (isDrawerOpen && !dialContainer.contains(e.target) && !isDragging) {
    dialContainer.classList.remove('open');
    isDrawerOpen = false;
    // Clear any pending close timeout
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
    // Reset dial rotation to initial position (12 AM)
    currentRotation = 90;
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


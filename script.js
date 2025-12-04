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
let currentRotation = 0;
let isDrawerOpen = false;

// Start drag when hovering over the dial container (peeking portion)
dialContainer.addEventListener('pointerdown', (e) => {
  isDragging = true;
  startY = e.clientY;
  startRotation = currentRotation;
  dialContainer.setPointerCapture(e.pointerId);
  e.preventDefault();
  
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
  
  // Calculate which hour the pointer is pointing to
  // Pointer is at right edge (3 o'clock position = 90 degrees in normal math)
  // Hour 0 (12 AM) is at 270° (left), Hour 12 (12 PM) is at 90° (right)
  // So pointer at 90° points to hour 12 (noon)
  
  let pointerAngle = 90; // Pointer at right edge
  let dialRotation = currentRotation % 360;
  
  // Calculate the angle the pointer is pointing to on the dial
  let pointedAngle = (pointerAngle - dialRotation) % 360;
  if (pointedAngle < 0) pointedAngle += 360;
  
  // Convert angle to 24-hour index (0-23)
  // At 90° (right), hour = 12; at 270° (left), hour = 0
  // So: hour = (90 - pointedAngle) / 15 -> needs adjustment
  // Actually: pointedAngle 90° = hour 12, pointedAngle 0° = hour 6, pointedAngle 270° = hour 0
  // Formula: hour = (12 - pointedAngle/15) % 24
  let hourIndex = Math.round((12 - pointedAngle / 15) % 24);
  if (hourIndex < 0) hourIndex += 24;
  
  // Find and scroll to matching alarm
  alarmRows.forEach((row) => {
    const rowHour = parseInt(row.dataset.hour);
    if (rowHour === hourIndex) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
});

document.addEventListener('pointerup', (e) => {
  if (isDragging) {
    isDragging = false;
    dragHandle.releasePointerCapture(e.pointerId);
    
    // Close drawer after a delay
    setTimeout(() => {
      dialContainer.classList.remove('open');
      isDrawerOpen = false;
    }, 500);
  }
});

// Initial scroll to first alarm
setTimeout(() => {
  alarmRows[0].scrollIntoView({ behavior: 'auto', block: 'center' });
}, 100);

// Toggle switches on click
document.querySelectorAll('.switch').forEach(switchEl => {
  switchEl.addEventListener('click', (e) => {
    e.stopPropagation();
    switchEl.classList.toggle('off');
  });
});

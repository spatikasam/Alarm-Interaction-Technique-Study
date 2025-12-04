const dial = document.getElementById('dial');
const dialContainer = document.querySelector('.dial-container');
const dragHandle = document.getElementById('dragHandle');
const alarmsScroll = document.getElementById('alarmsScroll');
const alarmRows = document.querySelectorAll('.alarm-row');

// Create dial ticks and numbers (24 hours on clock)
// Hour 0 (midnight) at top = 12 (AM to PM transition)
// Hour 12 (noon) at bottom = 12 (PM to AM transition)
for (let i = 0; i < 24; i++) {
  const tick = document.createElement('div');
  tick.className = 'dial-tick';
  tick.style.transform = `rotate(${i * 15}deg)`;
  dial.appendChild(tick);

  // Display numbers correctly:
  // i=0 (top, midnight) shows 12
  // i=1-11 show 1-11
  // i=12 (bottom, noon) shows 12
  // i=13-23 show 1-11
  const num = document.createElement('div');
  num.className = 'dial-number';
  let displayHour;
  if (i === 0 || i === 12) {
    displayHour = 12;  // Show 12 at both AM/PM transitions
  } else if (i < 12) {
    displayHour = i;   // 1-11 for first half
  } else {
    displayHour = i - 12;  // 1-11 for second half
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

dragHandle.addEventListener('pointerdown', (e) => {
  isDragging = true;
  startY = e.clientY;
  startRotation = currentRotation;
  dragHandle.setPointerCapture(e.pointerId);
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
  // Pointer is at right edge (3 o'clock position = 90 degrees)
  // Account for dial rotation to find which hour aligns with pointer
  let pointerAngle = 90; // Pointer at right edge
  let dialRotation = currentRotation;
  let hourAngle = (pointerAngle - dialRotation) % 360;
  if (hourAngle < 0) hourAngle += 360;
  
  // Each hour is 15 degrees (360/24)
  let hourIndex = Math.round(hourAngle / 15) % 24;
  
  // Invert scroll direction: when dial rotates up (negative delta), scroll down (later hours)
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

const dial = document.getElementById('dial');
const dialContainer = document.querySelector('.dial-container');
const dragHandle = document.getElementById('dragHandle');
const alarmsScroll = document.getElementById('alarmsScroll');
const alarmRows = document.querySelectorAll('.alarm-row');

// Create dial ticks (24-hour markers)
for (let i = 0; i < 24; i++) {
  const tick = document.createElement('div');
  tick.className = 'dial-tick';
  tick.style.transform = `rotate(${i * 15}deg)`;
  dial.appendChild(tick);
}

let isDragging = false;
let startY = 0;
let startRotation = -40;
let currentRotation = -40;
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
  currentRotation = startRotation + rotationDelta;
  
  // Apply rotation to dial
  dial.style.transform = `rotate(${currentRotation}deg)`;
  
  // Calculate which alarm hour based on rotation
  let normalizedRotation = ((currentRotation % 360) + 360) % 360;
  let hourIndex = Math.round(normalizedRotation / 15) % 24;
  
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

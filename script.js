/* ═══════════════════════════════════════════
   Platform 9¾ — Hogwarts Express
   script.js
═══════════════════════════════════════════ */

// ── CANVAS BACKGROUND (stars, moon, nebula, sparkles) ──
const C  = document.getElementById('bgCanvas');
const cx = C.getContext('2d');
let W, H, stars = [], particles = [];

function resize() {
  W = C.width  = innerWidth;
  H = C.height = innerHeight;
}

function initStars() {
  stars = [];
  for (let i = 0; i < 300; i++) {
    stars.push({
      x:  Math.random() * W,
      y:  Math.random() * H * 0.72,
      r:  Math.random() * 1.4 + 0.2,
      a:  Math.random(),
      sp: Math.random() * 0.009 + 0.002,
      ph: Math.random() * Math.PI * 2
    });
  }
}

let T = 0;

function frame() {
  T += 0.016;
  cx.clearRect(0, 0, W, H);

  // Sky gradient
  const sky = cx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0,   '#010408');
  sky.addColorStop(0.45,'#060b18');
  sky.addColorStop(0.75,'#0a1128');
  sky.addColorStop(1,   '#0d1530');
  cx.fillStyle = sky;
  cx.fillRect(0, 0, W, H);

  // Nebula left
  let n = cx.createRadialGradient(W * 0.18, H * 0.28, 0, W * 0.18, H * 0.28, W * 0.38);
  n.addColorStop(0, 'rgba(18,35,110,.14)');
  n.addColorStop(1, 'transparent');
  cx.fillStyle = n;
  cx.fillRect(0, 0, W, H);

  // Nebula right
  n = cx.createRadialGradient(W * 0.82, H * 0.18, 0, W * 0.82, H * 0.18, W * 0.32);
  n.addColorStop(0, 'rgba(75,8,8,.11)');
  n.addColorStop(1, 'transparent');
  cx.fillStyle = n;
  cx.fillRect(0, 0, W, H);

  // Moon glow
  const mx = W * 0.83, my = H * 0.11, mr = 52;
  let mg = cx.createRadialGradient(mx, my, mr * 2, mx, my, mr * 3.5);
  mg.addColorStop(0, 'rgba(215,195,90,.13)');
  mg.addColorStop(1, 'transparent');
  cx.fillStyle = mg;
  cx.fillRect(0, 0, W, H);

  // Moon body
  mg = cx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, 0, mx, my, mr);
  mg.addColorStop(0,   '#fffde6');
  mg.addColorStop(0.42,'#e8d890');
  mg.addColorStop(1,   '#b0a048');
  cx.beginPath();
  cx.arc(mx, my, mr + Math.sin(T * 0.5) * 1.8, 0, Math.PI * 2);
  cx.fillStyle = mg;
  cx.fill();

  // Stars
  stars.forEach(s => {
    s.a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(T * s.sp * 6 + s.ph));
    cx.beginPath();
    cx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    cx.fillStyle = `rgba(255,255,240,${s.a})`;
    cx.fill();
  });

  // Floating sparkles
  particles.forEach((p, i) => {
    p.y -= p.vy;
    p.x += Math.sin(T * p.f + p.ph) * 0.45;
    p.l -= 0.0045;
    if (p.l <= 0) { particles.splice(i, 1); return; }
    cx.beginPath();
    cx.arc(p.x, p.y, p.r * p.l, 0, Math.PI * 2);
    cx.fillStyle = `rgba(232,204,122,${p.l * 0.55})`;
    cx.fill();
  });

  // Spawn new sparkles
  if (Math.random() < 0.18) {
    particles.push({
      x:  Math.random() * W,
      y:  H * 0.82 + Math.random() * H * 0.1,
      vy: 0.45 + Math.random() * 0.9,
      r:  Math.random() * 2 + 0.5,
      l:  0.8 + Math.random() * 0.4,
      f:  Math.random() * 2,
      ph: Math.random() * Math.PI * 2
    });
  }

  requestAnimationFrame(frame);
}

window.addEventListener('resize', () => { resize(); initStars(); });
resize();
initStars();
frame();

// ── TRACK TIES ──
const tiesEl = document.getElementById('ties');
for (let i = 0; i < 45; i++) {
  const t = document.createElement('div');
  t.className = 'tie';
  t.style.left = (i * 38) + 'px';
  tiesEl.appendChild(t);
}

// ── PAGE NAVIGATION ──
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');
  window.scrollTo(0, 0);
}

// ── TOAST NOTIFICATION ──
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── LUGGAGE COUNTERS ──
const cnts = { trunk: 0, pet: 0, broom: 0 };

function chg(key, delta) {
  cnts[key] = Math.max(0, cnts[key] + delta);
  document.getElementById('cnt-' + key).textContent = cnts[key];
}

// ── SEAT MAP ──
const takenSeats = new Set([3, 6, 11, 15, 18, 22, 26, 31, 35, 40, 44]);
let selSeat = null;
const seatRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const sm = document.getElementById('seatMap');

seatRows.forEach((row, ri) => {
  for (let col = 1; col <= 8; col++) {

    // Aisle spacer after column 4
    if (col === 5) {
      const aisle = document.createElement('div');
      aisle.className = 'seat aisle';
      sm.appendChild(aisle);
    }

    const idx  = ri * 8 + col;
    const seat = document.createElement('div');
    seat.className   = 'seat';
    seat.textContent = row + col;

    if (takenSeats.has(idx)) {
      seat.classList.add('taken');
    } else {
      seat.dataset.id = row + col;
      seat.addEventListener('click', () => {
        document.querySelectorAll('.seat.selected').forEach(s => s.classList.remove('selected'));
        seat.classList.add('selected');
        selSeat = row + col;
        showToast('Seat ' + selSeat + ' selected');
      });
    }

    sm.appendChild(seat);
  }
});

// ── BOOKING WIZARD ──
let curStep = 1;

function goStep(n) {

  // Validation before advancing
  if (n > curStep) {
    if (curStep === 2) {
      const fn = document.getElementById('f-fname').value.trim();
      const ln = document.getElementById('f-lname').value.trim();
      if (!fn || !ln) {
        showToast('Please enter your full name');
        return;
      }
    }
    if (curStep === 3 && n === 4) {
      if (!selSeat) {
        showToast('Please select a seat');
        return;
      }
      buildReview();
    }
  }

  // Deactivate current step
  document.getElementById('bp-' + curStep).classList.remove('active');
  const prevStep = document.getElementById('bst-' + curStep);
  prevStep.classList.remove('active');
  if (n > curStep) prevStep.classList.add('done');
  else             prevStep.classList.remove('done');

  // Activate new step
  curStep = n;
  document.getElementById('bp-' + curStep).classList.add('active');
  const nextStep = document.getElementById('bst-' + curStep);
  nextStep.classList.add('active');
  nextStep.classList.remove('done');
}

function buildReview() {
  const classMap  = {
    standard: 'Standard · 5 Galleons',
    prefect:  'Prefect · 8 Galleons',
    first:    'First Class · 12 Galleons'
  };
  const priceMap  = { standard: 5, prefect: 8, first: 12 };
  const sel       = document.querySelector('input[name="cls"]:checked')?.value || 'standard';
  const adults    = parseInt(document.getElementById('f-adults').value);
  const kids      = parseInt(document.getElementById('f-kids').value);
  const totalFare = priceMap[sel] * adults + Math.floor(priceMap[sel] * 0.5 * kids);

  document.getElementById('revCard').innerHTML = `
    <div class="rev-row"><span class="rrl">Passenger</span><span class="rrv">${document.getElementById('f-fname').value} ${document.getElementById('f-lname').value}</span></div>
    <div class="rev-row"><span class="rrl">From</span><span class="rrv">${document.getElementById('f-from').value}</span></div>
    <div class="rev-row"><span class="rrl">To</span><span class="rrv">${document.getElementById('f-to').value}</span></div>
    <div class="rev-row"><span class="rrl">Date</span><span class="rrv">${document.getElementById('f-date').value || '01 Sep 2026'}</span></div>
    <div class="rev-row"><span class="rrl">Class</span><span class="rrv">${classMap[sel]}</span></div>
    <div class="rev-row"><span class="rrl">Passengers</span><span class="rrv">${adults} Adult${adults > 1 ? 's' : ''} · ${kids} Child${kids !== 1 ? 'ren' : ''}</span></div>
    <div class="rev-row"><span class="rrl">Seat</span><span class="rrv">Carriage 3, Seat ${selSeat}</span></div>
    <div class="rev-row"><span class="rrl">House</span><span class="rrv">${document.getElementById('f-house').value || 'Not specified'}</span></div>
    <div class="rev-row rev-total"><span class="rrl">Total Fare</span><span class="rrv">${totalFare} Galleons</span></div>
  `;
}

function confirmBooking() {
  const ref  = 'HE' + Math.floor(Math.random() * 90000 + 10000);
  const fn   = document.getElementById('f-fname').value || 'Passenger';
  const ln   = document.getElementById('f-lname').value || '';
  const dt   = document.getElementById('f-date').value  || '01 Sep 2026';
  const sel  = document.querySelector('input[name="cls"]:checked')?.value || 'standard';
  const cl   = { standard: 'STD', prefect: 'PFT', first: '1ST' }[sel];

  // Hide review panel, mark all steps done
  document.getElementById('bp-4').classList.remove('active');
  document.querySelectorAll('.b-step').forEach(s => {
    s.classList.remove('active');
    s.classList.add('done');
  });

  // Build ticket card
  document.getElementById('ticketCard').innerHTML = `
    <div class="tc-top">
      <div class="tc-stn"><div class="tc-lbl">From</div><div class="tc-code">KGX</div></div>
      <div class="tc-arr">————›</div>
      <div class="tc-stn"><div class="tc-lbl">To</div><div class="tc-code">HMS</div></div>
    </div>
    <div class="tc-body">
      <div><div class="tcf-lbl">Passenger</div><div class="tcf-val">${fn} ${ln}</div></div>
      <div><div class="tcf-lbl">Date</div><div class="tcf-val">${dt}</div></div>
      <div><div class="tcf-lbl">Seat</div><div class="tcf-val">Car. 3 · ${selSeat}</div></div>
      <div><div class="tcf-lbl">Class</div><div class="tcf-val">${cl}</div></div>
      <div><div class="tcf-lbl">Platform</div><div class="tcf-val">Nine and Three Quarters</div></div>
      <div><div class="tcf-lbl">Ref No.</div><div class="tcf-val">${ref}</div></div>
    </div>
  `;

  document.getElementById('sucWrap').classList.add('active');
}

function resetBooking() {
  document.getElementById('sucWrap').classList.remove('active');
  curStep  = 1;
  selSeat  = null;

  document.querySelectorAll('.b-step').forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i === 0) s.classList.add('active');
  });

  document.querySelectorAll('.b-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('bp-1').classList.add('active');
  document.querySelectorAll('.seat.selected').forEach(s => s.classList.remove('selected'));
}

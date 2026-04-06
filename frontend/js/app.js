/* ══════════════════════════════════════════
   app.js — Main Application Controller
   ElderCare App
   
   Handles: SPA routing, navbar, toast messages,
   clock, stat counters, particle animations, 
   modal, scroll effects, and feature card reveal.
══════════════════════════════════════════ */

// ─── SPA ROUTING ────────────────────────────
/**
 * Navigate to a section by name.
 * Hides all sections, shows the target one,
 * and updates the active nav link.
 */
function go(page) {
  // Hide all sections
  document.querySelectorAll('.sec').forEach(s => s.classList.remove('act'));
  // Show target section
  document.getElementById('sec-' + page).classList.add('act');
  // Update active nav link
  document.querySelectorAll('.nlinks li a').forEach(a => a.classList.remove('on'));
  document.querySelectorAll('.nlinks li a').forEach(a => {
    if (a.getAttribute('onclick') === `go('${page}')`) a.classList.add('on');
  });
  // Scroll to top
  window.scrollTo(0, 0);
  // Close hamburger menu on mobile
  document.getElementById('nav').classList.remove('open');

  // Page-specific initialization
  if (page === 'nearby') initMap();
  if (page === 'tips') { renderTips('all'); renderWellness(); }
  if (page === 'medicine') renderMeds();
  if (page === 'contacts') renderContacts('');
}

// ─── HAMBURGER MENU ─────────────────────────
document.getElementById('ham').addEventListener('click', () => {
  document.getElementById('nav').classList.toggle('open');
});

// ─── NAVBAR SCROLL SHADOW ───────────────────
window.addEventListener('scroll', () => {
  document.getElementById('nb').classList.toggle('up', window.scrollY > 10);
});

// ─── TOAST NOTIFICATIONS ────────────────────
/**
 * Show a toast message.
 * @param {string} msg - Message text
 * @param {string} type - 'ok' | 'err' | 'info'
 */
function toast(msg, type = 'ok') {
  const box = document.getElementById('tbox');
  const el = document.createElement('div');
  el.className = `tst ${type}`;
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ─── LIVE CLOCK (Medicine Page) ─────────────
function updateClock() {
  const el = document.getElementById('clk');
  if (el) el.textContent = new Date().toLocaleTimeString('en-IN');
}
setInterval(updateClock, 1000);
updateClock();

// ─── ANIMATED STAT COUNTERS ─────────────────
function animateStats() {
  document.querySelectorAll('.sn[data-to]').forEach(el => {
    const target = parseInt(el.dataset.to);
    let cur = 0;
    const step = Math.ceil(target / 40);
    const interval = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur;
      if (cur >= target) clearInterval(interval);
    }, 35);
  });
}

// ─── FEATURE CARD REVEAL (Intersection Observer) ─
function initCardReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('show');
        // Also trigger stat counter when stats section appears
        if (e.target.classList.contains('stats')) animateStats();
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fc, .stats').forEach(el => observer.observe(el));
}

// ─── HERO FLOATING PARTICLES ─────────────────
function initParticles() {
  const cont = document.getElementById('pcont');
  if (!cont) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'pt';
    const size = 8 + Math.random() * 22;
    p.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random() * 100}%;
      animation-duration:${5 + Math.random() * 9}s;
      animation-delay:${Math.random() * 7}s;
      opacity:${0.2 + Math.random() * 0.4}
    `;
    cont.appendChild(p);
  }
}

// ─── MEDICINE ALARM MODAL ────────────────────
let currentAlarmMedId = null;

/**
 * Show the medicine alarm modal popup.
 * @param {string} id - Medicine ID
 * @param {string} name - Medicine name
 * @param {string} dose - Dosage info
 */
function showAlarm(id, name, dose) {
  currentAlarmMedId = id;
  document.getElementById('mico').textContent = '💊';
  document.getElementById('mtitle').textContent = `Time for ${name}!`;
  document.getElementById('mmsg').textContent = `Dosage: ${dose || 'As prescribed'}. Please take your medicine now.`;
  document.getElementById('modal').style.display = 'flex';
  // Play audio alert
  try {
    const ctx = new AudioContext();
    const playBeep = (freq, start, dur) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.4, ctx.currentTime + start);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      o.start(ctx.currentTime + start);
      o.stop(ctx.currentTime + start + dur);
    };
    [0, 0.3, 0.6].forEach(t => playBeep(880, t, 0.25));
  } catch (e) {}
}

function markTaken() {
  if (currentAlarmMedId) {
    DB.updateMedicine(currentAlarmMedId, { takenToday: true, takenAt: new Date().toLocaleTimeString() });
    renderMeds();
    toast('✅ Medicine marked as taken!');
  }
  closeModal();
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  currentAlarmMedId = null;
  // Snooze: re-check after 5 minutes
  if (currentAlarmMedId) {
    setTimeout(() => checkAlarms(), 5 * 60 * 1000);
  }
}

// ─── INITIALIZE ON LOAD ──────────────────────
window.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initCardReveal();
  renderMeds();
  renderContacts('');
  renderTips('all');
  renderWellness();
});

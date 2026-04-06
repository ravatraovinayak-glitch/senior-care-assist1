/* ══════════════════════════════════════════
   medicine.js — Medicine Reminder Module
   ElderCare App
   
   Handles: Add/delete medicines, alarm checking,
   real-time clock, taken status tracking.
   Data is persisted via db.js (localStorage).
══════════════════════════════════════════ */

// ─── ALARM CHECKER (runs every 30 seconds) ──
setInterval(checkAlarms, 30000);

/**
 * Check if any medicine's reminder time matches the current time.
 * Triggers the alarm modal if a match is found and medicine not yet taken.
 */
function checkAlarms() {
  const now = new Date();
  const hhmm = now.getHours().toString().padStart(2, '0') + ':' +
                now.getMinutes().toString().padStart(2, '0');
  const today = now.toDateString();

  DB.getMedicines().forEach(med => {
    if (med.time === hhmm && med.takenDate !== today) {
      showAlarm(med.id, med.name, med.dose);
    }
  });
  renderMeds(); // refresh ring animation
}

/**
 * Add a new medicine reminder.
 * Reads form values, validates, then saves to DB.
 */
function addMed() {
  const name = document.getElementById('mn').value.trim();
  const dose = document.getElementById('md').value.trim();
  const time = document.getElementById('mt').value;
  const freq = document.getElementById('mf').value;
  const note = document.getElementById('mno').value.trim();

  if (!name) { toast('Enter medicine name!', 'err'); return; }
  if (!time) { toast('Select a reminder time!', 'err'); return; }

  const med = {
    id: DB.generateId(),
    name,
    dose,
    time,
    freq,
    note,
    addedOn: new Date().toLocaleDateString(),
    takenDate: null
  };

  DB.insertMedicine(med);
  renderMeds();

  // Reset form
  ['mn','md','mt','mno'].forEach(id => document.getElementById(id).value = '');
  toast(`✅ ${name} reminder set for ${time}!`);
}

/**
 * Delete a medicine by ID.
 * @param {string} id
 */
function delMed(id) {
  DB.deleteMedicine(id);
  renderMeds();
  toast('Reminder removed.', 'info');
}

/**
 * Mark a medicine as taken today.
 * @param {string} id
 */
function takeMed(id) {
  DB.updateMedicine(id, { takenDate: new Date().toDateString() });
  renderMeds();
  toast('✅ Medicine marked as taken!');
}

/**
 * Render the list of medicines in the UI.
 * Highlights medicines whose alarm is ringing now.
 */
function renderMeds() {
  const list = document.getElementById('mlist');
  const cnt  = document.getElementById('mcnt');
  if (!list) return;

  const meds = DB.getMedicines();
  const now  = new Date();
  const hhmm = now.getHours().toString().padStart(2, '0') + ':' +
               now.getMinutes().toString().padStart(2, '0');
  const today = now.toDateString();

  if (cnt) cnt.textContent = `${meds.length} medicine${meds.length !== 1 ? 's' : ''} saved`;

  if (!meds.length) {
    list.innerHTML = `
      <div style="text-align:center;color:var(--mu);padding:2rem">
        <div style="font-size:3.2rem">💊</div>
        <p style="margin-top:.6rem">No medicines added yet — add one above!</p>
      </div>`;
    return;
  }

  list.innerHTML = meds.map(m => {
    const isRinging = m.time === hhmm && m.takenDate !== today;
    const isTaken   = m.takenDate === today;
    return `
    <div class="mitem ${isRinging ? 'ring' : ''}">
      <div class="mico">${isRinging ? '<span class="bs">🔔</span>' : '💊'}</div>
      <div class="minfo">
        <strong>${m.name}</strong>
        <span>${m.dose || 'No dosage specified'} · ${m.freq} · ${m.note || ''}</span>
      </div>
      <div class="mtime">⏰ ${m.time}</div>
      <div class="mact">
        ${isTaken
          ? `<span class="badge bg">✅ Taken</span>`
          : `<button class="btn btng btnsm" onclick="takeMed('${m.id}')">✅ Taken</button>`
        }
        <button class="ibtn dl" onclick="delMed('${m.id}')" title="Delete">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

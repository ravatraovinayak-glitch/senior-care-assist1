/* ══════════════════════════════════════════
   contacts.js — Emergency Contacts Module
   ElderCare App
   
   Handles: Add/delete contacts, search filtering,
   priority sorting, and rendering contact list.
   Data is persisted via db.js (localStorage).
══════════════════════════════════════════ */

// Relation → emoji map
const REMI = {
  Son:'👦', Daughter:'👧', Spouse:'❤️',
  Doctor:'🩺', Neighbour:'🏘️', Friend:'🤝', Other:'👤'
};

// Priority order for sorting
const PRIORD = { high: 1, normal: 2 };

// Sort toggle state
let csort = false;

/**
 * Add a new contact.
 * Reads form values, validates, saves to DB, and re-renders.
 */
function addContact() {
  const name  = document.getElementById('cn').value.trim();
  const phone = document.getElementById('cp').value.trim().replace(/\s|-/g, '');
  const rel   = document.getElementById('cr').value;
  const pri   = document.getElementById('cpr').value;

  if (!name || !phone) { toast('Enter name and phone number!', 'err'); return; }
  if (!/^\d{7,15}$/.test(phone)) { toast('Enter a valid phone number!', 'err'); return; }

  const contact = {
    id: DB.generateId(),
    name,
    phone,
    rel,
    pri,
    savedOn: new Date().toLocaleDateString()
  };

  DB.insertContact(contact);
  renderContacts('');

  // Reset form
  document.getElementById('cn').value = '';
  document.getElementById('cp').value = '';
  toast(`✅ ${name} saved!`);
}

/**
 * Delete a contact by ID.
 * @param {string} id
 */
function delContact(id) {
  DB.deleteContact(id);
  const q = document.getElementById('csrch')?.value?.toLowerCase() || '';
  renderContacts(q);
  toast('Contact removed.', 'info');
}

/**
 * Toggle priority-based sorting.
 */
function toggleCSort() {
  csort = !csort;
  const q = document.getElementById('csrch')?.value?.toLowerCase() || '';
  renderContacts(q);
}

/**
 * Render the contacts list filtered by a search query.
 * @param {string} q - Lowercase search string
 */
function renderContacts(q) {
  const list = document.getElementById('clist');
  const cnt  = document.getElementById('ccnt');
  if (!list) return;

  let data = DB.getContacts().filter(c =>
    c.name.toLowerCase().includes(q) || c.phone.includes(q)
  );

  // Apply priority sort if enabled
  if (csort) {
    data = [...data].sort((a, b) => (PRIORD[a.pri] || 2) - (PRIORD[b.pri] || 2));
  }

  if (cnt) cnt.textContent = `${data.length} contact${data.length !== 1 ? 's' : ''} saved`;

  if (!data.length) {
    list.innerHTML = `
      <div style="text-align:center;color:var(--mu);padding:2rem">
        <div style="font-size:3.2rem">📒</div>
        <p style="margin-top:.6rem">
          ${q ? 'No contacts match your search.' : 'No contacts yet — add above!'}
        </p>
      </div>`;
    return;
  }

  list.innerHTML = data.map(c => `
    <div class="citem">
      <div class="cav">${REMI[c.rel] || '👤'}</div>
      <div class="ci">
        <strong>
          ${c.name}
          ${c.pri === 'high' ? '<span class="star">⭐</span>' : ''}
        </strong>
        <span>${c.phone} &nbsp;•&nbsp; <span class="rbadge">${c.rel}</span></span>
      </div>
      <a href="tel:${c.phone}" class="ibtn cl" title="Call">📞</a>
      <button class="ibtn dl" onclick="delContact('${c.id}')" title="Delete">🗑️</button>
    </div>`).join('');
}

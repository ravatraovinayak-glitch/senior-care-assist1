/* ══════════════════════════════════════════
   db.js — Database Layer (localStorage)
   ElderCare App
   
   Simulates a database using browser's localStorage.
   In a real backend, these would be API calls to
   a Node.js/Express server connected to MongoDB or MySQL.
══════════════════════════════════════════ */

const DB = {

  // ─── MEDICINES TABLE ───────────────────────
  getMedicines() {
    return JSON.parse(localStorage.getItem('ec_meds') || '[]');
  },
  saveMedicines(data) {
    localStorage.setItem('ec_meds', JSON.stringify(data));
  },
  insertMedicine(med) {
    const all = this.getMedicines();
    all.push(med);
    this.saveMedicines(all);
  },
  deleteMedicine(id) {
    const all = this.getMedicines().filter(m => m.id !== id);
    this.saveMedicines(all);
  },
  updateMedicine(id, updates) {
    const all = this.getMedicines().map(m =>
      m.id === id ? { ...m, ...updates } : m
    );
    this.saveMedicines(all);
  },

  // ─── CONTACTS TABLE ────────────────────────
  getContacts() {
    return JSON.parse(localStorage.getItem('ec_c') || '[]');
  },
  saveContacts(data) {
    localStorage.setItem('ec_c', JSON.stringify(data));
  },
  insertContact(contact) {
    const all = this.getContacts();
    all.push(contact);
    this.saveContacts(all);
  },
  deleteContact(id) {
    const all = this.getContacts().filter(c => c.id !== id);
    this.saveContacts(all);
  },

  // ─── WELLNESS CHECKLIST TABLE ──────────────
  // Keyed by date string (e.g., "Wed Mar 25 2026")
  getWellness(dateKey) {
    return JSON.parse(localStorage.getItem('ec_w_' + dateKey) || '{}');
  },
  saveWellness(dateKey, data) {
    localStorage.setItem('ec_w_' + dateKey, JSON.stringify(data));
  },
  updateWellnessItem(dateKey, itemId, value) {
    const saved = this.getWellness(dateKey);
    saved[itemId] = value;
    this.saveWellness(dateKey, saved);
  },

  // ─── UTILITY ───────────────────────────────
  clearAll() {
    localStorage.clear();
  },
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5);
  }
};

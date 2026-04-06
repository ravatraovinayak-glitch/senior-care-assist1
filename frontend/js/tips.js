/* ══════════════════════════════════════════
   tips.js — Health Tips & Wellness Module
   ElderCare App
   
   Handles: Daily tip display, category filtering,
   tip card rendering, and wellness checklist.
   Checklist data is persisted per-day via db.js.
══════════════════════════════════════════ */

// ─── TIPS DATA ───────────────────────────────
// In a real backend, this would come from an API endpoint:
// GET /api/tips  →  returns array from tips table in DB

const TIPS = [
  { em:'🥗', cat:'nutrition', cc:'#4CAF50', title:'Eat More Greens',         text:'Include leafy greens like spinach or palak daily. Rich in iron and calcium — essential for seniors.' },
  { em:'🍌', cat:'nutrition', cc:'#FF9800', title:'Potassium for Heart',      text:'Eat a banana or sweet potato daily. Potassium regulates blood pressure and supports heart function.' },
  { em:'🐟', cat:'nutrition', cc:'#2196F3', title:'Fish Twice a Week',        text:'Fatty fish like sardines provide Omega-3 fatty acids that protect the heart and brain.' },
  { em:'🥛', cat:'nutrition', cc:'#9E9E9E', title:'Calcium for Bones',        text:'Drink warm milk or eat curd daily. After 60, calcium absorption decreases — dairy helps.' },
  { em:'🌰', cat:'nutrition', cc:'#795548', title:'Snack on Nuts',            text:'A handful of walnuts or almonds daily improves memory and reduces bad cholesterol.' },
  { em:'🍊', cat:'nutrition', cc:'#FF5722', title:'Vitamin C Daily',          text:'Eat one orange or amla daily. Vitamin C strengthens immunity and protects against infections.' },
  { em:'🚶', cat:'exercise',  cc:'#4CAF50', title:'Walk 30 Min Daily',        text:'A gentle 30-minute morning walk lowers blood pressure and improves mood naturally.' },
  { em:'🧘', cat:'exercise',  cc:'#9C27B0', title:'Gentle Yoga',              text:'15 minutes of gentle yoga each morning reduces joint pain and calms the mind.' },
  { em:'🏋️', cat:'exercise',  cc:'#F44336', title:'Light Strength Work',      text:'Use light weights twice a week. Muscle strength prevents falls and makes daily tasks easier.' },
  { em:'🌳', cat:'exercise',  cc:'#2E7D32', title:'Gardening = Fitness',      text:'Watering plants and gardening improves grip strength, flexibility, and mental well-being.' },
  { em:'🏊', cat:'exercise',  cc:'#03A9F4', title:'Try Swimming',             text:'Water aerobics is the safest senior exercise — zero joint impact, full heart benefits.' },
  { em:'🧩', cat:'mental',    cc:'#9C27B0', title:'Puzzle Your Brain',        text:'Solve crosswords or sudoku daily. Mental exercises delay cognitive decline and keep memory sharp.' },
  { em:'📖', cat:'mental',    cc:'#3F51B5', title:'Read Every Day',           text:'Reading 20 minutes daily reduces stress and can delay dementia onset by years.' },
  { em:'👨‍👩‍👧', cat:'mental',   cc:'#E91E63', title:'Stay Connected',           text:'Regular conversations with family reduces depression risk. Video calls and phone chats all count!' },
  { em:'🎨', cat:'mental',    cc:'#FF5722', title:'Creative Activities',      text:'Try painting or knitting. Creative activities reduce anxiety and stimulate the brain.' },
  { em:'🙏', cat:'mental',    cc:'#FF9800', title:'Practice Gratitude',       text:"Write 3 things you're grateful for every morning. Gratitude significantly improves well-being." },
  { em:'😴', cat:'sleep',     cc:'#3F51B5', title:'Sleep 7-8 Hours',          text:'Seniors need 7–8 hours of quality sleep. Good sleep repairs cells and boosts immunity.' },
  { em:'🌙', cat:'sleep',     cc:'#1A237E', title:'Consistent Schedule',      text:'Same bedtime and wake time every day regulates your internal clock for deeper sleep.' },
  { em:'📱', cat:'sleep',     cc:'#607D8B', title:'No Screens Before Bed',    text:'Avoid phone or TV 1 hour before sleep. Blue light suppresses melatonin and delays sleep.' },
  { em:'☕', cat:'sleep',     cc:'#795548', title:'No Tea After 4 PM',        text:'Skip caffeinated drinks after 4 PM. Caffeine stays in your system 6+ hours.' },
  { em:'💧', cat:'hydration', cc:'#2196F3', title:'8 Glasses of Water',       text:"Seniors often don't feel thirsty when dehydrated. Set reminders to drink throughout the day." },
  { em:'🥤', cat:'hydration', cc:'#00BCD4', title:'Warm Water Morning',       text:'One glass of warm water first thing each morning aids digestion and kick-starts metabolism.' },
  { em:'🍵', cat:'hydration', cc:'#4CAF50', title:'Herbal Teas Count',        text:'Chamomile, tulsi, or ginger tea count as daily fluids and provide calming benefits.' },
  { em:'🫐', cat:'hydration', cc:'#673AB7', title:'Water-Rich Foods',         text:'Cucumbers, watermelons, and tomatoes are 90%+ water — they hydrate while giving vitamins.' },
  { em:'🦺', cat:'safety',    cc:'#FF9800', title:'Prevent Falls',            text:'Remove loose rugs, install grab bars in bathrooms, use non-slip mats. Falls are the top senior injury.' },
  { em:'💊', cat:'safety',    cc:'#F44336', title:'Organize Medicines',       text:'Use a weekly pill organizer and take medicines at the same time. Never skip or double-dose.' },
  { em:'☀️', cat:'safety',    cc:'#FFC107', title:'Sun Safety',               text:'Apply SPF 30+ sunscreen before going outdoors. Senior skin is more prone to UV damage.' },
  { em:'🩺', cat:'safety',    cc:'#009688', title:'Regular Check-ups',        text:'Visit your doctor every 6 months even when healthy. Early detection of BP and sugar saves lives.' },
];

// ─── WELLNESS CHECKLIST ITEMS ─────────────────
// In a real backend: GET /api/wellness-items
const WELL = [
  { id:'w1', em:'💊', text:'Took all medicines on time' },
  { id:'w2', em:'💧', text:'Drank 8 glasses of water' },
  { id:'w3', em:'🚶', text:'Did at least 20 min of exercise' },
  { id:'w4', em:'🥗', text:'Ate fruits and vegetables' },
  { id:'w5', em:'😴', text:'Had 7–8 hours of sleep last night' },
  { id:'w6', em:'👨‍👩‍👧', text:'Connected with a family member' },
  { id:'w7', em:'☀️', text:'Spent time outdoors in sunlight' },
];

// ─── TODAY'S TIP ─────────────────────────────
// Rotates tip based on day of month
const tod = TIPS[new Date().getDate() % TIPS.length];
document.addEventListener('DOMContentLoaded', () => {
  const em    = document.getElementById('todem');
  const title = document.getElementById('todtitle');
  const text  = document.getElementById('todtext');
  if (em)    em.textContent    = tod.em;
  if (title) title.textContent = tod.title;
  if (text)  text.textContent  = tod.text;
});

// ─── CATEGORY FILTER ─────────────────────────
/**
 * Filter tips by category.
 * @param {HTMLElement} btn - Clicked category button
 * @param {string} cat - Category name or 'all'
 */
function fcat(btn, cat) {
  document.querySelectorAll('.cat').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderTips(cat);
}

/**
 * Render tip cards for a given category.
 * @param {string} cat
 */
function renderTips(cat) {
  const grid = document.getElementById('tgrid');
  if (!grid) return;

  const list = cat === 'all' ? TIPS : TIPS.filter(t => t.cat === cat);
  grid.innerHTML = list.map((t, i) => `
    <div class="tcard" style="--cc:${t.cc};animation-delay:${i * 0.04}s">
      <div class="ttag">${t.cat.charAt(0).toUpperCase() + t.cat.slice(1)}</div>
      <div class="tem">${t.em}</div>
      <h4>${t.title}</h4>
      <p>${t.text}</p>
    </div>`).join('');
}

// ─── WELLNESS CHECKLIST ───────────────────────
/**
 * Render today's wellness checklist with progress bar.
 * Reads saved checkbox states from DB (keyed by today's date).
 */
function renderWellness() {
  const wlist = document.getElementById('wlist');
  if (!wlist) return;

  const today = new Date().toDateString();
  const saved = DB.getWellness(today);
  const done  = Object.values(saved).filter(Boolean).length;
  const pct   = Math.round(done / WELL.length * 100);

  wlist.innerHTML =
    WELL.map(w => `
      <div class="wrow">
        <span style="font-size:1.3rem;flex-shrink:0">${w.em}</span>
        <label for="${w.id}">${w.text}</label>
        <input type="checkbox" id="${w.id}"
          ${saved[w.id] ? 'checked' : ''}
          onchange="tickW('${w.id}', this.checked)"/>
      </div>`).join('') +
    `<div style="margin-top:.9rem">
      <div style="display:flex;justify-content:space-between;margin-bottom:.3rem">
        <span style="font-weight:700;color:var(--gd)">Today's Progress</span>
        <span style="font-weight:800;color:var(--g)">${done}/${WELL.length} (${pct}%)</span>
      </div>
      <div class="pbar"><div class="pfill" style="width:${pct}%"></div></div>
      ${pct === 100
        ? '<p style="text-align:center;color:var(--g);font-weight:800;margin-top:.6rem">🎉 Amazing! All wellness goals done today!</p>'
        : ''}
    </div>`;
}

/**
 * Update a wellness checklist item in the DB and re-render.
 * @param {string} id - Wellness item ID
 * @param {boolean} val - Checked or not
 */
function tickW(id, val) {
  const today = new Date().toDateString();
  DB.updateWellnessItem(today, id, val);
  renderWellness();
}

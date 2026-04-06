/* ══════════════════════════════════════════
   nearby.js — Nearby Hospitals & Pharmacies
   ElderCare App
   
   Handles: Geolocation, Leaflet map rendering,
   Overpass API calls to fetch nearby OSM places,
   place list rendering and tab filtering.
══════════════════════════════════════════ */

let mapInstance = null;
let allPlaces   = [];
let userLat     = null;
let userLng     = null;
let mapInitialized = false;

/**
 * Initialize the Leaflet map and fetch nearby places.
 * Called when user navigates to the Nearby section.
 */
function initMap() {
  if (mapInitialized) return;
  mapInitialized = true;

  const locbar = document.getElementById('locbar');
  locbar.textContent = '📍 Detecting your location…';
  locbar.className = 'locbar ok';

  if (!navigator.geolocation) {
    locbar.textContent = '❌ Geolocation not supported by your browser.';
    locbar.className = 'locbar er';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => onLocationSuccess(pos),
    err => onLocationError(err),
    { timeout: 10000, maximumAge: 60000 }
  );
}

/**
 * Called when geolocation succeeds.
 * Sets up Leaflet map and fetches OSM data.
 */
function onLocationSuccess(pos) {
  userLat = pos.coords.latitude;
  userLng = pos.coords.longitude;

  const locbar = document.getElementById('locbar');
  locbar.textContent = `📍 Location found — showing places near you`;
  locbar.className = 'locbar ok';

  // Initialize Leaflet Map
  mapInstance = L.map('map').setView([userLat, userLng], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapInstance);

  // User location marker
  L.circleMarker([userLat, userLng], {
    radius: 10, color: '#2e7d32', fillColor: '#4CAF50',
    fillOpacity: 0.9, weight: 3
  }).addTo(mapInstance).bindPopup('📍 You are here').openPopup();

  fetchNearbyPlaces(userLat, userLng);
}

/**
 * Called when geolocation fails.
 */
function onLocationError(err) {
  const locbar = document.getElementById('locbar');
  locbar.textContent = '❌ Could not get your location. Please allow location access.';
  locbar.className = 'locbar er';
  document.getElementById('plist').innerHTML =
    `<p style="color:var(--mu);padding:1rem;text-align:center">
      Enable location permission and reload the page to see nearby places.
    </p>`;
}

/**
 * Fetch nearby hospitals & pharmacies using OpenStreetMap Overpass API.
 * @param {number} lat
 * @param {number} lng
 */
function fetchNearbyPlaces(lat, lng) {
  const radius = 3000; // 3km radius
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      node["amenity"="pharmacy"](around:${radius},${lat},${lng});
      node["amenity"="clinic"](around:${radius},${lat},${lng});
      way["amenity"="hospital"](around:${radius},${lat},${lng});
    );
    out body; >; out skel qt;
  `;

  fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
    .then(r => r.json())
    .then(data => {
      allPlaces = parseOSMPlaces(data.elements, lat, lng);
      renderPlacesList('all');
      addMapMarkers(allPlaces);
    })
    .catch(() => {
      document.getElementById('plist').innerHTML =
        `<p style="color:var(--mu);padding:1rem;text-align:center">
          ⚠️ Could not load nearby places. Please check your internet connection.
        </p>`;
    });
}

/**
 * Parse raw OSM elements into a clean array.
 */
function parseOSMPlaces(elements, userLat, userLng) {
  return elements
    .filter(e => e.lat && e.lon && e.tags && e.tags.name)
    .map(e => ({
      id: e.id,
      name: e.tags.name,
      type: e.tags.amenity === 'pharmacy' ? 'pharmacy' : 'hospital',
      lat: e.lat,
      lng: e.lon,
      address: [e.tags['addr:street'], e.tags['addr:city']].filter(Boolean).join(', ') || 'Address not listed',
      phone: e.tags.phone || e.tags['contact:phone'] || null,
      dist: getDistanceKm(userLat, userLng, e.lat, e.lon)
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 20); // max 20 results
}

/**
 * Calculate distance between two lat/lng points in km (Haversine formula).
 */
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/**
 * Add Leaflet markers for each place.
 */
function addMapMarkers(places) {
  places.forEach(p => {
    const icon = p.type === 'pharmacy' ? '💊' : '🏥';
    const marker = L.marker([p.lat, p.lng]).addTo(mapInstance);
    marker.bindPopup(`
      <strong>${icon} ${p.name}</strong><br>
      ${p.address}<br>
      <a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}"
         target="_blank" style="color:#2e7d32;font-weight:700">
        🗺️ Get Directions
      </a>`);
  });
}

/**
 * Filter place list by type tab.
 */
function ftab(btn, type) {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderPlacesList(type);
}

/**
 * Render the list of nearby places filtered by type.
 */
function renderPlacesList(type) {
  const list = document.getElementById('plist');
  if (!list) return;

  const filtered = type === 'all' ? allPlaces : allPlaces.filter(p => p.type === type);

  if (!filtered.length) {
    list.innerHTML = `<p style="color:var(--mu);padding:1rem;text-align:center">No ${type === 'all' ? 'places' : type + 's'} found nearby.</p>`;
    return;
  }

  list.innerHTML = filtered.map(p => `
    <div class="pitem">
      <div class="pico ${p.type === 'pharmacy' ? 'p' : 'h'}">
        ${p.type === 'pharmacy' ? '💊' : '🏥'}
      </div>
      <div class="pinfo">
        <strong>${p.name}</strong>
        <span>${p.address} · ${p.dist.toFixed(1)} km away</span>
        ${p.phone ? `<span>📞 ${p.phone}</span>` : ''}
      </div>
      <a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}"
         target="_blank" class="dirbtn">🗺️ Directions</a>
    </div>`).join('');
}

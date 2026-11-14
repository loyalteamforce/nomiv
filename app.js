const map = L.map('map').setView([42.8746, 74.5698], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const listEl = document.getElementById('routes');
const searchEl = document.getElementById('search');
const items = [];

fetch('routes.json')
  .then(r => r.json())
  .then(data => {
    const stops = Object.fromEntries(data.stops.map(s => [s.id, s]));
    data.routes.forEach(route => {
      const pts = route.stops.map(id => [stops[id].lat, stops[id].lng]);
      const group = L.layerGroup();
      L.polyline(pts, { color: route.color, weight: 5, opacity: 0.85 }).addTo(group);
      route.stops.forEach(id => {
        const s = stops[id];
        L.circleMarker([s.lat, s.lng], { radius: 6, color: route.color, fillColor: '#fff', fillOpacity: 1, weight: 3 })
          .bindPopup(document.createTextNode(s.name).textContent)
          .addTo(group);
      });
      group.addTo(map);

      const li = document.createElement('li');
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = route.color;
      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = route.number + ' — ' + route.name;
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = true;
      cb.addEventListener('click', e => e.stopPropagation());
      cb.addEventListener('change', () => {
        cb.checked ? group.addTo(map) : map.removeLayer(group);
      });
      li.addEventListener('click', () => {
        if (!cb.checked) { cb.checked = true; group.addTo(map); }
        map.fitBounds(L.latLngBounds(pts), { padding: [40, 40] });
      });
      li.append(dot, name, cb);
      listEl.appendChild(li);

      const searchText = (route.number + ' ' + route.name + ' ' + route.stops.map(id => stops[id].name).join(' ')).toLowerCase();
      items.push({ li, searchText });
    });
  })
  .catch(() => {
    listEl.textContent = 'Не удалось загрузить маршруты.';
  });

searchEl.addEventListener('input', () => {
  const q = searchEl.value.trim().toLowerCase();
  items.forEach(({ li, searchText }) => {
    li.style.display = searchText.includes(q) ? '' : 'none';
  });
});

let me;
document.getElementById('locate').addEventListener('click', () => {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos => {
    const ll = [pos.coords.latitude, pos.coords.longitude];
    if (me) map.removeLayer(me);
    me = L.circleMarker(ll, { radius: 8, color: '#1b6ef3', fillColor: '#1b6ef3', fillOpacity: 0.9 }).addTo(map);
    map.setView(ll, 15);
  });
});

/* ---------- Bottom navigation ---------- */
const nav = document.getElementById('bottom-nav');
const lamp = document.getElementById('lamp');
const tabs = Array.from(nav.querySelectorAll('.tab'));
let currentView = 'map';

function moveLamp() {
  const active = tabs.find(t => t.classList.contains('active') && !t.classList.contains('center'));
  if (!active) {
    lamp.style.opacity = '0';
    return;
  }
  lamp.style.width = active.offsetWidth + 'px';
  lamp.style.transform = 'translateX(' + active.offsetLeft + 'px)';
  lamp.style.opacity = '1';
}

function showView(name) {
  currentView = name;
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('active', v.id === 'view-' + name);
  });
  tabs.forEach(t => {
    const on = t.dataset.view === name;
    t.classList.toggle('active', on);
    if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
  });
  moveLamp();
  if (name === 'map') setTimeout(() => map.invalidateSize(), 0);
}

tabs.forEach(t => t.addEventListener('click', () => showView(t.dataset.view)));
window.addEventListener('resize', moveLamp);
showView(currentView);

/*
  Partials and helpers for the RaceCarHealth UX prototypes.

  Pages that want the shared sidebar declare:
    <aside id="sidebar" data-active="fleet"></aside>

  …and include this script after fixtures/data.js. Sidebar auto-mounts on
  DOMContentLoaded. Stub nav items (Sessions, Reports, Check library,
  Channel maps, Car types) toast "coming next" automatically — no per-page
  wiring needed.

  Pages also get RCH.toast(msg) — a single shared toast helper. Element
  with id="toast" is created automatically if the page didn't include one.

  No build step. Works under file://.
*/

(function () {
  'use strict';

  // Note: "Events" is a post-v1 advanced feature. Pages exist (events-list,
  // event-detail, car-event-detail) but not surfaced in nav for MVP.
  const NAV_ITEMS = {
    primary: [
      { key: 'fleet',    href: 'cars-list-d-final.html', ico: '▸', label: 'Fleet' },
      { key: 'sessions', href: '#', stub: true,          ico: '◇', label: 'Sessions' },
      { key: 'reports',  href: '#', stub: true,          ico: '≡', label: 'Reports' },
    ],
    configure: [
      { key: 'checks',   href: '#', stub: true,         ico: '∷', label: 'Check library' },
      { key: 'channels', href: '#', stub: true,         ico: '⌥', label: 'Channel maps' },
      { key: 'cartypes', href: 'car-types.html',        ico: '◐', label: 'Car types' },
      { key: 'settings', href: 'team-settings.html',    ico: '⚙', label: 'Settings' },
    ],
  };

  const BRAND_SVG = `
    <svg viewBox="0 0 260 48" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
        <rect x="3" y="14" width="22" height="20" rx="10"/>
        <rect x="17" y="14" width="22" height="20" rx="10"/>
      </g>
      <text x="50" y="31" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="700" letter-spacing="2" fill="currentColor">CROSSLINK</text>
      <text x="50" y="44" font-family="Inter, system-ui, sans-serif" font-size="9" font-weight="500" letter-spacing="3" fill="currentColor" opacity="0.6">MOTORSPORTS</text>
    </svg>
  `;

  function navHTML(items, active) {
    return items.map((item) => {
      const isActive = item.key === active;
      const stubAttr = item.stub ? ` data-nav="${item.key}"` : '';
      const cls = isActive ? ' class="active"' : '';
      return `<a href="${item.href}"${cls}${stubAttr}><span class="ico">${item.ico}</span> ${item.label}</a>`;
    }).join('');
  }

  function sidebarHTML(active) {
    const user = (window.CROSSLINK && window.CROSSLINK.user) || { name: '', initials: '', role: '' };
    return `
      <a href="cars-list-d-final.html" class="brand" aria-label="Crosslink Motorsports">${BRAND_SVG}</a>
      <nav class="nav" aria-label="Primary">${navHTML(NAV_ITEMS.primary, active)}</nav>
      <div class="nav-section">Configure</div>
      <nav class="nav" aria-label="Configure">${navHTML(NAV_ITEMS.configure, active)}</nav>
      <div class="user-foot">
        <span class="avatar">${user.initials}</span>
        <div>
          <div class="who">${user.name}</div>
          <div class="role">${user.role}</div>
        </div>
      </div>
    `;
  }

  function mountSidebar() {
    const el = document.getElementById('sidebar');
    if (!el) return;
    if (!el.classList.contains('sidebar')) el.classList.add('sidebar');
    const active = el.dataset.active || '';
    el.innerHTML = sidebarHTML(active);

    // Stub nav items toast "coming next"
    el.querySelectorAll('.nav a[data-nav]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        RCH.toast(`${a.textContent.trim()} — coming next`);
      });
    });
  }

  function ensureToastEl() {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    } else if (!el.classList.contains('toast')) {
      el.classList.add('toast');
    }
    return el;
  }

  let toastTimer;
  function toast(msg) {
    const el = ensureToastEl();
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  window.RCH = { mountSidebar, toast };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountSidebar);
  } else {
    mountSidebar();
  }
})();

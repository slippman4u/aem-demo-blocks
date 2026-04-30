const DEFAULT_DATA_PATH = '/xray/xray-data.json';

const ADOBE_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 26" width="20" height="20">
  <path fill="#fa0f00" d="M19.5 0h10.5v26L19.5 0zM10.5 0H0v26L10.5 0zM15 9.6L21.9 26h-4.6l-2-5.2h-4.6L15 9.6z"/>
</svg>`;

const GEAR_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="3"/>
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
</svg>`;

const REFRESH_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="23 4 23 10 17 10"/>
  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
</svg>`;

const CHEVRON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="6 9 12 15 18 9"/>
</svg>`;

const TABS = ['Profile', 'Events', 'Offers', 'Architecture', 'Debug'];

let dataFetched = false;

function formatTimestamp(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? String(ts) : d.toLocaleString('en-US');
}

function createTriggerButton() {
  const btn = document.createElement('button');
  btn.className = 'xray-trigger';
  btn.setAttribute('aria-label', 'Open Real Time Customer Profile');
  btn.innerHTML = ADOBE_LOGO_SVG;
  return btn;
}

function createOverlay() {
  const el = document.createElement('div');
  el.className = 'xray-overlay';
  return el;
}

function createAccordion(title, contentHtml) {
  const section = document.createElement('div');
  section.className = 'xray-accordion expanded';

  const header = document.createElement('button');
  header.className = 'xray-accordion-header';
  header.innerHTML = `<span>${title}</span>${CHEVRON_SVG}`;
  header.addEventListener('click', () => section.classList.toggle('expanded'));

  const body = document.createElement('div');
  body.className = 'xray-accordion-body';
  body.innerHTML = contentHtml;

  section.appendChild(header);
  section.appendChild(body);
  return section;
}

function renderProfileTab(data) {
  const profile = {};
  (data.profile?.data || []).forEach(({ key, value }) => { profile[key] = value; });

  const identitiesHtml = `
    <div class="xray-identity-item">
      <div class="xray-identity-label">EXPERIENCE CLOUD ID</div>
      <div class="xray-identity-value xray-mono">${profile.ecid || '—'}</div>
    </div>
    <div class="xray-identity-item">
      <div class="xray-identity-label">EMAIL</div>
      <div class="xray-identity-value">${profile.email || '—'}</div>
    </div>`;

  const attrFields = [
    { key: 'name', label: 'NAME' },
    { key: 'gender', label: 'GENDER' },
    { key: 'birth-date', label: 'BIRTH DATE' },
    { key: 'address', label: 'ADDRESS' },
    { key: 'loyalty-level', label: 'LOYALTY LEVEL' },
    { key: 'loyalty-points', label: 'LOYALTY POINTS' },
  ];
  const attributesHtml = attrFields.map(({ key, label }) => `
    <div class="xray-attr-row">
      <div class="xray-attr-label">${label}</div>
      <div class="xray-attr-value">${profile[key] || '—'}</div>
    </div>`).join('');

  const audiencesHtml = (data.audiences?.data || []).map((row) => `
    <div class="xray-audience-item">
      <div class="xray-audience-meta">${formatTimestamp(row.timestamp)} (${(row.status || '').toUpperCase()})</div>
      <div class="xray-audience-name">${row.name || ''}</div>
    </div>`).join('') || '<div class="xray-empty">No audiences found.</div>';

  const panel = document.createElement('div');
  panel.className = 'xray-tab-panel active';
  panel.dataset.tab = 'profile';
  panel.appendChild(createAccordion('IDENTITIES', identitiesHtml));
  panel.appendChild(createAccordion('ATTRIBUTES', attributesHtml));
  panel.appendChild(createAccordion('AUDIENCES', audiencesHtml));
  panel.appendChild(createAccordion('UTILITIES', ''));
  return panel;
}

function renderEventsTab(data) {
  const panel = document.createElement('div');
  panel.className = 'xray-tab-panel';
  panel.dataset.tab = 'events';

  const timeline = document.createElement('div');
  timeline.className = 'xray-timeline';

  (data.events?.data || []).forEach((row) => {
    const item = document.createElement('div');
    item.className = 'xray-event-item';
    const timestamp = [row.date, row.time].filter(Boolean).join(', ');
    item.innerHTML = `
      <div class="xray-event-dot"></div>
      <div class="xray-event-body">
        <div class="xray-event-timestamp">${timestamp}</div>
        <div class="xray-event-data">${row.data || ''}</div>
        <div class="xray-event-type">${(row['event-type'] || '').toUpperCase()}</div>
      </div>`;
    timeline.appendChild(item);
  });

  if (!timeline.children.length) {
    timeline.innerHTML = '<div class="xray-empty">No events found.</div>';
  }

  panel.appendChild(timeline);
  return panel;
}

function renderEmptyTab(name) {
  const panel = document.createElement('div');
  panel.className = 'xray-tab-panel';
  panel.dataset.tab = name;
  return panel;
}

function buildContent(contentEl, data) {
  contentEl.innerHTML = '';
  contentEl.appendChild(renderProfileTab(data));
  contentEl.appendChild(renderEventsTab(data));
  ['offers', 'architecture', 'debug'].forEach((name) => contentEl.appendChild(renderEmptyTab(name)));
}

function createPanel() {
  const panel = document.createElement('div');
  panel.className = 'xray-panel';

  panel.innerHTML = `
    <div class="xray-header">
      <div class="xray-header-left">
        ${ADOBE_LOGO_SVG}
        <span class="xray-title">Real Time Customer Profile</span>
      </div>
      <div class="xray-header-right">
        <button class="xray-icon-btn xray-btn-settings" aria-label="Settings">${GEAR_ICON_SVG}</button>
        <button class="xray-icon-btn xray-btn-refresh" aria-label="Refresh">${REFRESH_ICON_SVG}</button>
        <button class="xray-icon-btn xray-btn-close" aria-label="Close">&#x00D7;</button>
      </div>
    </div>
    <div class="xray-tab-bar">
      ${TABS.map((t, i) => `<button class="xray-tab${i === 0 ? ' active' : ''}" data-tab="${t.toLowerCase()}">${t}</button>`).join('')}
    </div>
    <div class="xray-content"></div>`;

  return panel;
}

export default function decorate(block) {
  const authored = block.querySelector(':scope > div:nth-child(2) > div')?.textContent?.trim();
  const dataUrl = authored ? `/${authored.replace(/^\//, '')}` : DEFAULT_DATA_PATH;

  block.style.display = 'none';

  const trigger = createTriggerButton();
  const overlay = createOverlay();
  const panel = createPanel();

  document.body.appendChild(trigger);
  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  const contentEl = panel.querySelector('.xray-content');
  const tabBar = panel.querySelector('.xray-tab-bar');

  function showLoading() {
    contentEl.innerHTML = '<div class="xray-loading">Loading profile data…</div>';
  }

  function openPanel() {
    panel.classList.add('open');
    overlay.classList.add('visible');
    trigger.classList.add('active');

    if (!dataFetched) {
      dataFetched = true;
      showLoading();
      fetch(dataUrl)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((json) => {
          buildContent(contentEl, json);
          const activeTab = tabBar.querySelector('.xray-tab.active');
          if (activeTab) switchTab(activeTab.dataset.tab);
        })
        .catch(() => {
          dataFetched = false;
          contentEl.innerHTML = '<div class="xray-error">Failed to load profile data. Click refresh to retry.</div>';
        });
    }
  }

  function closePanel() {
    panel.classList.remove('open');
    overlay.classList.remove('visible');
    trigger.classList.remove('active');
  }

  function switchTab(tabName) {
    tabBar.querySelectorAll('.xray-tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tabName));
    contentEl.querySelectorAll('.xray-tab-panel').forEach((p) => p.classList.toggle('active', p.dataset.tab === tabName));
  }

  trigger.addEventListener('click', () => {
    if (panel.classList.contains('open')) {
      closePanel();
    } else {
      openPanel();
    }
  });

  overlay.addEventListener('click', closePanel);
  panel.querySelector('.xray-btn-close').addEventListener('click', closePanel);

  panel.querySelector('.xray-btn-refresh').addEventListener('click', () => {
    dataFetched = false;
    openPanel();
  });

  tabBar.addEventListener('click', (e) => {
    const tab = e.target.closest('.xray-tab');
    if (tab) switchTab(tab.dataset.tab);
  });
}

const colorTokens = {
  '--kobos-brand-default': '#111827',
  '--kobos-brand-hover': '#1f2937',
  '--kobos-brand-active': '#000000',
  '--kobos-text-primary': '#1a1d21',
  '--kobos-text-secondary': '#4a4d52',
  '--kobos-text-muted': '#7a7d85',
  '--kobos-text-disabled': '#b0b3bc',
  '--kobos-text-inverse': '#ffffff',
  '--kobos-bg-default': '#f8f7f5',
  '--kobos-bg-subtle': '#f0eee9',
  '--kobos-bg-elevated': '#ffffff',
  '--kobos-bg-inverse': '#1a1d21',
  '--kobos-surface-default': '#ffffff',
  '--kobos-surface-selected': '#ebf0f7',
  '--kobos-surface-disabled': '#f5f5f3',
  '--kobos-border-default': '#d4d0c8',
  '--kobos-border-subtle': '#e8e5df',
  '--kobos-border-strong': '#9e9a90'
};

const businessGroups = {
  'Success': {
    default: '--kobos-success-default',
    subtle: '--kobos-success-subtle',
    border: '--kobos-success-border'
  },
  'Warning': {
    default: '--kobos-warning-default',
    subtle: '--kobos-warning-subtle',
    border: '--kobos-warning-border'
  },
  'Danger': {
    default: '--kobos-danger-default',
    subtle: '--kobos-danger-subtle',
    border: '--kobos-danger-border'
  },
  'Info': {
    default: '--kobos-info-default',
    subtle: '--kobos-info-subtle',
    border: '--kobos-info-border'
  },
  'Neutral': {
    default: '--kobos-neutral-default',
    subtle: '--kobos-neutral-subtle',
    border: '--kobos-neutral-border'
  },
  'Neutral Strong': {
    default: '--kobos-neutral-strong-default',
    subtle: '--kobos-neutral-strong-subtle',
    border: '--kobos-neutral-strong-border'
  }
};

const typographyTokens = [
  { token: '--kobos-type-heading-md', caption: '600 28px/36px' },
  { token: '--kobos-type-heading-xs', caption: '600 16px/22px' },
  { token: '--kobos-type-card-title', caption: '600 18px/24px' },
  { token: '--kobos-type-body-semibold', caption: '600 14px/20px' },
  { token: '--kobos-type-body-small', caption: '400 13px/18px' },
  { token: '--kobos-type-body-small-semibold', caption: '600 13px/18px' },
  { token: '--kobos-type-caption', caption: '400 12px/16px' },
  { token: '--kobos-type-caption-xs', caption: '400 10px/14px' },
  { token: '--kobos-type-label-small', caption: '500 11px/16px' },
  { token: '--kobos-type-label-xs', caption: '600 10px/14px' },
  { token: '--kobos-type-badge-label', caption: '600 11px/16px' },
  { token: '--kobos-type-table-header', caption: '600 12px/16px' },
  { token: '--kobos-type-annotation', caption: '400 9px/12px' },
  { token: '--kobos-type-mono-value', caption: '500 13px/18px' }
];

const navItems = [
  { key: 'color-system', label: 'Color System' },
  { key: 'business-colors', label: 'Business Colors' },
  { key: 'typography', label: 'Typography' },
  { key: 'radius-elevation', label: 'Radius & Elevation' },
  { key: 'spacing', label: 'Spacing (coming soon)' }
];

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

function createColorCard(token) {
  const hex = colorTokens[token] || '#000000';
  const card = document.createElement('div');
  card.className = 'color-card';
  card.innerHTML = `
    <div class="swatch" style="background-color: var(${token});"></div>
    <div class="info">
      <div class="token-name">${token}</div>
      <div class="hex">${hex}</div>
    </div>
  `;
  card.addEventListener('click', () => {
    navigator.clipboard.writeText(token).then(() => {
      showToast('Copied ' + token);
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = token;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Copied ' + token);
    });
  });
  return card;
}

function renderColorSystem(container) {
  container.innerHTML = '<h1>Color System</h1>';
  const groups = {
    'Brand': ['--kobos-brand-default', '--kobos-brand-hover', '--kobos-brand-active'],
    'Text': ['--kobos-text-primary', '--kobos-text-secondary', '--kobos-text-muted', '--kobos-text-disabled', '--kobos-text-inverse'],
    'Background': ['--kobos-bg-default', '--kobos-bg-subtle', '--kobos-bg-elevated', '--kobos-bg-inverse'],
    'Surface': ['--kobos-surface-default', '--kobos-surface-selected', '--kobos-surface-disabled'],
    'Border': ['--kobos-border-default', '--kobos-border-subtle', '--kobos-border-strong']
  };
  Object.entries(groups).forEach(([groupName, tokens]) => {
    const section = document.createElement('section');
    const h2 = document.createElement('h2');
    h2.textContent = groupName;
    section.appendChild(h2);
    const grid = document.createElement('div');
    grid.className = 'color-grid';
    tokens.forEach(token => {
      const card = createColorCard(token);
      grid.appendChild(card);
    });
    section.appendChild(grid);
    container.appendChild(section);
  });
}

function renderBusinessColors(container) {
  container.innerHTML = '<h1>Business Colors</h1>';
  Object.entries(businessGroups).forEach(([name, vars]) => {
    const group = document.createElement('div');
    group.className = 'business-group';
    const h2 = document.createElement('h2');
    h2.textContent = name;
    group.appendChild(h2);
    const swatchRow = document.createElement('div');
    swatchRow.className = 'swatches-row';
    const labels = ['Default', 'Subtle', 'Border'];
    const keys = ['default', 'subtle', 'border'];
    keys.forEach((key, i) => {
      const token = vars[key];
      const wrapper = document.createElement('div');
      wrapper.className = 'swatch-wrapper';
      const sw = document.createElement('div');
      sw.className = 'swatch-small';
      sw.style.backgroundColor = `var(${token})`;
      wrapper.appendChild(sw);
      const label = document.createElement('div');
      label.className = 'swatch-label';
      label.textContent = labels[i];
      wrapper.appendChild(label);
      swatchRow.appendChild(wrapper);
    });
    group.appendChild(swatchRow);
    const badgeWrap = document.createElement('div');
    badgeWrap.style.marginTop = '8px';
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.style.backgroundColor = `var(${vars.subtle})`;
    badge.style.color = `var(${vars.default})`;
    badge.style.border = `1px solid var(${vars.border})`;
    badge.textContent = name;
    badgeWrap.appendChild(badge);
    group.appendChild(badgeWrap);
    container.appendChild(group);
  });
}

function renderTypography(container) {
  container.innerHTML = '<h1>Typography</h1>';
  typographyTokens.forEach(({token, caption}) => {
    const row = document.createElement('div');
    row.className = 'typography-row';
    const specimen = document.createElement('div');
    specimen.className = 'specimen';
    specimen.textContent = 'Kitchen Outfitters — 1 000 orders';
    specimen.style.font = `var(${token})`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `${token}<br>${caption}`;
    row.appendChild(specimen);
    row.appendChild(meta);
    container.appendChild(row);
  });
}

function renderRadiusElevation(container) {
  container.innerHTML = '<h1>Radius & Elevation</h1>';
  const note = document.createElement('p');
  note.style.color = 'var(--kobos-text-muted)';
  note.style.font = 'var(--kobos-type-caption)';
  note.textContent = 'Note: Radius tokens are not yet exposed in the design tokens.';
  container.appendChild(note);
  const elevations = [
    '--kobos-elevation-card',
    '--kobos-elevation-dropdown',
    '--kobos-elevation-modal',
    '--kobos-elevation-sticky-header'
  ];
  const grid = document.createElement('div');
  grid.className = 'elevation-grid';
  elevations.forEach(elev => {
    const card = document.createElement('div');
    card.className = 'elevation-card';
    card.style.boxShadow = `var(${elev})`;
    card.innerHTML = `<div>${elev}</div>`;
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

function renderSpacing(container) {
  container.innerHTML = '<h1>Spacing</h1><p style="color: var(--kobos-text-muted);">Coming soon</p>';
}

const renderers = {
  'color-system': renderColorSystem,
  'business-colors': renderBusinessColors,
  'typography': renderTypography,
  'radius-elevation': renderRadiusElevation,
  'spacing': renderSpacing
};

function updateActiveNav(pageKey) {
  const links = document.querySelectorAll('.sidebar nav a');
  links.forEach(link => {
    const linkPage = link.getAttribute('data-page');
    link.classList.toggle('active', linkPage === pageKey);
  });
}

function syncMobileSelect(pageKey) {
  const select = document.getElementById('nav-select');
  if (select) {
    select.value = pageKey;
  }
}

function renderPage() {
  const hash = window.location.hash || '#/color-system';
  const pageKey = hash.replace('#/', '');
  const container = document.getElementById('main-content');
  if (!container) return;
  container.innerHTML = '';
  const renderer = renderers[pageKey];
  if (renderer) {
    renderer(container);
  } else {
    container.innerHTML = '<h1>Page not found</h1>';
  }
  updateActiveNav(pageKey);
  syncMobileSelect(pageKey);
}

function setupMobileNav() {
  const select = document.getElementById('nav-select');
  if (!select) return;
  select.innerHTML = '';
  navItems.forEach(item => {
    const option = document.createElement('option');
    option.value = item.key;
    option.textContent = item.label;
    select.appendChild(option);
  });
  select.addEventListener('change', (e) => {
    window.location.hash = '#/' + e.target.value;
  });
}

function init() {
  setupMobileNav();
  if (!window.location.hash) {
    history.replaceState(null, '', '#/color-system');
  }
  renderPage();
  window.addEventListener('hashchange', renderPage);
}

init();

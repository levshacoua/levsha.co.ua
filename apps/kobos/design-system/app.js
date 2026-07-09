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
  { token: '--kobos-type-display-page-title', caption: '400 32px/40px Krona One' },
  { token: '--kobos-type-heading-md', caption: '600 28px/36px Inter' },
  { token: '--kobos-type-section-title', caption: '600 24px/32px Inter' },
  { token: '--kobos-type-card-title', caption: '600 18px/24px Inter' },
  { token: '--kobos-type-heading-xs', caption: '600 16px/22px Inter' },
  { token: '--kobos-type-body-large', caption: '400 16px/22px Inter' },
  { token: '--kobos-type-body-semibold', caption: '600 14px/20px Inter' },
  { token: '--kobos-type-body-medium', caption: '500 14px/20px Inter' },
  { token: '--kobos-type-body-regular', caption: '400 14px/20px Inter' },
  { token: '--kobos-type-numeric-accounting', caption: '500 14px/20px Inter' },
  { token: '--kobos-type-body-small-semibold', caption: '600 13px/18px Inter' },
  { token: '--kobos-type-body-small-medium', caption: '500 13px/18px Inter' },
  { token: '--kobos-type-body-small', caption: '400 13px/18px Inter' },
  { token: '--kobos-type-mono-value', caption: '500 13px/18px IBM Plex Mono' },
  { token: '--kobos-type-caption', caption: '400 12px/16px Inter' },
  { token: '--kobos-type-table-header', caption: '600 12px/16px Inter' },
  { token: '--kobos-type-label-small', caption: '500 11px/16px Inter' },
  { token: '--kobos-type-badge-label', caption: '600 11px/16px Inter' },
  { token: '--kobos-type-caption-xs', caption: '400 10px/14px IBM Plex Mono' },
  { token: '--kobos-type-label-xs', caption: '600 10px/14px Inter' },
  { token: '--kobos-type-annotation', caption: '400 9px/12px Inter' }
];

const spacingTokens = [
  { token: '--kobos-space-1', value: '4px', usage: 'icon gap, compact badge padding, tight table cells' },
  { token: '--kobos-space-2', value: '8px', usage: 'small gaps, compact controls, badge horizontal padding' },
  { token: '--kobos-space-3', value: '12px', usage: 'form field gaps, compact card spacing' },
  { token: '--kobos-space-4', value: '16px', usage: 'default component padding, card inner padding, form sections' },
  { token: '--kobos-space-5', value: '20px', usage: 'medium layout spacing' },
  { token: '--kobos-space-6', value: '24px', usage: 'section spacing, dashboard card gaps' },
  { token: '--kobos-space-8', value: '32px', usage: 'large section spacing' },
  { token: '--kobos-space-10', value: '40px', usage: 'page-level spacing' },
  { token: '--kobos-space-12', value: '48px', usage: 'major page sections and layout separation' }
];

const navItems = [
  { key: 'color-system', label: 'Color System' },
  { key: 'business-colors', label: 'Business Colors' },
  { key: 'typography', label: 'Typography' },
  { key: 'radius-elevation', label: 'Radius & Elevation' },
  { key: 'spacing', label: 'Spacing' }
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

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied ' + text);
  }).catch(() => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('Copied ' + text);
  });
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
    copyToClipboard(token);
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
    if (token === '--kobos-type-numeric-accounting') {
      specimen.textContent = 'Kitchen Outfitters — 1 000 orders ($2,481.50)';
    } else {
      specimen.textContent = 'Kitchen Outfitters — 1 000 orders';
    }
    specimen.style.font = `var(${token})`;
    if (token === '--kobos-type-display-page-title') {
      specimen.style.letterSpacing = '-0.02em';
    } else if (token === '--kobos-type-table-header') {
      specimen.style.letterSpacing = '0.04em';
    }
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

  // RADIUS section
  const radiusH2 = document.createElement('h2');
  radiusH2.textContent = 'Radius';
  container.appendChild(radiusH2);

  const radiusData = [
    { doc: 'radius/small-control', css: '--kobos-radius-small-control', value: '6px', usage: 'inputs, buttons, selects, filters' },
    { doc: 'radius/card', css: '--kobos-radius-card', value: '12px', usage: 'dashboard cards, order cards, table containers' },
    { doc: 'radius/modal', css: '--kobos-radius-modal', value: '16px', usage: 'modals, dialogs, large panels' },
    { doc: 'radius/pill', css: '--kobos-radius-pill', value: '999px', usage: 'badges, status pills, tags, chips' }
  ];

  const radiusGrid = document.createElement('div');
  radiusGrid.className = 'radius-grid';

  radiusData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'radius-card';

    const sample = document.createElement('div');
    sample.className = 'radius-sample';
    sample.style.borderRadius = `var(${item.css})`;
    if (item.doc === 'radius/pill') {
      sample.style.width = '100px';
      sample.style.height = '28px';
    } else {
      sample.style.width = '60px';
      sample.style.height = '60px';
    }
    card.appendChild(sample);

    const info = document.createElement('div');
    info.className = 'radius-info';

    const docName = document.createElement('div');
    docName.className = 'doc-name';
    docName.textContent = item.doc;

    const usage = document.createElement('div');
    usage.className = 'usage';
    usage.textContent = item.usage;

    const px = document.createElement('div');
    px.className = 'px-value';
    px.textContent = item.value;

    info.appendChild(docName);
    info.appendChild(usage);
    info.appendChild(px);
    card.appendChild(info);

    card.addEventListener('click', () => copyToClipboard(item.css));
    radiusGrid.appendChild(card);
  });

  container.appendChild(radiusGrid);

  // ELEVATION section
  const elevH2 = document.createElement('h2');
  elevH2.textContent = 'Elevation';
  container.appendChild(elevH2);

  const elevData = [
    { doc: 'elevation/none', css: '--kobos-elevation-none', usage: 'Flat surfaces, table rows, base layout', spec: 'No shadow' },
    { doc: 'elevation/card', css: '--kobos-elevation-card', usage: 'dashboard cards, summary panels', spec: '0/1/3/0 · 0.08' },
    { doc: 'elevation/dropdown', css: '--kobos-elevation-dropdown', usage: 'dropdown menus, popovers', spec: '0/8/24/-4 · 0.16' },
    { doc: 'elevation/modal', css: '--kobos-elevation-modal', usage: 'modals, dialogs, overlays', spec: '0/20/48/-12 · 0.24' },
    { doc: 'elevation/sticky-header', css: '--kobos-elevation-sticky-header', usage: 'sticky headers, fixed top bars', spec: '0/1/0/0 · 0.10' }
  ];

  const elevGrid = document.createElement('div');
  elevGrid.className = 'elevation-grid';

  elevData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'elevation-card';
    if (item.css === '--kobos-elevation-none') {
      card.style.boxShadow = 'none';
    } else {
      card.style.boxShadow = `var(${item.css})`;
    }

    const content = document.createElement('div');
    content.innerHTML = `
      <div class="elev-doc">${item.doc}</div>
      <div class="elev-usage">${item.usage}</div>
      <div class="elev-spec">${item.spec}</div>
    `;
    card.appendChild(content);

    card.addEventListener('click', () => copyToClipboard(item.css));
    elevGrid.appendChild(card);
  });

  container.appendChild(elevGrid);
}

function renderSpacing(container) {
  container.innerHTML = '<h1>Spacing</h1>';
  const table = document.createElement('div');
  table.className = 'spacing-table';
  spacingTokens.forEach(({token, value, usage}) => {
    const row = document.createElement('div');
    row.className = 'spacing-row';

    const name = document.createElement('div');
    name.className = 'spacing-name';
    name.textContent = token;

    const val = document.createElement('div');
    val.className = 'spacing-value';
    val.textContent = value;

    const bar = document.createElement('div');
    bar.className = 'spacing-bar';
    const px = parseInt(value, 10);
    bar.style.width = (px * 10) + 'px';

    const use = document.createElement('div');
    use.className = 'spacing-usage';
    use.textContent = usage;

    row.appendChild(name);
    row.appendChild(val);
    row.appendChild(bar);
    row.appendChild(use);
    table.appendChild(row);
  });
  container.appendChild(table);
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

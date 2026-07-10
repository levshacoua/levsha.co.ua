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
  { key: 'spacing', label: 'Spacing' },
  { key: 'buttons', label: 'Buttons' },
  { key: 'inputs', label: 'Inputs' },
  { key: 'select', label: 'Select & Dropdown' },
  { key: 'checkbox', label: 'Checkbox, Radio & Switch' },
  { key: 'badges', label: 'Badges & Chips' },
  { key: 'cards', label: 'Cards' }
];

function getColorDocName(token) {
  let name = token.replace('--kobos-', '');
  if (name.startsWith('bg-')) {
    name = 'background/' + name.slice(3);
  } else if (name.startsWith('neutral-strong-')) {
    name = 'neutral-strong/' + name.slice(14);
  } else {
    const idx = name.indexOf('-');
    if (idx !== -1) {
      name = name.slice(0, idx) + '/' + name.slice(idx + 1);
    }
  }
  return name;
}

function getTypographyDocName(token) {
  return token.replace('--kobos-type-', 'typography/');
}

function getSpacingDocName(token) {
  return token.replace('--kobos-space-', 'space/space-');
}

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

const copyIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;

const validIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`;

const warningIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;

const errorIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 15 6-6"/></svg>`;

const searchIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;

const chevronDownSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

const checkboxCheckSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>`;

function createCopyButton(cssVar) {
  const btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.innerHTML = copyIconSVG;
  btn.setAttribute('aria-label', 'Copy CSS variable');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    copyToClipboard(cssVar);
  });
  return btn;
}

function getItemName(docPath) {
  if (!docPath) return '';
  const lastSegment = docPath.split('/').pop();
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
}

function createColorCard(token) {
  const hex = colorTokens[token] || '#000000';
  const docName = getColorDocName(token);
  const displayName = getItemName(docName);
  const card = document.createElement('div');
  card.className = 'color-card';
  card.innerHTML = `
    <div class="swatch" style="background-color: var(${token});"></div>
    <div class="info">
      <div class="doc-name">${displayName}</div>
      <div class="hex">${hex}</div>
    </div>
  `;
  const copyBtn = createCopyButton(token);
  card.appendChild(copyBtn);
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
    const keys = ['default', 'subtle', 'border'];
    keys.forEach((key) => {
      const token = vars[key];
      const wrapper = document.createElement('div');
      wrapper.className = 'swatch-wrapper';
      const swatchWithCopy = document.createElement('div');
      swatchWithCopy.className = 'swatch-with-copy';
      const sw = document.createElement('div');
      sw.className = 'swatch-small';
      sw.style.backgroundColor = `var(${token})`;
      swatchWithCopy.appendChild(sw);
      const copyBtn = createCopyButton(token);
      swatchWithCopy.appendChild(copyBtn);
      wrapper.appendChild(swatchWithCopy);
      const docName = getColorDocName(token);
      const displayName = getItemName(docName);
      const label = document.createElement('div');
      label.className = 'swatch-label';
      label.textContent = displayName;
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
    const docName = getTypographyDocName(token);
    const displayName = getItemName(docName);
    meta.innerHTML = `${displayName}<br><span class="mono-caption">${caption}</span>`;
    const rightCol = document.createElement('div');
    rightCol.style.display = 'flex';
    rightCol.style.alignItems = 'center';
    rightCol.style.gap = '8px';
    rightCol.appendChild(meta);
    const copyBtn = createCopyButton(token);
    rightCol.appendChild(copyBtn);
    row.appendChild(specimen);
    row.appendChild(rightCol);
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

    const info = document.createElement('div');
    info.className = 'radius-info';

    const displayName = getItemName(item.doc);
    const docName = document.createElement('div');
    docName.className = 'doc-name';
    docName.textContent = displayName;

    const usage = document.createElement('div');
    usage.className = 'usage';
    usage.textContent = item.usage;

    const px = document.createElement('div');
    px.className = 'px-value';
    px.textContent = item.value;

    info.appendChild(docName);
    info.appendChild(usage);
    info.appendChild(px);

    const content = document.createElement('div');
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.alignItems = 'center';
    content.style.flex = '1';
    content.appendChild(sample);
    content.appendChild(info);
    card.appendChild(content);

    const copyBtn = createCopyButton(item.css);
    card.appendChild(copyBtn);

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
    content.style.flex = '1';
    content.style.textAlign = 'center';
    const displayName = getItemName(item.doc);
    content.innerHTML = `
      <div class="elev-doc">${displayName}</div>
      <div class="elev-usage">${item.usage}</div>
      <div class="elev-spec">${item.spec}</div>
    `;
    card.appendChild(content);

    const copyBtn = createCopyButton(item.css);
    card.appendChild(copyBtn);
    elevGrid.appendChild(card);
  });

  container.appendChild(elevGrid);
}

function renderSpacing(container) {
  container.innerHTML = '<h1>Spacing</h1>'
    + '<p class="page-subtitle">9 tokens on a 4px base grid — padding, gap, margin, and Auto Layout spacing. '
    + 'Visual scale: 1&nbsp;px&nbsp;=&nbsp;10&nbsp;px.</p>';
  const table = document.createElement('div');
  table.className = 'spacing-table';
  spacingTokens.forEach(({token, value, usage}) => {
    const row = document.createElement('div');
    row.className = 'spacing-row';

    const docName = getSpacingDocName(token);
    const displayName = getItemName(docName);

    const nameCol = document.createElement('div');
    nameCol.className = 'spacing-name';
    const docDiv = document.createElement('div');
    docDiv.className = 'doc-name';
    docDiv.textContent = displayName;
    nameCol.appendChild(docDiv);

    const val = document.createElement('div');
    val.className = 'spacing-value';
    val.textContent = value;

    const barTrack = document.createElement('div');
    barTrack.className = 'spacing-bar-track';
    const bar = document.createElement('div');
    bar.className = 'spacing-bar';
    const px = parseInt(value, 10);
    const barWidth = Math.min(px * 10, 480);
    bar.style.width = barWidth + 'px';
    barTrack.appendChild(bar);

    const use = document.createElement('div');
    use.className = 'spacing-usage';
    use.textContent = usage;

    row.appendChild(nameCol);
    row.appendChild(val);
    row.appendChild(barTrack);
    row.appendChild(use);

    const copyBtn = createCopyButton(token);
    row.appendChild(copyBtn);
    table.appendChild(row);
  });
  container.appendChild(table);
}

function renderButtons(container) {
  container.innerHTML = '<h1>Buttons</h1>';

  // 1. Variants
  const variantsH2 = document.createElement('h2');
  variantsH2.textContent = 'Variants';
  container.appendChild(variantsH2);

  const variantsContainer = document.createElement('div');
  variantsContainer.className = 'button-variants';

  const variants = [
    { name: 'Primary', modifier: 'primary', copyClass: 'kobos-btn kobos-btn--primary' },
    { name: 'Secondary', modifier: 'secondary', copyClass: 'kobos-btn kobos-btn--secondary' },
    { name: 'Tertiary', modifier: 'tertiary', copyClass: 'kobos-btn kobos-btn--tertiary' },
    { name: 'Destructive', modifier: 'destructive', copyClass: 'kobos-btn kobos-btn--destructive' },
    { name: 'Success', modifier: 'success', copyClass: 'kobos-btn kobos-btn--success' },
    { name: 'Warning', modifier: 'warning', copyClass: 'kobos-btn kobos-btn--warning' },
    { name: 'Link', modifier: 'link', copyClass: 'kobos-btn kobos-btn--link' }
  ];

  variants.forEach(v => {
    const card = document.createElement('div');
    card.className = 'button-card';

    const btn = document.createElement('button');
    btn.className = `kobos-btn kobos-btn--${v.modifier}`;
    btn.textContent = v.name;
    card.appendChild(btn);

    const caption = document.createElement('div');
    caption.className = 'button-caption';
    caption.textContent = v.name;
    card.appendChild(caption);

    const copyBtn = createCopyButton(v.copyClass);
    card.appendChild(copyBtn);

    variantsContainer.appendChild(card);
  });

  container.appendChild(variantsContainer);

  // 2. Sizes
  const sizesH2 = document.createElement('h2');
  sizesH2.textContent = 'Sizes';
  container.appendChild(sizesH2);

  const sizesContainer = document.createElement('div');
  sizesContainer.className = 'button-sizes';

  const sizes = [
    { label: 'XS — 28px', sizeClass: 'kobos-btn--xs' },
    { label: 'SM — 32px', sizeClass: 'kobos-btn--sm' },
    { label: 'MD — 40px', sizeClass: '' },
    { label: 'LG — 44px', sizeClass: 'kobos-btn--lg' }
  ];

  sizes.forEach(s => {
    const card = document.createElement('div');
    card.className = 'button-card';

    const btn = document.createElement('button');
    btn.className = `kobos-btn kobos-btn--primary ${s.sizeClass}`.trim();
    btn.textContent = s.label.split(' — ')[0];
    card.appendChild(btn);

    const caption = document.createElement('div');
    caption.className = 'button-caption';
    caption.textContent = s.label;
    card.appendChild(caption);

    sizesContainer.appendChild(card);
  });

  container.appendChild(sizesContainer);

  // 3. States
  const statesH2 = document.createElement('h2');
  statesH2.textContent = 'States';
  container.appendChild(statesH2);

  const statesContainer = document.createElement('div');
  statesContainer.className = 'button-states';

  const states = [
    { label: 'Default', extra: '' },
    { label: 'Hover', extra: 'is-hover' },
    { label: 'Active', extra: 'is-active' },
    { label: 'Disabled', extra: '', disabled: true },
    { label: 'Loading', extra: '', loading: true }
  ];

  states.forEach(st => {
    const card = document.createElement('div');
    card.className = 'button-card';

    const btn = document.createElement('button');
    btn.className = `kobos-btn kobos-btn--primary ${st.extra}`.trim();

    if (st.disabled) {
      btn.disabled = true;
      btn.textContent = 'Disabled';
    } else if (st.loading) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span> Loading…`;
    } else {
      btn.textContent = st.label;
    }

    card.appendChild(btn);

    const caption = document.createElement('div');
    caption.className = 'button-caption';
    caption.textContent = st.label;
    card.appendChild(caption);

    statesContainer.appendChild(card);
  });

  container.appendChild(statesContainer);

  // 4. Icon buttons
  const iconH2 = document.createElement('h2');
  iconH2.textContent = 'Icon buttons';
  container.appendChild(iconH2);

  const iconContainer = document.createElement('div');
  iconContainer.className = 'button-icons';

  const iconExamples = [
    { label: 'Default', extra: '' },
    { label: 'Ghost', extra: 'kobos-icon-btn--ghost' },
    { label: 'Hover', extra: 'is-hover' },
    { label: 'Disabled', extra: '', disabled: true }
  ];

  iconExamples.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'button-card';

    const btn = document.createElement('button');
    let btnClass = 'kobos-icon-btn';
    if (ex.extra === 'kobos-icon-btn--ghost') {
      btnClass = 'kobos-icon-btn kobos-icon-btn--ghost';
    } else if (ex.extra === 'is-hover') {
      btnClass = 'kobos-icon-btn is-hover';
    }
    btn.className = btnClass;

    if (ex.disabled) {
      btn.disabled = true;
    }

    btn.innerHTML = copyIconSVG;
    card.appendChild(btn);

    const caption = document.createElement('div');
    caption.className = 'button-caption';
    caption.textContent = ex.label;
    card.appendChild(caption);

    iconContainer.appendChild(card);
  });

  container.appendChild(iconContainer);

  // 5. Business examples
  const businessH2 = document.createElement('h2');
  businessH2.textContent = 'Business examples';
  container.appendChild(businessH2);

  const businessGrid = document.createElement('div');
  businessGrid.className = 'business-examples';

  const examples = [
    { text: 'Create Quote', variant: 'Primary MD', classes: 'kobos-btn kobos-btn--primary' },
    { text: 'Convert to Order', variant: 'Success MD', classes: 'kobos-btn kobos-btn--success' },
    { text: 'Send Invoice', variant: 'Primary MD', classes: 'kobos-btn kobos-btn--primary' },
    { text: 'Mark Paid', variant: 'Success MD', classes: 'kobos-btn kobos-btn--success' },
    { text: 'Release to Production', variant: 'Primary MD', classes: 'kobos-btn kobos-btn--primary' },
    { text: 'Complete Task', variant: 'Success MD', classes: 'kobos-btn kobos-btn--success' },
    { text: 'Approve Invoice Cost', variant: 'Success MD', classes: 'kobos-btn kobos-btn--success' },
    { text: 'Unlock Cost', variant: 'Warning SM', classes: 'kobos-btn kobos-btn--warning kobos-btn--sm' },
    { text: 'Request Review', variant: 'Warning MD', classes: 'kobos-btn kobos-btn--warning' },
    { text: 'Generate PDF', variant: 'Secondary MD', classes: 'kobos-btn kobos-btn--secondary' },
    { text: 'Cancel Order', variant: 'Destructive MD', classes: 'kobos-btn kobos-btn--destructive' }
  ];

  examples.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'business-example';

    const label = document.createElement('div');
    label.className = 'example-label';
    label.textContent = ex.text;
    card.appendChild(label);

    const btn = document.createElement('button');
    btn.className = ex.classes;
    btn.textContent = ex.text;
    card.appendChild(btn);

    const variant = document.createElement('div');
    variant.className = 'example-variant';
    variant.textContent = ex.variant;
    card.appendChild(variant);

    businessGrid.appendChild(card);
  });

  container.appendChild(businessGrid);
}

function renderInputs(container) {
  container.innerHTML = '<h1>Inputs</h1>';

  // 1. Input types
  const h2_1 = document.createElement('h2');
  h2_1.textContent = 'Input types';
  const copy1 = createCopyButton('.kobos-input');
  h2_1.appendChild(copy1);
  container.appendChild(h2_1);

  const grid1 = document.createElement('div');
  grid1.className = 'input-grid';

  const inputTypes = [
    { label: 'Text', value: 'David Miller' },
    { label: 'Number', value: '48', suffix: 'pcs' },
    { label: 'Currency', prefix: '$', value: '1,248.50' },
    { label: 'Percentage', value: '7.5', suffix: '%' },
    { label: 'Dimension', value: '24 1/2', suffix: 'in' },
    { label: 'SKU', value: 'M-DO-S-225-F-S-U', mono: true },
    { label: 'Email', value: 'cust@acme.com', validIcon: true },
    { label: 'Phone', value: '(662) 555-0142' },
    { label: 'Search', placeholder: 'Search orders...', searchIcon: true },
    { label: 'Password', value: 'password', type: 'password' },
    { label: 'URL', value: 'https://shopify.com/orders' }
  ];

  inputTypes.forEach(item => {
    const tile = document.createElement('div');
    tile.className = 'input-tile';

    const wrap = document.createElement('div');
    wrap.className = 'kobos-input';
    if (item.mono) wrap.classList.add('kobos-input--mono');

    if (item.prefix) {
      const affix = document.createElement('span');
      affix.className = 'kobos-input__affix';
      affix.textContent = item.prefix;
      wrap.appendChild(affix);
    }

    if (item.searchIcon) {
      const icon = document.createElement('span');
      icon.className = 'kobos-input__icon';
      icon.innerHTML = searchIconSVG;
      icon.style.color = 'var(--kobos-text-muted)';
      wrap.appendChild(icon);
    }

    const inp = document.createElement('input');
    inp.type = item.type || 'text';
    if (item.value) inp.value = item.value;
    if (item.placeholder) inp.placeholder = item.placeholder;
    wrap.appendChild(inp);

    if (item.suffix) {
      const affix = document.createElement('span');
      affix.className = 'kobos-input__affix kobos-input__affix--suffix';
      affix.textContent = item.suffix;
      wrap.appendChild(affix);
    }

    if (item.validIcon) {
      const icon = document.createElement('span');
      icon.className = 'kobos-input__icon';
      icon.innerHTML = validIconSVG;
      icon.style.color = 'var(--kobos-success-default)';
      wrap.appendChild(icon);
    }

    tile.appendChild(wrap);

    const lbl = document.createElement('div');
    lbl.className = 'input-label';
    lbl.textContent = item.label;
    tile.appendChild(lbl);

    grid1.appendChild(tile);
  });

  container.appendChild(grid1);

  // 2. States
  const h2_2 = document.createElement('h2');
  h2_2.textContent = 'States';
  const copy2 = createCopyButton('.kobos-input');
  h2_2.appendChild(copy2);
  container.appendChild(h2_2);

  const grid2 = document.createElement('div');
  grid2.className = 'input-grid';

  const stateItems = [
    { label: 'Empty', placeholder: 'Enter value' },
    { label: 'Hover', value: 'Hover state', hover: true },
    { label: 'Focus', value: 'Focus state', focus: true, helper: 'focus: info/default 2px border' },
    { label: 'Error', value: 'bad@', error: true, icon: errorIconSVG, iconColor: 'var(--kobos-danger-default)', helper: 'Invalid email format', helperClass: 'is-error' },
    { label: 'Warning', value: '48 1/4', warning: true, icon: warningIconSVG, iconColor: 'var(--kobos-warning-default)', helper: 'Unusual dimension — verify', helperClass: 'is-warning' },
    { label: 'Valid', value: 'cust@email.com', valid: true, icon: validIconSVG, iconColor: 'var(--kobos-success-default)', helper: 'Email verified', helperClass: 'is-valid' },
    { label: 'Disabled', value: 'Unavailable', disabled: true },
    { label: 'Read-only', value: 'KO-SO-000124', readonly: true, helper: 'Read-only — system value' }
  ];

  stateItems.forEach(item => {
    const tile = document.createElement('div');
    tile.className = 'input-tile';

    const wrap = document.createElement('div');
    wrap.className = 'kobos-input';
    if (item.hover) wrap.classList.add('is-hover');
    if (item.focus) wrap.classList.add('is-focus');
    if (item.error) wrap.classList.add('is-error');
    if (item.warning) wrap.classList.add('is-warning');
    if (item.valid) wrap.classList.add('is-valid');

    if (item.disabled) {
      wrap.classList.add('is-disabled');
      const inp = document.createElement('input');
      inp.value = item.value;
      inp.disabled = true;
      wrap.appendChild(inp);
    } else if (item.readonly) {
      wrap.classList.add('is-readonly');
      const inp = document.createElement('input');
      inp.value = item.value;
      inp.readOnly = true;
      wrap.appendChild(inp);
    } else {
      const inp = document.createElement('input');
      if (item.value) inp.value = item.value;
      if (item.placeholder) inp.placeholder = item.placeholder;
      wrap.appendChild(inp);
    }

    if (item.icon) {
      const icon = document.createElement('span');
      icon.className = 'kobos-input__icon';
      icon.innerHTML = item.icon;
      icon.style.color = item.iconColor;
      wrap.appendChild(icon);
    }

    tile.appendChild(wrap);

    if (item.helper) {
      const helper = document.createElement('div');
      helper.className = 'kobos-input-helper';
      if (item.helperClass) helper.classList.add(item.helperClass);
      helper.textContent = item.helper;
      tile.appendChild(helper);
    }

    const lbl = document.createElement('div');
    lbl.className = 'input-label';
    lbl.textContent = item.label;
    tile.appendChild(lbl);

    grid2.appendChild(tile);
  });

  container.appendChild(grid2);

  // 3. Currency / Percentage / Dimension — business row
  const h2_3 = document.createElement('h2');
  h2_3.textContent = 'Currency / Percentage / Dimension';
  const copy3 = createCopyButton('.kobos-input');
  h2_3.appendChild(copy3);
  container.appendChild(h2_3);

  const grid3 = document.createElement('div');
  grid3.className = 'input-grid';

  const bizItems = [
    { label: 'Unit Price', prefix: '$', value: '1,248.50' },
    { label: 'Cost', prefix: '$', value: '482.16' },
    { label: 'Discount', value: '10', suffix: '%' },
    { label: 'Coverage', value: '42', suffix: '%', warning: true, icon: warningIconSVG, iconColor: 'var(--kobos-warning-default)', helper: 'Below 60% — review', helperClass: 'is-warning' },
    { label: 'Width', value: '24 1/2', suffix: 'in', valid: true, icon: validIconSVG, iconColor: 'var(--kobos-success-default)' },
    { label: 'Height', value: '34 1/2', suffix: 'in', valid: true, icon: validIconSVG, iconColor: 'var(--kobos-success-default)' },
    { label: 'Depth', value: '24', suffix: 'in' },
    { label: 'Dimension Error', value: 'abc', suffix: 'in', error: true, icon: errorIconSVG, iconColor: 'var(--kobos-danger-default)', helper: 'Use: 24, 24.5, or 24 1/2', helperClass: 'is-error' }
  ];

  bizItems.forEach(item => {
    const tile = document.createElement('div');
    tile.className = 'input-tile';

    const wrap = document.createElement('div');
    wrap.className = 'kobos-input';
    if (item.error) wrap.classList.add('is-error');
    if (item.warning) wrap.classList.add('is-warning');
    if (item.valid) wrap.classList.add('is-valid');

    if (item.prefix) {
      const affix = document.createElement('span');
      affix.className = 'kobos-input__affix';
      affix.textContent = item.prefix;
      wrap.appendChild(affix);
    }

    const inp = document.createElement('input');
    inp.value = item.value;
    wrap.appendChild(inp);

    if (item.suffix) {
      const affix = document.createElement('span');
      affix.className = 'kobos-input__affix kobos-input__affix--suffix';
      affix.textContent = item.suffix;
      wrap.appendChild(affix);
    }

    if (item.icon) {
      const icon = document.createElement('span');
      icon.className = 'kobos-input__icon';
      icon.innerHTML = item.icon;
      icon.style.color = item.iconColor;
      wrap.appendChild(icon);
    }

    tile.appendChild(wrap);

    if (item.helper) {
      const helper = document.createElement('div');
      helper.className = 'kobos-input-helper';
      if (item.helperClass) helper.classList.add(item.helperClass);
      helper.textContent = item.helper;
      tile.appendChild(helper);
    }

    const lbl = document.createElement('div');
    lbl.className = 'input-label';
    lbl.textContent = item.label;
    tile.appendChild(lbl);

    grid3.appendChild(tile);
  });

  container.appendChild(grid3);

  // 4. SKU validation lifecycle
  const h2_4 = document.createElement('h2');
  h2_4.textContent = 'SKU validation lifecycle';
  const copy4 = createCopyButton('.kobos-input');
  h2_4.appendChild(copy4);
  container.appendChild(h2_4);

  const grid4 = document.createElement('div');
  grid4.className = 'input-grid';

  const skuItems = [
    { label: 'SKU Code', value: 'M-DO-S-225-F-S-U', mono: true },
    { label: 'SKU Code', value: 'Checking...', mono: true, helper: 'Checking SKU availability...' },
    { label: 'SKU Code', value: 'M-DO-S-225-F-S-U', mono: true, warning: true, helper: 'Possible duplicate SKU', helperClass: 'is-warning' },
    { label: 'SKU Code', value: 'INVALID!!', mono: true, error: true, helper: 'Invalid SKU format', helperClass: 'is-error' },
    { label: 'SKU Code', value: 'B-PP-23.5-32-22', mono: true, valid: true, helper: 'SKU validated ✓', helperClass: 'is-valid' }
  ];

  skuItems.forEach(item => {
    const tile = document.createElement('div');
    tile.className = 'input-tile';

    const wrap = document.createElement('div');
    wrap.className = 'kobos-input kobos-input--mono';
    if (item.error) wrap.classList.add('is-error');
    if (item.warning) wrap.classList.add('is-warning');
    if (item.valid) wrap.classList.add('is-valid');

    const inp = document.createElement('input');
    inp.value = item.value;
    wrap.appendChild(inp);

    tile.appendChild(wrap);

    if (item.helper) {
      const helper = document.createElement('div');
      helper.className = 'kobos-input-helper';
      if (item.helperClass) helper.classList.add(item.helperClass);
      helper.textContent = item.helper;
      tile.appendChild(helper);
    }

    const lbl = document.createElement('div');
    lbl.className = 'input-label';
    lbl.textContent = item.label;
    tile.appendChild(lbl);

    grid4.appendChild(tile);
  });

  container.appendChild(grid4);

  // 5. Dimension pairs
  const h2_5 = document.createElement('h2');
  h2_5.textContent = 'Dimension pairs';
  const copy5 = createCopyButton('.kobos-input');
  h2_5.appendChild(copy5);
  container.appendChild(h2_5);

  // valid pair
  const pair1 = document.createElement('div');
  pair1.className = 'dimension-pair';
  const w1 = document.createElement('div');
  w1.className = 'kobos-input';
  const i1 = document.createElement('input');
  i1.value = '24 1/2';
  w1.appendChild(i1);
  const a1 = document.createElement('span');
  a1.className = 'kobos-input__affix kobos-input__affix--suffix';
  a1.textContent = 'in';
  w1.appendChild(a1);
  pair1.appendChild(w1);
  const x1 = document.createElement('span');
  x1.textContent = '×';
  x1.style.color = 'var(--kobos-text-muted)';
  pair1.appendChild(x1);
  const h1 = document.createElement('div');
  h1.className = 'kobos-input';
  const i2 = document.createElement('input');
  i2.value = '35';
  h1.appendChild(i2);
  const a2 = document.createElement('span');
  a2.className = 'kobos-input__affix kobos-input__affix--suffix';
  a2.textContent = 'in';
  h1.appendChild(a2);
  pair1.appendChild(h1);
  container.appendChild(pair1);
  const cap1 = document.createElement('div');
  cap1.className = 'pair-caption';
  cap1.textContent = 'Door size valid';
  container.appendChild(cap1);

  // invalid
  const pair2 = document.createElement('div');
  pair2.className = 'dimension-pair';
  const w2 = document.createElement('div');
  w2.className = 'kobos-input is-error';
  const i3 = document.createElement('input');
  i3.value = 'abc';
  w2.appendChild(i3);
  const a3 = document.createElement('span');
  a3.className = 'kobos-input__affix kobos-input__affix--suffix';
  a3.textContent = 'in';
  w2.appendChild(a3);
  pair2.appendChild(w2);
  const x2 = document.createElement('span');
  x2.textContent = '×';
  x2.style.color = 'var(--kobos-text-muted)';
  pair2.appendChild(x2);
  const h2 = document.createElement('div');
  h2.className = 'kobos-input is-error';
  const i4 = document.createElement('input');
  i4.value = '35';
  h2.appendChild(i4);
  const a4 = document.createElement('span');
  a4.className = 'kobos-input__affix kobos-input__affix--suffix';
  a4.textContent = 'in';
  h2.appendChild(a4);
  pair2.appendChild(h2);
  container.appendChild(pair2);
  const cap2 = document.createElement('div');
  cap2.className = 'kobos-input-helper is-error';
  cap2.textContent = 'Use: 24, 24.5, or 24 1/2';
  container.appendChild(cap2);

  // oversized
  const pair3 = document.createElement('div');
  pair3.className = 'dimension-pair';
  const w3 = document.createElement('div');
  w3.className = 'kobos-input';
  const i5 = document.createElement('input');
  i5.value = '72';
  w3.appendChild(i5);
  const a5 = document.createElement('span');
  a5.className = 'kobos-input__affix kobos-input__affix--suffix';
  a5.textContent = 'in';
  w3.appendChild(a5);
  pair3.appendChild(w3);
  const x3 = document.createElement('span');
  x3.textContent = '×';
  x3.style.color = 'var(--kobos-text-muted)';
  pair3.appendChild(x3);
  const h3 = document.createElement('div');
  h3.className = 'kobos-input';
  const i6 = document.createElement('input');
  i6.value = '48';
  h3.appendChild(i6);
  const a6 = document.createElement('span');
  a6.className = 'kobos-input__affix kobos-input__affix--suffix';
  a6.textContent = 'in';
  h3.appendChild(a6);
  pair3.appendChild(h3);
  container.appendChild(pair3);
  const cap3 = document.createElement('div');
  cap3.className = 'kobos-input-helper';
  cap3.textContent = 'Exceeds max — manual review';
  container.appendChild(cap3);

  // fractional previews
  const frac = document.createElement('div');
  frac.style.marginTop = '16px';
  frac.innerHTML = `
    <div class="pair-caption">29 1/2" = 29.5"</div>
    <div class="pair-caption">28 11/16" = 28.6875"</div>
    <div class="pair-caption">24 1/4" = 24.25"</div>
  `;
  container.appendChild(frac);

  // 6. Dense admin form
  const h2_6 = document.createElement('h2');
  h2_6.textContent = 'Dense admin form';
  const copy6 = createCopyButton('.kobos-input');
  h2_6.appendChild(copy6);
  container.appendChild(h2_6);

  const card = document.createElement('div');
  card.className = 'quote-card';

  const title = document.createElement('h3');
  title.textContent = 'Quote Item Entry';
  card.appendChild(title);

  const sub = document.createElement('div');
  sub.className = 'subtitle';
  sub.textContent = 'Anderson Cabinets · Quote #QT-0048';
  card.appendChild(sub);

  const formGrid = document.createElement('div');
  formGrid.className = 'form-grid';

  // Row 1 fields
  const fieldsRow1 = [
    { label: 'Customer*', value: 'David Miller' },
    { label: 'SKU Code*', value: 'M-DO-S-225-F-S-U', mono: true, warning: true, icon: warningIconSVG, iconColor: 'var(--kobos-warning-default)', helper: 'Possible duplicate' },
    { label: 'Description', value: 'Wall Cabinet 30"' },
    { label: 'Search Material', placeholder: 'Search materials...', searchIcon: true }
  ];

  fieldsRow1.forEach(f => {
    const field = document.createElement('div');
    const fl = document.createElement('div');
    fl.className = 'field-label';
    fl.textContent = f.label;
    field.appendChild(fl);

    const wrap = document.createElement('div');
    wrap.className = 'kobos-input';
    if (f.mono) wrap.classList.add('kobos-input--mono');
    if (f.warning) wrap.classList.add('is-warning');

    if (f.searchIcon) {
      const icon = document.createElement('span');
      icon.className = 'kobos-input__icon';
      icon.innerHTML = searchIconSVG;
      icon.style.color = 'var(--kobos-text-muted)';
      wrap.appendChild(icon);
    }

    const inp = document.createElement('input');
    if (f.value) inp.value = f.value;
    if (f.placeholder) inp.placeholder = f.placeholder;
    wrap.appendChild(inp);

    if (f.icon) {
      const icon = document.createElement('span');
      icon.className = 'kobos-input__icon';
      icon.innerHTML = f.icon;
      icon.style.color = f.iconColor;
      wrap.appendChild(icon);
    }

    field.appendChild(wrap);

    if (f.helper) {
      const helper = document.createElement('div');
      helper.className = 'kobos-input-helper is-warning';
      helper.textContent = f.helper;
      field.appendChild(helper);
    }

    formGrid.appendChild(field);
  });

  // Row 2 fields
  const fieldsRow2 = [
    { label: 'Width*', value: '30', suffix: 'in', valid: true, icon: validIconSVG, iconColor: 'var(--kobos-success-default)' },
    { label: 'Height*', value: '34 1/2', suffix: 'in', valid: true, icon: validIconSVG, iconColor: 'var(--kobos-success-default)' },
    { label: 'Depth', value: '24', suffix: 'in' },
    { label: 'Quantity', value: '2', suffix: 'pcs' },
    { label: 'Unit Price*', prefix: '$', value: '482.16' },
    { label: 'Discount', value: '10', suffix: '%' },
    { label: 'Cost Coverage', value: '42', suffix: '%', warning: true, icon: warningIconSVG, iconColor: 'var(--kobos-warning-default)', helper: 'Below 60%' }
  ];

  fieldsRow2.forEach(f => {
    const field = document.createElement('div');
    const fl = document.createElement('div');
    fl.className = 'field-label';
    fl.textContent = f.label;
    field.appendChild(fl);

    const wrap = document.createElement('div');
    wrap.className = 'kobos-input';
    if (f.warning) wrap.classList.add('is-warning');
    if (f.valid) wrap.classList.add('is-valid');

    if (f.prefix) {
      const affix = document.createElement('span');
      affix.className = 'kobos-input__affix';
      affix.textContent = f.prefix;
      wrap.appendChild(affix);
    }

    const inp = document.createElement('input');
    inp.value = f.value;
    wrap.appendChild(inp);

    if (f.suffix) {
      const affix = document.createElement('span');
      affix.className = 'kobos-input__affix kobos-input__affix--suffix';
      affix.textContent = f.suffix;
      wrap.appendChild(affix);
    }

    if (f.icon) {
      const icon = document.createElement('span');
      icon.className = 'kobos-input__icon';
      icon.innerHTML = f.icon;
      icon.style.color = f.iconColor;
      wrap.appendChild(icon);
    }

    field.appendChild(wrap);

    if (f.helper) {
      const helper = document.createElement('div');
      helper.className = 'kobos-input-helper is-warning';
      helper.textContent = f.helper;
      field.appendChild(helper);
    }

    formGrid.appendChild(field);
  });

  card.appendChild(formGrid);
  container.appendChild(card);
}

function createSectionHeading(title, copyText) {
  const h2 = document.createElement('h2');
  h2.textContent = title;
  const copyBtn = createCopyButton(copyText);
  h2.appendChild(copyBtn);
  return h2;
}

function renderSelect(container) {
  container.innerHTML = '<h1>Select & Dropdown</h1>';

  // 1. Select states
  container.appendChild(createSectionHeading('Select states', '.kobos-select'));

  const statesGrid = document.createElement('div');
  statesGrid.className = 'input-grid';

  function createSelectDemo(caption, value, extraClasses = '', showMenu = false, menuOptions = null, isPlaceholder = false) {
    const tile = document.createElement('div');
    tile.className = 'input-tile';

    const select = document.createElement('div');
    select.className = `kobos-select ${extraClasses}`.trim();

    const valueEl = document.createElement('span');
    valueEl.className = 'kobos-select__value';
    if (isPlaceholder) {
      valueEl.textContent = value;
      valueEl.style.color = 'var(--kobos-text-muted)';
    } else {
      valueEl.textContent = value;
    }
    select.appendChild(valueEl);

    const chevron = document.createElement('span');
    chevron.className = 'kobos-select__chevron';
    chevron.innerHTML = chevronDownSVG;
    select.appendChild(chevron);

    tile.appendChild(select);

    if (showMenu && menuOptions) {
      const menu = document.createElement('div');
      menu.className = 'kobos-menu';
      menuOptions.forEach(opt => {
        const option = document.createElement('div');
        let optClass = 'kobos-option';
        if (opt.selected) optClass += ' is-selected';
        if (opt.disabled) optClass += ' is-disabled';
        if (opt.warning) optClass += ' is-warning';
        option.className = optClass;

        if (opt.selected) {
          const check = document.createElement('span');
          check.innerHTML = validIconSVG;
          check.style.color = 'var(--kobos-info-default)';
          check.style.flexShrink = '0';
          check.style.width = '16px';
          check.style.height = '16px';
          option.appendChild(check);
        }

        const col = document.createElement('div');
        const labelEl = document.createElement('div');
        labelEl.className = 'kobos-option__label';
        labelEl.textContent = opt.label;
        col.appendChild(labelEl);

        const capEl = document.createElement('div');
        capEl.className = 'kobos-option__caption';
        capEl.textContent = opt.caption;
        col.appendChild(capEl);

        option.appendChild(col);
        menu.appendChild(option);
      });
      tile.appendChild(menu);
    }

    const lbl = document.createElement('div');
    lbl.className = 'input-label';
    lbl.textContent = caption;
    tile.appendChild(lbl);

    return tile;
  }

  // Closed
  statesGrid.appendChild(createSelectDemo('Closed', 'Select material…', '', false, null, true));

  // Filled
  statesGrid.appendChild(createSelectDemo('Filled', 'Maple paint grade'));

  // Open
  const openOptions = [
    { label: 'Poplar', caption: '$2.20/ft²' },
    { label: 'Knotty pine', caption: '$1.95/ft²' },
    { label: 'Maple paint grade', caption: '$2.50/ft²', selected: true },
    { label: 'Cherry', caption: '$4.45/ft²' },
    { label: 'Black Walnut', caption: '$10.65/ft²' }
  ];
  statesGrid.appendChild(createSelectDemo('Open', 'Maple paint grade', 'is-open', true, openOptions));

  // Hover
  statesGrid.appendChild(createSelectDemo('Hover', 'Maple paint grade', 'is-hover'));

  // Disabled
  statesGrid.appendChild(createSelectDemo('Disabled', 'Maple paint grade', 'is-disabled'));

  // Error
  const errorTile = createSelectDemo('Error', 'Maple paint grade', 'is-error');
  const errorHelper = document.createElement('div');
  errorHelper.className = 'kobos-input-helper is-error';
  errorHelper.textContent = 'Material is required';
  errorTile.appendChild(errorHelper);
  statesGrid.appendChild(errorTile);

  // Warning
  const warnTile = createSelectDemo('Warning', 'Maple paint grade', 'is-warning');
  const warnHelper = document.createElement('div');
  warnHelper.className = 'kobos-input-helper is-warning';
  warnHelper.textContent = 'Price updated — verify';
  warnTile.appendChild(warnHelper);
  statesGrid.appendChild(warnTile);

  container.appendChild(statesGrid);

  // 2. Option states
  container.appendChild(createSectionHeading('Option states', '.kobos-option'));

  const optionMenu = document.createElement('div');
  optionMenu.className = 'kobos-menu';

  const optionDemos = [
    { label: 'Red Oak', caption: '$3.50/ft²' },
    { label: 'Maple paint grade', caption: '$2.50/ft²', hover: true },
    { label: 'Maple paint grade', caption: '$2.50/ft²', selected: true },
    { label: 'Hickory', caption: 'price pending', disabled: true },
    { label: 'Zebrawood', caption: '$22.25/ft² — rarewood', warning: true }
  ];

  optionDemos.forEach(item => {
    const opt = document.createElement('div');
    let cls = 'kobos-option';
    if (item.hover) cls += ' is-hover';
    if (item.selected) cls += ' is-selected';
    if (item.disabled) cls += ' is-disabled';
    if (item.warning) cls += ' is-warning';
    opt.className = cls;

    if (item.selected) {
      const check = document.createElement('span');
      check.innerHTML = validIconSVG;
      check.style.color = 'var(--kobos-info-default)';
      check.style.flexShrink = '0';
      check.style.width = '16px';
      check.style.height = '16px';
      opt.appendChild(check);
    }

    const col = document.createElement('div');
    const labelEl = document.createElement('div');
    labelEl.className = 'kobos-option__label';
    labelEl.textContent = item.label;
    col.appendChild(labelEl);

    const capEl = document.createElement('div');
    capEl.className = 'kobos-option__caption';
    capEl.textContent = item.caption;
    col.appendChild(capEl);

    opt.appendChild(col);
    optionMenu.appendChild(opt);
  });

  container.appendChild(optionMenu);

  // 3. Working dropdown demo
  container.appendChild(createSectionHeading('Working dropdown demo', '.kobos-select'));

  const interactiveTile = document.createElement('div');
  interactiveTile.className = 'input-tile';

  const selectWrapper = document.createElement('div');
  selectWrapper.className = 'kobos-select';

  const valueSpan = document.createElement('span');
  valueSpan.className = 'kobos-select__value';
  valueSpan.textContent = 'New';
  selectWrapper.appendChild(valueSpan);

  const chev = document.createElement('span');
  chev.className = 'kobos-select__chevron';
  chev.innerHTML = chevronDownSVG;
  selectWrapper.appendChild(chev);

  interactiveTile.appendChild(selectWrapper);

  const interactiveMenu = document.createElement('div');
  interactiveMenu.className = 'kobos-menu';
  interactiveMenu.style.display = 'none';

  const statusOptions = ['New', 'Paid', 'In Production', 'QC', 'Ready to Ship', 'Completed'];
  statusOptions.forEach(status => {
    const opt = document.createElement('div');
    opt.className = 'kobos-option';
    const lbl = document.createElement('div');
    lbl.className = 'kobos-option__label';
    lbl.textContent = status;
    opt.appendChild(lbl);

    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      valueSpan.textContent = status;
      interactiveMenu.style.display = 'none';
      selectWrapper.classList.remove('is-open');
      showToast('Selected: ' + status);
    });

    interactiveMenu.appendChild(opt);
  });

  interactiveTile.appendChild(interactiveMenu);

  selectWrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = interactiveMenu.style.display === 'block';
    if (isOpen) {
      interactiveMenu.style.display = 'none';
      selectWrapper.classList.remove('is-open');
    } else {
      interactiveMenu.style.display = 'block';
      selectWrapper.classList.add('is-open');
    }
  });

  // Click outside handler
  const outsideClickHandler = (e) => {
    if (!interactiveTile.contains(e.target)) {
      interactiveMenu.style.display = 'none';
      selectWrapper.classList.remove('is-open');
    }
  };
  document.addEventListener('click', outsideClickHandler);

  const intLabel = document.createElement('div');
  intLabel.className = 'input-label';
  intLabel.textContent = 'Order status';
  interactiveTile.appendChild(intLabel);

  container.appendChild(interactiveTile);

  // 4. Business examples
  container.appendChild(createSectionHeading('Business examples', '.kobos-select'));

  const bizRow = document.createElement('div');
  bizRow.style.display = 'flex';
  bizRow.style.gap = '16px';
  bizRow.style.flexWrap = 'wrap';

  const bizExamples = [
    { label: 'Status: In Production', value: 'In Production' },
    { label: 'Dealer: Anderson Cabinets', value: 'Anderson Cabinets' },
    { label: 'Material: Maple paint grade', value: 'Maple paint grade' }
  ];

  bizExamples.forEach(ex => {
    const tile = document.createElement('div');
    tile.style.flex = '1';
    tile.style.minWidth = '200px';

    const sel = document.createElement('div');
    sel.className = 'kobos-select';

    const val = document.createElement('span');
    val.className = 'kobos-select__value';
    val.textContent = ex.value;
    sel.appendChild(val);

    const ch = document.createElement('span');
    ch.className = 'kobos-select__chevron';
    ch.innerHTML = chevronDownSVG;
    sel.appendChild(ch);

    tile.appendChild(sel);

    const cap = document.createElement('div');
    cap.className = 'input-label';
    cap.textContent = ex.label;
    tile.appendChild(cap);

    bizRow.appendChild(tile);
  });

  container.appendChild(bizRow);
}

function renderBadges(container) {
  container.innerHTML = '<h1>Badges &amp; Chips</h1>';

  const styles = ['neutral', 'info', 'success', 'warning', 'error', 'brand'];
  const styleLabels = {
    neutral: 'Neutral',
    info: 'Info',
    success: 'Success',
    warning: 'Warning',
    error: 'Error',
    brand: 'Brand'
  };

  // 1. Core Badge
  container.appendChild(createSectionHeading('Core Badge', '.kobos-badge'));

  const sizeRows = [
    { label: 'XS', className: 'kobos-badge--xs' },
    { label: 'SM (default)', className: '' },
    { label: 'MD', className: 'kobos-badge--md' }
  ];

  sizeRows.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.style.marginBottom = '12px';

    const label = document.createElement('div');
    label.style.font = 'var(--kobos-type-caption)';
    label.style.color = 'var(--kobos-text-muted)';
    label.style.marginBottom = '4px';
    label.textContent = row.label;
    rowDiv.appendChild(label);

    const badgesDiv = document.createElement('div');
    badgesDiv.style.display = 'flex';
    badgesDiv.style.gap = '8px';
    badgesDiv.style.flexWrap = 'wrap';

    styles.forEach(s => {
      const b = document.createElement('span');
      b.className = `kobos-badge kobos-badge--${s} ${row.className}`.trim();
      b.textContent = styleLabels[s];
      badgesDiv.appendChild(b);
    });

    rowDiv.appendChild(badgesDiv);
    container.appendChild(rowDiv);
  });

  // 2. Status badges
  container.appendChild(createSectionHeading('Status badges', '.kobos-badge'));

  const statusList = [
    {label: 'Draft', style: 'neutral'},
    {label: 'New', style: 'info'},
    {label: 'Sent', style: 'info'},
    {label: 'Approved', style: 'success'},
    {label: 'In-Production', style: 'info'},
    {label: 'QC', style: 'warning'},
    {label: 'Ready-to-Ship', style: 'success'},
    {label: 'Completed', style: 'success'},
    {label: 'Paid', style: 'success'},
    {label: 'Partial', style: 'warning'},
    {label: 'Unpaid', style: 'error'},
    {label: 'Pending', style: 'warning'},
    {label: 'Refunded', style: 'neutral'},
    {label: 'Canceled', style: 'neutral'},
    {label: 'On-Hold', style: 'warning'},
    {label: 'Failed', style: 'error'},
    {label: 'Needs-Review', style: 'warning'},
    {label: 'Locked', style: 'brand'},
    {label: 'Parsed', style: 'info'},
    {label: 'Stripe-Verified', style: 'success'},
    {label: 'Stripe-Failed', style: 'error'}
  ];

  const statusRow = document.createElement('div');
  statusRow.style.display = 'flex';
  statusRow.style.flexWrap = 'wrap';
  statusRow.style.gap = '6px';
  statusList.forEach(item => {
    const b = document.createElement('span');
    b.className = `kobos-badge kobos-badge--${item.style}`;
    b.textContent = item.label;
    statusRow.appendChild(b);
  });
  container.appendChild(statusRow);

  // 3. Priority
  container.appendChild(createSectionHeading('Priority', '.kobos-badge'));

  const priorityList = [
    {label: 'Low', style: 'neutral'},
    {label: 'Normal', style: 'info'},
    {label: 'High', style: 'warning'},
    {label: 'Urgent', style: 'error'},
    {label: 'Rush', style: 'error'},
    {label: 'Overdue', style: 'error'}
  ];

  const prioRow = document.createElement('div');
  prioRow.style.display = 'flex';
  prioRow.style.gap = '6px';
  prioRow.style.flexWrap = 'wrap';
  priorityList.forEach(item => {
    const b = document.createElement('span');
    b.className = `kobos-badge kobos-badge--${item.style}`;
    b.textContent = item.label;
    prioRow.appendChild(b);
  });
  container.appendChild(prioRow);

  // 4. Roles
  container.appendChild(createSectionHeading('Roles', '.kobos-badge'));

  const rolesList = [
    {label: 'Admin', style: 'brand'},
    {label: 'Manager', style: 'info'},
    {label: 'Sales', style: 'success'},
    {label: 'Production', style: 'warning'},
    {label: 'Dealer', style: 'neutral'},
    {label: 'Customer', style: 'neutral'},
    {label: 'Viewer', style: 'neutral'}
  ];

  const rolesRow = document.createElement('div');
  rolesRow.style.display = 'flex';
  rolesRow.style.gap = '6px';
  rolesRow.style.flexWrap = 'wrap';
  rolesList.forEach(item => {
    const b = document.createElement('span');
    b.className = `kobos-badge kobos-badge--${item.style}`;
    b.textContent = item.label;
    rolesRow.appendChild(b);
  });
  container.appendChild(rolesRow);

  // 5. Permissions
  container.appendChild(createSectionHeading('Permissions', '.kobos-badge'));

  const permList = [
    {label: 'View-Only', style: 'neutral'},
    {label: 'Can-Edit', style: 'info'},
    {label: 'Can-Approve', style: 'success'},
    {label: 'Admin-Only', style: 'brand'},
    {label: 'No-Access', style: 'error'},
    {label: 'Locked', style: 'warning'}
  ];

  const permRow = document.createElement('div');
  permRow.style.display = 'flex';
  permRow.style.gap = '6px';
  permRow.style.flexWrap = 'wrap';
  permList.forEach(item => {
    const b = document.createElement('span');
    b.className = `kobos-badge kobos-badge--${item.style}`;
    b.textContent = item.label;
    permRow.appendChild(b);
  });
  container.appendChild(permRow);

  // 6. Sources
  container.appendChild(createSectionHeading('Sources', '.kobos-badge'));

  const sourcesList = [
    {label: 'Trello', style: 'info'},
    {label: 'Shopify', style: 'success'},
    {label: 'Stripe', style: 'brand'},
    {label: 'Gmail', style: 'error'},
    {label: 'PDF', style: 'warning'},
    {label: 'CSV', style: 'neutral'},
    {label: 'Manual', style: 'neutral'},
    {label: 'Automation', style: 'info'}
  ];

  const srcRow = document.createElement('div');
  srcRow.style.display = 'flex';
  srcRow.style.gap = '6px';
  srcRow.style.flexWrap = 'wrap';
  sourcesList.forEach(item => {
    const b = document.createElement('span');
    b.className = `kobos-badge kobos-badge--${item.style}`;
    b.textContent = item.label;
    srcRow.appendChild(b);
  });
  container.appendChild(srcRow);

  // 7. Cost Source (Cost Engine)
  container.appendChild(createSectionHeading('Cost Source (Cost Engine)', '.kobos-badge'));

  const costList = [
    {label: 'Engine-Estimate', style: 'info'},
    {label: 'Manual-Override', style: 'warning'},
    {label: 'Vendor-Invoice', style: 'success'},
    {label: 'Estimated', style: 'neutral'},
    {label: 'Actual', style: 'success'},
    {label: 'Unknown', style: 'neutral'},
    {label: 'Needs-Review', style: 'warning'},
    {label: 'Locked', style: 'brand'}
  ];

  const costRow = document.createElement('div');
  costRow.style.display = 'flex';
  costRow.style.gap = '6px';
  costRow.style.flexWrap = 'wrap';
  costList.forEach(item => {
    const b = document.createElement('span');
    b.className = `kobos-badge kobos-badge--${item.style}`;
    b.textContent = item.label;
    costRow.appendChild(b);
  });
  container.appendChild(costRow);

  // 8. Tag chips
  container.appendChild(createSectionHeading('Tag chips', '.kobos-chip'));

  const tagChips = ['Rush', 'Reorder', 'Warranty', 'Claim', 'Custom', 'Oversized', 'Paint-Match', 'Dealer-Job', 'Manual-Review'];
  const tagRow = document.createElement('div');
  tagRow.style.display = 'flex';
  tagRow.style.flexWrap = 'wrap';
  tagRow.style.gap = '6px';
  tagChips.forEach(text => {
    const chip = document.createElement('span');
    chip.className = 'kobos-chip';
    chip.textContent = text;
    tagRow.appendChild(chip);
  });
  container.appendChild(tagRow);

  // 9. Filter chips
  container.appendChild(createSectionHeading('Filter chips', '.kobos-chip'));

  const filterChips = [
    {text: 'Status: In Production', active: true},
    {text: 'Payment: Unpaid', active: false},
    {text: 'Dealer: Anderson', active: true},
    {text: 'Source: Gmail', active: true},
    {text: 'Date: 30 Days', active: false},
    {text: 'Department: CNC', active: true},
    {text: 'Cost: Needs Review', active: true}
  ];

  const filterRow = document.createElement('div');
  filterRow.style.display = 'flex';
  filterRow.style.flexWrap = 'wrap';
  filterRow.style.gap = '6px';
  filterChips.forEach(item => {
    const chip = document.createElement('span');
    chip.className = 'kobos-chip' + (item.active ? ' is-active' : '');
    chip.textContent = item.text;
    filterRow.appendChild(chip);
  });
  container.appendChild(filterRow);

  // 10. Removable chips
  container.appendChild(createSectionHeading('Removable chips', '.kobos-chip'));

  const removableContainer = document.createElement('div');
  removableContainer.style.display = 'flex';
  removableContainer.style.flexWrap = 'wrap';
  removableContainer.style.gap = '6px';

  const removableItems = [
    {text: 'Oversized', removable: true},
    {text: 'Rush', removable: true},
    {text: 'Paint-Match', removable: true},
    {text: 'Disabled', removable: false, disabled: true},
    {text: 'Locked', removable: false, locked: true}
  ];

  removableItems.forEach(item => {
    const chip = document.createElement('span');
    chip.className = 'kobos-chip' + (item.disabled ? ' is-disabled' : '');
    chip.textContent = item.text;

    if (item.removable) {
      const xBtn = document.createElement('button');
      xBtn.className = 'kobos-chip__x';
      xBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
      xBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        chip.remove();
        showToast('Removed');
      });
      chip.appendChild(xBtn);
    } else if (item.locked) {
      const lock = document.createElement('span');
      lock.style.marginRight = '4px';
      lock.style.fontSize = '10px';
      lock.textContent = '🔒';
      chip.insertBefore(lock, chip.firstChild);
    }

    removableContainer.appendChild(chip);
  });

  container.appendChild(removableContainer);

  // 11. Key caps
  container.appendChild(createSectionHeading('Key caps', '.kobos-keycap'));

  const keyRow = document.createElement('div');
  keyRow.style.display = 'flex';
  keyRow.style.gap = '8px';
  keyRow.style.alignItems = 'center';
  keyRow.style.flexWrap = 'wrap';

  const singleKeys = ['⌘', 'K', '/', 'Esc', '↵'];
  singleKeys.forEach(k => {
    const kc = document.createElement('span');
    kc.className = 'kobos-keycap';
    kc.textContent = k;
    keyRow.appendChild(kc);
  });

  const shift = document.createElement('span');
  shift.className = 'kobos-keycap';
  shift.textContent = 'Shift';
  shift.style.padding = '0 12px';
  keyRow.appendChild(shift);

  container.appendChild(keyRow);

  const combo = document.createElement('div');
  combo.style.marginTop = '8px';
  combo.style.font = 'var(--kobos-type-caption)';
  combo.style.color = 'var(--kobos-text-muted)';
  combo.textContent = '⌘ + K opens Command Palette';
  container.appendChild(combo);

  // 12. Business examples
  container.appendChild(createSectionHeading('Business examples', '.kobos-badge'));

  const bizContainer = document.createElement('div');
  bizContainer.style.font = 'var(--kobos-type-body-small)';
  bizContainer.style.lineHeight = '1.6';

  const bizExamples = [
    'KO-SO-000124 · <span class="kobos-badge kobos-badge--success">Paid</span> <span class="kobos-badge kobos-badge--info">In-Production</span> <span class="kobos-chip">Rush</span> · Stripe',
    'KO-SO-000125 · <span class="kobos-badge kobos-badge--warning">Partial</span> <span class="kobos-badge kobos-badge--neutral">On-Hold</span> <span class="kobos-chip">Oversized</span> · Manual',
    'KO-SO-000126 · <span class="kobos-badge kobos-badge--success">Completed</span> <span class="kobos-badge kobos-badge--success">Paid</span> <span class="kobos-chip">Warranty</span> · Shopify'
  ];

  bizExamples.forEach(ex => {
    const row = document.createElement('div');
    row.style.marginBottom = '6px';
    row.innerHTML = ex;
    bizContainer.appendChild(row);
  });

  container.appendChild(bizContainer);
}

function renderCards(container) {
  container.innerHTML = '<h1>Cards</h1>';

  // 1. Card anatomy
  container.appendChild(createSectionHeading('Card anatomy', '.kobos-card'));
  const anatomy = document.createElement('div');
  anatomy.style.font = 'var(--kobos-type-caption)';
  anatomy.style.color = 'var(--kobos-text-muted)';
  anatomy.style.marginBottom = '24px';
  anatomy.innerHTML = `
    <ol style="margin-left: 20px; padding-left: 0; line-height: 1.7;">
      <li>Leading icon/avatar (optional)</li>
      <li>Status badge</li>
      <li>Title</li>
      <li>Subtitle/entity ID</li>
      <li>Metadata rows (2–4)</li>
      <li>Divider</li>
      <li>Action row</li>
      <li>KPI value+trend (KPI only)</li>
      <li>Warning/error message</li>
      <li>Locked/read-only indicator</li>
    </ol>
  `;
  container.appendChild(anatomy);

  // 2. Basic Card
  container.appendChild(createSectionHeading('Basic Card', '.kobos-card'));

  // Default
  const basicDefault = document.createElement('div');
  basicDefault.className = 'kobos-card';
  basicDefault.style.maxWidth = '320px';
  basicDefault.style.marginBottom = '16px';
  basicDefault.innerHTML = `
    <div class="kobos-card__title">Order Summary</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Orders</span><span class="kobos-card__meta-value">284</span></div>
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Revenue</span><span class="kobos-card__meta-value">$48,210</span></div>
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Pending</span><span class="kobos-card__meta-value">9</span></div>
    </div>
  `;
  container.appendChild(basicDefault);

  // Hover
  const basicHover = basicDefault.cloneNode(true);
  basicHover.classList.add('is-hover');
  container.appendChild(basicHover);

  // Selected
  const basicSelected = basicDefault.cloneNode(true);
  basicSelected.classList.add('is-selected');
  container.appendChild(basicSelected);

  // Disabled (short)
  const basicDisabled = document.createElement('div');
  basicDisabled.className = 'kobos-card is-disabled';
  basicDisabled.style.maxWidth = '320px';
  basicDisabled.style.marginBottom = '16px';
  basicDisabled.innerHTML = `
    <div class="kobos-card__title">Order Summary</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Orders</span><span class="kobos-card__meta-value">284</span></div>
    </div>
  `;
  container.appendChild(basicDisabled);

  // Loading
  const basicLoading = document.createElement('div');
  basicLoading.className = 'kobos-card';
  basicLoading.style.maxWidth = '320px';
  basicLoading.style.marginBottom = '16px';
  const sk1 = document.createElement('div');
  sk1.className = 'kobos-skeleton';
  sk1.style.width = '60%';
  const sk2 = document.createElement('div');
  sk2.className = 'kobos-skeleton';
  sk2.style.width = '90%';
  const sk3 = document.createElement('div');
  sk3.className = 'kobos-skeleton';
  sk3.style.width = '75%';
  basicLoading.appendChild(sk1);
  basicLoading.appendChild(sk2);
  basicLoading.appendChild(sk3);
  container.appendChild(basicLoading);

  // 3. KPI Card
  container.appendChild(createSectionHeading('KPI Card', '.kobos-card'));

  // Default KPI
  const kpiDefault = document.createElement('div');
  kpiDefault.className = 'kobos-card';
  kpiDefault.style.maxWidth = '280px';
  kpiDefault.style.marginBottom = '16px';
  kpiDefault.innerHTML = `
    <div style="font: var(--kobos-type-caption); color: var(--kobos-text-muted); margin-bottom: 4px;">ORDERS THIS MONTH</div>
    <div class="kobos-card__kpi-value">284</div>
    <div class="kobos-card__kpi-trend">+12 this week</div>
  `;
  container.appendChild(kpiDefault);

  // Loading KPI
  const kpiLoading = document.createElement('div');
  kpiLoading.className = 'kobos-card';
  kpiLoading.style.maxWidth = '280px';
  kpiLoading.style.marginBottom = '16px';
  const ksk1 = document.createElement('div');
  ksk1.className = 'kobos-skeleton';
  ksk1.style.width = '70%';
  const ksk2 = document.createElement('div');
  ksk2.className = 'kobos-skeleton';
  ksk2.style.width = '40%';
  kpiLoading.appendChild(ksk1);
  kpiLoading.appendChild(ksk2);
  container.appendChild(kpiLoading);

  // Warning KPI
  const kpiWarning = document.createElement('div');
  kpiWarning.className = 'kobos-card is-warning';
  kpiWarning.style.maxWidth = '280px';
  kpiWarning.style.marginBottom = '16px';
  kpiWarning.innerHTML = `
    <div style="font: var(--kobos-type-caption); color: var(--kobos-text-muted); margin-bottom: 4px;">COST COVERAGE</div>
    <div class="kobos-card__kpi-value">42%</div>
    <div class="kobos-card__message is-warning">Below 60% — review required</div>
  `;
  container.appendChild(kpiWarning);

  // Error KPI
  const kpiError = document.createElement('div');
  kpiError.className = 'kobos-card is-error';
  kpiError.style.maxWidth = '280px';
  kpiError.style.marginBottom = '16px';
  kpiError.innerHTML = `
    <div style="font: var(--kobos-type-caption); color: var(--kobos-text-muted); margin-bottom: 4px;">PAYMENT VERIFICATION</div>
    <div class="kobos-card__kpi-value">—</div>
    <div class="kobos-card__message is-error">Stripe verification failed</div>
  `;
  container.appendChild(kpiError);

  // 4. Entity Cards
  container.appendChild(createSectionHeading('Entity Cards', '.kobos-card'));

  const entityGrid = document.createElement('div');
  entityGrid.style.display = 'grid';
  entityGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
  entityGrid.style.gap = '16px';
  entityGrid.style.marginBottom = '24px';

  // Order Default
  const orderDefault = document.createElement('div');
  orderDefault.className = 'kobos-card';
  orderDefault.innerHTML = `
    <span class="kobos-badge kobos-badge--info">In-Production</span>
    <div class="kobos-card__title">Order #1042</div>
    <div class="kobos-card__subtitle">Anderson Cabinets</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Total</span><span class="kobos-card__meta-value mono">$2,481.50</span></div>
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Due</span><span class="kobos-card__meta-value">Jul 18</span></div>
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Items</span><span class="kobos-card__meta-value">12</span></div>
    </div>
    <div class="kobos-card__divider"></div>
    <div class="kobos-card__actions">
      <button class="kobos-btn kobos-btn--secondary kobos-btn--sm">View Order</button>
      <button class="kobos-btn kobos-btn--success kobos-btn--sm">Mark Paid</button>
    </div>
  `;
  entityGrid.appendChild(orderDefault);

  // Order Warning
  const orderWarning = document.createElement('div');
  orderWarning.className = 'kobos-card is-warning';
  orderWarning.innerHTML = `
    <span class="kobos-badge kobos-badge--warning">Needs-Review</span>
    <div class="kobos-card__title">Order #1043</div>
    <div class="kobos-card__subtitle">Summit Design Group</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Total</span><span class="kobos-card__meta-value mono">$3,100.00</span></div>
    </div>
    <div class="kobos-card__message is-warning">Cost data incomplete</div>
  `;
  entityGrid.appendChild(orderWarning);

  // Order Overdue
  const orderOverdue = document.createElement('div');
  orderOverdue.className = 'kobos-card is-overdue';
  orderOverdue.innerHTML = `
    <span class="kobos-badge kobos-badge--error">Overdue</span>
    <div class="kobos-card__title">Order #1041</div>
    <div class="kobos-card__subtitle">Kitchen Outfitters</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Total</span><span class="kobos-card__meta-value mono">$1,850.00</span></div>
    </div>
    <div class="kobos-card__message is-error">5 days past due</div>
  `;
  entityGrid.appendChild(orderOverdue);

  // Order Locked
  const orderLocked = document.createElement('div');
  orderLocked.className = 'kobos-card is-locked';
  orderLocked.innerHTML = `
    <span class="kobos-badge kobos-badge--brand">Locked</span>
    <div class="kobos-card__title">Order #1040</div>
    <div class="kobos-card__subtitle">Anderson Cabinets</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Total</span><span class="kobos-card__meta-value mono">$4,200.00</span></div>
    </div>
    <div class="kobos-card__message">Protected. View only.</div>
  `;
  entityGrid.appendChild(orderLocked);

  // Quote Default
  const quoteDefault = document.createElement('div');
  quoteDefault.className = 'kobos-card';
  quoteDefault.innerHTML = `
    <span class="kobos-badge kobos-badge--neutral">Draft</span>
    <div class="kobos-card__title">Quote QT-0048</div>
    <div class="kobos-card__subtitle">Summit Design Group</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Total</span><span class="kobos-card__meta-value mono">$3,100.00</span></div>
    </div>
    <div class="kobos-card__divider"></div>
    <div class="kobos-card__actions">
      <button class="kobos-btn kobos-btn--success kobos-btn--sm">Convert to Order</button>
      <button class="kobos-btn kobos-btn--tertiary kobos-btn--sm">Edit</button>
    </div>
  `;
  entityGrid.appendChild(quoteDefault);

  // Quote Needs-Review
  const quoteReview = document.createElement('div');
  quoteReview.className = 'kobos-card is-needs-review';
  quoteReview.innerHTML = `
    <span class="kobos-badge kobos-badge--warning">Needs-Review</span>
    <div class="kobos-card__title">Quote QT-0051</div>
    <div class="kobos-card__subtitle">Summit Design Group</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Total</span><span class="kobos-card__meta-value mono">$2,750.00</span></div>
    </div>
    <div class="kobos-card__message is-warning">Cost data incomplete</div>
  `;
  entityGrid.appendChild(quoteReview);

  // Customer Selected
  const customerSelected = document.createElement('div');
  customerSelected.className = 'kobos-card is-selected';
  customerSelected.innerHTML = `
    <div class="kobos-card__title">Anderson Cabinets</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Orders</span><span class="kobos-card__meta-value">34</span></div>
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Since</span><span class="kobos-card__meta-value">2019</span></div>
    </div>
  `;
  entityGrid.appendChild(customerSelected);

  // Employee Active
  const employeeActive = document.createElement('div');
  employeeActive.className = 'kobos-card';
  employeeActive.innerHTML = `
    <span class="kobos-badge kobos-badge--success">Active</span>
    <div class="kobos-card__title">Sarah K.</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Role</span><span class="kobos-card__meta-value">Production</span></div>
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Tasks today</span><span class="kobos-card__meta-value">3</span></div>
    </div>
  `;
  entityGrid.appendChild(employeeActive);

  container.appendChild(entityGrid);

  // 5. Task Card
  container.appendChild(createSectionHeading('Task Card', '.kobos-card'));

  const taskGrid = document.createElement('div');
  taskGrid.style.display = 'grid';
  taskGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(260px, 1fr))';
  taskGrid.style.gap = '16px';
  taskGrid.style.marginBottom = '24px';

  // Task Default
  const taskDefault = document.createElement('div');
  taskDefault.className = 'kobos-card';
  taskDefault.innerHTML = `
    <span class="kobos-badge kobos-badge--neutral">Todo</span>
    <div class="kobos-card__title">CNC — Cut doors</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Order</span><span class="kobos-card__meta-value">#1042</span></div>
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Due</span><span class="kobos-card__meta-value">Jul 12</span></div>
    </div>
  `;
  taskGrid.appendChild(taskDefault);

  // Task Active
  const taskActive = document.createElement('div');
  taskActive.className = 'kobos-card is-selected';
  taskActive.innerHTML = `
    <span class="kobos-badge kobos-badge--info">In-Progress</span>
    <div class="kobos-card__title">CNC — Cut doors</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Order</span><span class="kobos-card__meta-value">#1042</span></div>
    </div>
  `;
  taskGrid.appendChild(taskActive);

  // Task Overdue
  const taskOverdue = document.createElement('div');
  taskOverdue.className = 'kobos-card is-overdue';
  taskOverdue.innerHTML = `
    <span class="kobos-badge kobos-badge--error">Overdue</span>
    <div class="kobos-card__title">CNC — Cut doors</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Order</span><span class="kobos-card__meta-value">#1041</span></div>
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Due</span><span class="kobos-card__meta-value">Jul 5 — 4 days late</span></div>
    </div>
  `;
  taskGrid.appendChild(taskOverdue);

  // Task Needs-Review
  const taskReview = document.createElement('div');
  taskReview.className = 'kobos-card is-needs-review';
  taskReview.innerHTML = `
    <span class="kobos-badge kobos-badge--warning">Needs-Review</span>
    <div class="kobos-card__title">CNC — Cut doors</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Order</span><span class="kobos-card__meta-value">#1043</span></div>
    </div>
  `;
  taskGrid.appendChild(taskReview);

  // Task Locked
  const taskLocked = document.createElement('div');
  taskLocked.className = 'kobos-card is-locked';
  taskLocked.innerHTML = `
    <span class="kobos-badge kobos-badge--brand">Locked</span>
    <div class="kobos-card__title">CNC — Cut doors</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Order</span><span class="kobos-card__meta-value">#1040</span></div>
    </div>
  `;
  taskGrid.appendChild(taskLocked);

  container.appendChild(taskGrid);

  // 6. Document Card
  container.appendChild(createSectionHeading('Document Card', '.kobos-card'));

  const docGrid = document.createElement('div');
  docGrid.style.display = 'grid';
  docGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
  docGrid.style.gap = '16px';
  docGrid.style.marginBottom = '24px';

  // Parsed
  const docParsed = document.createElement('div');
  docParsed.className = 'kobos-card';
  docParsed.innerHTML = `
    <span class="kobos-badge kobos-badge--info">Parsed</span>
    <div class="kobos-card__title">INV-2026-0042.pdf</div>
    <div class="kobos-card__subtitle">invoices@kitchenoutfittersll.com</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Vendor</span><span class="kobos-card__meta-value">Hardwood Supply Co</span></div>
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Total</span><span class="kobos-card__meta-value mono">$1,284.00</span></div>
    </div>
    <div class="kobos-card__divider"></div>
    <div class="kobos-card__actions">
      <button class="kobos-btn kobos-btn--secondary kobos-btn--sm">Review</button>
    </div>
  `;
  docGrid.appendChild(docParsed);

  // Processing
  const docProcessing = document.createElement('div');
  docProcessing.className = 'kobos-card';
  docProcessing.innerHTML = `
    <span class="kobos-badge kobos-badge--warning">Pending</span>
    <div class="kobos-card__title">INV-2026-0043.pdf</div>
    <div class="kobos-card__subtitle">Parsing…</div>
    <div class="kobos-skeleton" style="width: 80%;"></div>
  `;
  docGrid.appendChild(docProcessing);

  // Needs-Review
  const docNeedsReview = document.createElement('div');
  docNeedsReview.className = 'kobos-card is-needs-review';
  docNeedsReview.innerHTML = `
    <span class="kobos-badge kobos-badge--warning">Needs-Review</span>
    <div class="kobos-card__title">INV-2026-0044.pdf</div>
    <div class="kobos-card__subtitle">invoices@kitchenoutfittersll.com</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Vendor</span><span class="kobos-card__meta-value">Hardwood Supply Co</span></div>
    </div>
    <div class="kobos-card__message is-warning">3 line items unmatched</div>
  `;
  docGrid.appendChild(docNeedsReview);

  // Parse Failed
  const docFailed = document.createElement('div');
  docFailed.className = 'kobos-card is-error';
  docFailed.innerHTML = `
    <span class="kobos-badge kobos-badge--error">Failed</span>
    <div class="kobos-card__title">INV-2026-0045.pdf</div>
    <div class="kobos-card__subtitle">invoices@kitchenoutfittersll.com</div>
    <div class="kobos-card__message is-error">Unreadable PDF — manual entry</div>
  `;
  docGrid.appendChild(docFailed);

  // Duplicate
  const docDuplicate = document.createElement('div');
  docDuplicate.className = 'kobos-card is-warning';
  docDuplicate.innerHTML = `
    <span class="kobos-badge kobos-badge--warning">Duplicate</span>
    <div class="kobos-card__title">INV-2026-0046.pdf</div>
    <div class="kobos-card__subtitle">invoices@kitchenoutfittersll.com</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Total</span><span class="kobos-card__meta-value mono">$1,284.00</span></div>
    </div>
    <div class="kobos-card__message is-warning">Matches INV-2026-0038</div>
  `;
  docGrid.appendChild(docDuplicate);

  container.appendChild(docGrid);

  // 7. Cost Margin Card
  container.appendChild(createSectionHeading('Cost Margin Card', '.kobos-card'));

  const costGrid = document.createElement('div');
  costGrid.style.display = 'grid';
  costGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
  costGrid.style.gap = '16px';
  costGrid.style.marginBottom = '24px';

  // Default
  const costDefault = document.createElement('div');
  costDefault.className = 'kobos-card';
  costDefault.innerHTML = `
    <span class="kobos-badge kobos-badge--success">Actual</span>
    <div class="kobos-card__title">Cost Profile — MDF Doors</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Coverage</span><span class="kobos-card__meta-value">92%</span></div>
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Margin</span><span class="kobos-card__meta-value mono">38%</span></div>
    </div>
  `;
  costGrid.appendChild(costDefault);

  // Warning
  const costWarning = document.createElement('div');
  costWarning.className = 'kobos-card is-warning';
  costWarning.innerHTML = `
    <span class="kobos-badge kobos-badge--warning">Needs-Review</span>
    <div class="kobos-card__title">Cost Profile — MDF Doors</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Coverage</span><span class="kobos-card__meta-value">42%</span></div>
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Margin</span><span class="kobos-card__meta-value mono">—</span></div>
    </div>
    <div class="kobos-card__message is-warning">Incomplete — 3 items estimated</div>
  `;
  costGrid.appendChild(costWarning);

  // Locked
  const costLocked = document.createElement('div');
  costLocked.className = 'kobos-card is-locked';
  costLocked.innerHTML = `
    <span class="kobos-badge kobos-badge--brand">Locked</span>
    <div class="kobos-card__title">Cost Profile — MDF Doors</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Coverage</span><span class="kobos-card__meta-value">92%</span></div>
    </div>
    <div class="kobos-card__message">Approved by owner Jul 9</div>
  `;
  costGrid.appendChild(costLocked);

  // Error
  const costError = document.createElement('div');
  costError.className = 'kobos-card is-error';
  costError.innerHTML = `
    <div class="kobos-card__title">Cost Profile — MDF Doors</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Coverage</span><span class="kobos-card__meta-value">—</span></div>
    </div>
    <div class="kobos-card__message is-error">Calculation failed — missing wage rates</div>
  `;
  costGrid.appendChild(costError);

  // Needs-Review
  const costNeeds = document.createElement('div');
  costNeeds.className = 'kobos-card is-needs-review';
  costNeeds.innerHTML = `
    <span class="kobos-badge kobos-badge--warning">Manual-Override</span>
    <div class="kobos-card__title">Cost Profile — MDF Doors</div>
    <div class="kobos-card__meta">
      <div class="kobos-card__meta-row"><span class="kobos-card__meta-label">Coverage</span><span class="kobos-card__meta-value">65%</span></div>
    </div>
    <div class="kobos-card__message is-warning">Override pending approval</div>
  `;
  costGrid.appendChild(costNeeds);

  container.appendChild(costGrid);

  // 8. Alert Card
  container.appendChild(createSectionHeading('Alert Card', '.kobos-card'));

  const alertGrid = document.createElement('div');
  alertGrid.style.display = 'grid';
  alertGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(340px, 1fr))';
  alertGrid.style.gap = '16px';
  alertGrid.style.marginBottom = '24px';

  // Default Alert
  const alertDefault = document.createElement('div');
  alertDefault.className = 'kobos-card';
  alertDefault.innerHTML = `
    <span class="kobos-badge kobos-badge--warning">Needs-Review</span>
    <div class="kobos-card__title">Manual review required</div>
    <div style="font: var(--kobos-type-body-small); margin: 8px 0;">Quote QT-0048 has unmatched cost lines.</div>
    <div class="kobos-card__actions">
      <button class="kobos-btn kobos-btn--primary kobos-btn--sm">Review now</button>
    </div>
  `;
  alertGrid.appendChild(alertDefault);

  // Warning Alert
  const alertWarning = document.createElement('div');
  alertWarning.className = 'kobos-card is-warning';
  alertWarning.innerHTML = `
    <span class="kobos-badge kobos-badge--warning">Warning</span>
    <div class="kobos-card__title">Cost coverage below 60%</div>
    <div style="font: var(--kobos-type-body-small); margin: 8px 0;">Review cost data before proceeding.</div>
  `;
  alertGrid.appendChild(alertWarning);

  // Error Alert
  const alertError = document.createElement('div');
  alertError.className = 'kobos-card is-error';
  alertError.innerHTML = `
    <span class="kobos-badge kobos-badge--error">Error</span>
    <div class="kobos-card__title">Payment failed — Stripe declined</div>
    <div style="font: var(--kobos-type-body-small); margin: 8px 0;">Card ending in 4242 was declined.</div>
    <div class="kobos-card__actions">
      <button class="kobos-btn kobos-btn--destructive kobos-btn--sm">Retry</button>
    </div>
  `;
  alertGrid.appendChild(alertError);

  // Overdue Alert
  const alertOverdue = document.createElement('div');
  alertOverdue.className = 'kobos-card is-overdue';
  alertOverdue.innerHTML = `
    <span class="kobos-badge kobos-badge--error">Overdue</span>
    <div class="kobos-card__title">Review due 2 days ago</div>
    <div style="font: var(--kobos-type-body-small); margin: 8px 0;">Quote QT-0048 requires immediate attention.</div>
  `;
  alertGrid.appendChild(alertOverdue);

  container.appendChild(alertGrid);

  // 9. States reference
  container.appendChild(createSectionHeading('States reference', '.kobos-card'));

  const statesRef = document.createElement('div');
  statesRef.style.display = 'grid';
  statesRef.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
  statesRef.style.gap = '12px';

  const stateItems = [
    { state: '', label: 'Default', caption: 'Normal display. No issue.' },
    { state: 'is-hover', label: 'Hover', caption: 'Clickable affordance.' },
    { state: 'is-selected', label: 'Selected', caption: 'Active selection in list.' },
    { state: 'is-selected', label: 'Active', caption: 'Currently running or open.' },
    { state: 'is-disabled', label: 'Disabled', caption: 'Unavailable. Muted text.' },
    { state: '', label: 'Loading', caption: 'Content loading. Use skeleton.' },
    { state: 'is-warning', label: 'Warning', caption: 'Non-blocking issue. Review needed.' },
    { state: 'is-error', label: 'Error', caption: 'Blocking failure. Action required.' },
    { state: 'is-needs-review', label: 'Needs Review', caption: 'Human review required.' },
    { state: 'is-overdue', label: 'Overdue', caption: 'Time-sensitive. Past due.' },
    { state: 'is-locked', label: 'Locked', caption: 'Protected. View only.' },
    { state: '', label: 'Read-only', caption: 'View only. Not editable.' }
  ];

  stateItems.forEach(item => {
    const mini = document.createElement('div');
    mini.className = `kobos-card ${item.state}`.trim();
    mini.style.padding = '10px';
    mini.style.fontSize = '12px';
    mini.innerHTML = `
      <div class="kobos-card__title" style="font-size: 13px; margin-bottom: 2px;">${item.label}</div>
      <div style="font: var(--kobos-type-caption); color: var(--kobos-text-muted);">${item.caption}</div>
    `;
    statesRef.appendChild(mini);
  });

  container.appendChild(statesRef);
}

function renderCheckbox(container) {
  container.innerHTML = '<h1>Checkbox, Radio & Switch</h1>';

  function createCheckbox(checked = false, disabled = false, error = false, indeterminate = false) {
    const el = document.createElement('div');
    el.className = 'kobos-checkbox';
    if (checked) el.classList.add('is-checked');
    if (disabled) el.classList.add('is-disabled');
    if (error) el.classList.add('is-error');
    if (indeterminate) el.classList.add('is-indeterminate');
    updateCheckboxVisual(el, checked, indeterminate, disabled);
    if (!disabled) {
      el.addEventListener('click', () => {
        if (el.classList.contains('is-disabled')) return;
        const isNowChecked = !el.classList.contains('is-checked');
        el.classList.toggle('is-checked');
        if (el.classList.contains('is-indeterminate')) {
          el.classList.remove('is-indeterminate');
        }
        updateCheckboxVisual(el, isNowChecked, false, false);
      });
    }
    return el;
  }

  function updateCheckboxVisual(el, checked, indeterminate, disabled) {
    el.innerHTML = '';
    if (indeterminate) {
      const bar = document.createElement('div');
      bar.className = 'indeterminate-bar';
      el.appendChild(bar);
    } else if (checked) {
      const check = document.createElement('span');
      check.innerHTML = checkboxCheckSVG;
      check.style.width = '13px';
      check.style.height = '13px';
      check.style.color = disabled ? 'var(--kobos-text-disabled)' : 'var(--kobos-text-inverse)';
      el.appendChild(check);
    }
  }

  function createRadio(selected = false, disabled = false, error = false) {
    const el = document.createElement('div');
    el.className = 'kobos-radio';
    if (selected) el.classList.add('is-selected');
    if (disabled) el.classList.add('is-disabled');
    if (error) el.classList.add('is-error');
    updateRadioVisual(el, selected, disabled);
    return el;
  }

  function updateRadioVisual(el, selected, disabled) {
    el.innerHTML = '';
    if (selected) {
      const dot = document.createElement('div');
      dot.className = 'radio-dot';
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.backgroundColor = disabled ? 'var(--kobos-text-disabled)' : 'var(--kobos-brand-default)';
      dot.style.borderRadius = '999px';
      el.appendChild(dot);
    }
  }

  function createSwitch(isOn = false, disabled = false, loading = false, denied = false) {
    const el = document.createElement('div');
    el.className = 'kobos-switch';
    if (isOn) el.classList.add('is-on');
    if (disabled) el.classList.add('is-disabled');
    if (loading) el.classList.add('is-loading');
    if (denied) el.classList.add('is-denied');
    const thumb = document.createElement('div');
    thumb.className = 'switch-thumb';
    el.appendChild(thumb);
    if (!disabled && !denied && !loading) {
      el.addEventListener('click', () => {
        const nowOn = !el.classList.contains('is-on');
        el.classList.toggle('is-on');
      });
    }
    return el;
  }

  // 1. Checkbox states
  container.appendChild(createSectionHeading('Checkbox states', '.kobos-checkbox'));
  const cbStatesContainer = document.createElement('div');
  cbStatesContainer.className = 'checkbox-states';
  const cbStateDemos = [
    { caption: 'Unchecked', checked: false, disabled: false, error: false, focus: false, indeterminate: false },
    { caption: 'Checked', checked: true, disabled: false, error: false, focus: false, indeterminate: false },
    { caption: 'Indeterminate', checked: false, disabled: false, error: false, focus: false, indeterminate: true },
    { caption: 'Disabled unchecked', checked: false, disabled: true, error: false, focus: false, indeterminate: false },
    { caption: 'Disabled checked', checked: true, disabled: true, error: false, focus: false, indeterminate: false },
    { caption: 'Error', checked: false, disabled: false, error: true, focus: false, indeterminate: false },
    { caption: 'Focus', checked: false, disabled: false, error: false, focus: true, indeterminate: false }
  ];
  cbStateDemos.forEach(demo => {
    const stateDiv = document.createElement('div');
    stateDiv.className = 'state-demo';
    const cb = document.createElement('div');
    cb.className = 'kobos-checkbox';
    if (demo.checked) cb.classList.add('is-checked');
    if (demo.disabled) cb.classList.add('is-disabled');
    if (demo.error) cb.classList.add('is-error');
    if (demo.focus) cb.classList.add('is-focus');
    if (demo.indeterminate) cb.classList.add('is-indeterminate');
    if (demo.checked || demo.indeterminate) {
      if (demo.indeterminate) {
        const bar = document.createElement('div');
        bar.className = 'indeterminate-bar';
        cb.appendChild(bar);
      } else {
        const check = document.createElement('span');
        check.innerHTML = checkboxCheckSVG;
        check.style.width = '13px';
        check.style.height = '13px';
        check.style.color = demo.disabled ? 'var(--kobos-text-disabled)' : 'var(--kobos-text-inverse)';
        cb.appendChild(check);
      }
    }
    stateDiv.appendChild(cb);
    const cap = document.createElement('div');
    cap.className = 'button-caption';
    cap.textContent = demo.caption;
    stateDiv.appendChild(cap);
    cbStatesContainer.appendChild(stateDiv);
  });
  container.appendChild(cbStatesContainer);

  // 2. Checkbox examples
  container.appendChild(createSectionHeading('Checkbox examples', '.kobos-checkbox'));
  const cbExamples = [
    { label: 'Hinge boring', desc: 'Drill 35mm hinge cups for this door', checked: true },
    { label: 'Rush order', desc: 'Expedite production schedule if available', warningHelp: 'Rush may not be available for all finish types.' },
    { label: 'Residential delivery', desc: 'Freight carrier with liftgate service' },
    { label: 'Lift-gate required', desc: 'Adds handling at delivery', checked: true },
    { label: 'Needs review', desc: 'Flag this order for manual admin review' },
    { label: 'Share via customer-facing PDF', desc: 'Include prices in the shared quote', checked: true },
    { label: 'Terms confirmation', desc: 'Customer accepted the quoted terms', help: 'Confirmation required before order can be submitted.' }
  ];
  cbExamples.forEach(ex => {
    const row = document.createElement('div');
    row.className = 'kobos-field-option';
    const control = createCheckbox(ex.checked || false, false, false, false);
    row.appendChild(control);
    const textCol = document.createElement('div');
    const label = document.createElement('div');
    label.className = 'option-label';
    label.textContent = ex.label;
    textCol.appendChild(label);
    const desc = document.createElement('div');
    desc.className = 'option-desc';
    desc.textContent = ex.desc;
    textCol.appendChild(desc);
    if (ex.warningHelp) {
      const help = document.createElement('div');
      help.className = 'kobos-field-option__help is-warning';
      help.textContent = ex.warningHelp;
      textCol.appendChild(help);
    }
    if (ex.help) {
      const help = document.createElement('div');
      help.className = 'kobos-field-option__help';
      help.textContent = ex.help;
      textCol.appendChild(help);
    }
    row.appendChild(textCol);
    container.appendChild(row);
  });

  // 3. Radio states
  container.appendChild(createSectionHeading('Radio states', '.kobos-radio'));
  const radioStatesContainer = document.createElement('div');
  radioStatesContainer.className = 'radio-states';
  const radioStateDemos = [
    { caption: 'Unselected', selected: false, disabled: false, error: false, focus: false },
    { caption: 'Selected', selected: true, disabled: false, error: false, focus: false },
    { caption: 'Disabled', selected: false, disabled: true, error: false, focus: false },
    { caption: 'Error', selected: false, disabled: false, error: true, focus: false },
    { caption: 'Focus', selected: false, disabled: false, error: false, focus: true }
  ];
  radioStateDemos.forEach(demo => {
    const stateDiv = document.createElement('div');
    stateDiv.className = 'state-demo';
    const radio = document.createElement('div');
    radio.className = 'kobos-radio';
    if (demo.selected) radio.classList.add('is-selected');
    if (demo.disabled) radio.classList.add('is-disabled');
    if (demo.error) radio.classList.add('is-error');
    if (demo.focus) radio.classList.add('is-focus');
    if (demo.selected) {
      const dot = document.createElement('div');
      dot.className = 'radio-dot';
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.backgroundColor = demo.disabled ? 'var(--kobos-text-disabled)' : 'var(--kobos-brand-default)';
      dot.style.borderRadius = '999px';
      radio.appendChild(dot);
    }
    stateDiv.appendChild(radio);
    const cap = document.createElement('div');
    cap.className = 'button-caption';
    cap.textContent = demo.caption;
    stateDiv.appendChild(cap);
    radioStatesContainer.appendChild(stateDiv);
  });
  container.appendChild(radioStatesContainer);

  // 4. Radio group examples
  container.appendChild(createSectionHeading('Radio group examples', '.kobos-radio'));

  // Hinge boring
  const group1Label = document.createElement('div');
  group1Label.style.font = 'var(--kobos-type-body-semibold)';
  group1Label.style.marginTop = '16px';
  group1Label.textContent = 'Hinge boring';
  container.appendChild(group1Label);
  const hingeOptions = [
    { text: 'No boring', selected: false },
    { text: 'Hinge boring only', selected: true },
    { text: 'Hinge boring + hinges', selected: false }
  ];
  const hingeRadios = [];
  hingeOptions.forEach(opt => {
    const row = document.createElement('div');
    row.className = 'kobos-field-option';
    const radio = createRadio(opt.selected);
    hingeRadios.push(radio);
    radio.addEventListener('click', () => {
      hingeRadios.forEach(r => {
        r.classList.remove('is-selected');
        updateRadioVisual(r, false, r.classList.contains('is-disabled'));
      });
      radio.classList.add('is-selected');
      updateRadioVisual(radio, true, false);
    });
    row.appendChild(radio);
    const textCol = document.createElement('div');
    const lbl = document.createElement('div');
    lbl.className = 'option-label';
    lbl.textContent = opt.text;
    textCol.appendChild(lbl);
    row.appendChild(textCol);
    container.appendChild(row);
  });

  // Delivery type
  const group2Label = document.createElement('div');
  group2Label.style.font = 'var(--kobos-type-body-semibold)';
  group2Label.style.marginTop = '16px';
  group2Label.textContent = 'Delivery type';
  container.appendChild(group2Label);
  const deliveryOptions = [
    { text: 'Standard shipping', selected: false },
    { text: 'Freight shipping', selected: true },
    { text: 'Customer pickup', selected: false }
  ];
  const deliveryRadios = [];
  deliveryOptions.forEach(opt => {
    const row = document.createElement('div');
    row.className = 'kobos-field-option';
    const radio = createRadio(opt.selected);
    deliveryRadios.push(radio);
    radio.addEventListener('click', () => {
      deliveryRadios.forEach(r => {
        r.classList.remove('is-selected');
        updateRadioVisual(r, false, r.classList.contains('is-disabled'));
      });
      radio.classList.add('is-selected');
      updateRadioVisual(radio, true, false);
    });
    row.appendChild(radio);
    const textCol = document.createElement('div');
    const lbl = document.createElement('div');
    lbl.className = 'option-label';
    lbl.textContent = opt.text;
    textCol.appendChild(lbl);
    row.appendChild(textCol);
    container.appendChild(row);
  });

  // Cost source
  const group3Label = document.createElement('div');
  group3Label.style.font = 'var(--kobos-type-body-semibold)';
  group3Label.style.marginTop = '16px';
  group3Label.textContent = 'Cost source';
  container.appendChild(group3Label);
  const costSourceOptions = [
    { text: 'Unknown', selected: false },
    { text: 'Estimated Engine', selected: false },
    { text: 'Manual Capture', selected: true },
    { text: 'Manual Override', selected: false },
    { text: 'Vendor Invoice', selected: false },
    { text: 'Production Actual', selected: false, disabled: true }
  ];
  const costSourceRadios = [];
  costSourceOptions.forEach(opt => {
    const row = document.createElement('div');
    row.className = 'kobos-field-option';
    const radio = createRadio(opt.selected, opt.disabled || false);
    costSourceRadios.push(radio);
    if (!opt.disabled) {
      radio.addEventListener('click', () => {
        costSourceRadios.forEach(r => {
          if (!r.classList.contains('is-disabled')) {
            r.classList.remove('is-selected');
            updateRadioVisual(r, false, false);
          }
        });
        radio.classList.add('is-selected');
        updateRadioVisual(radio, true, false);
      });
    }
    row.appendChild(radio);
    const textCol = document.createElement('div');
    const lbl = document.createElement('div');
    lbl.className = 'option-label';
    lbl.textContent = opt.text;
    textCol.appendChild(lbl);
    row.appendChild(textCol);
    container.appendChild(row);
  });

  // Quote visibility
  const group4Label = document.createElement('div');
  group4Label.style.font = 'var(--kobos-type-body-semibold)';
  group4Label.style.marginTop = '16px';
  group4Label.textContent = 'Quote visibility';
  container.appendChild(group4Label);
  const quoteOptions = [
    { text: 'Internal only', selected: false },
    { text: 'Customer-facing', selected: true },
    { text: 'Dealer-facing', selected: false }
  ];
  const quoteRadios = [];
  quoteOptions.forEach(opt => {
    const row = document.createElement('div');
    row.className = 'kobos-field-option';
    const radio = createRadio(opt.selected);
    quoteRadios.push(radio);
    radio.addEventListener('click', () => {
      quoteRadios.forEach(r => {
        r.classList.remove('is-selected');
        updateRadioVisual(r, false, r.classList.contains('is-disabled'));
      });
      radio.classList.add('is-selected');
      updateRadioVisual(radio, true, false);
    });
    row.appendChild(radio);
    const textCol = document.createElement('div');
    const lbl = document.createElement('div');
    lbl.className = 'option-label';
    lbl.textContent = opt.text;
    textCol.appendChild(lbl);
    row.appendChild(textCol);
    container.appendChild(row);
  });

  // 5. Switch states
  container.appendChild(createSectionHeading('Switch states', '.kobos-switch'));
  const switchStatesContainer = document.createElement('div');
  switchStatesContainer.className = 'switch-states';
  const switchStateDemos = [
    { caption: 'Off', on: false, disabled: false, loading: false, denied: false },
    { caption: 'On', on: true, disabled: false, loading: false, denied: false },
    { caption: 'Disabled off', on: false, disabled: true, loading: false, denied: false },
    { caption: 'Disabled on', on: true, disabled: true, loading: false, denied: false },
    { caption: 'Loading', on: false, disabled: false, loading: true, denied: false },
    { caption: 'Permission denied', on: false, disabled: false, loading: false, denied: true }
  ];
  switchStateDemos.forEach(demo => {
    const stateDiv = document.createElement('div');
    stateDiv.className = 'state-demo';
    const sw = createSwitch(demo.on, demo.disabled, demo.loading, demo.denied);
    stateDiv.appendChild(sw);
    const cap = document.createElement('div');
    cap.className = 'button-caption';
    cap.textContent = demo.caption;
    stateDiv.appendChild(cap);
    switchStatesContainer.appendChild(stateDiv);
  });
  container.appendChild(switchStatesContainer);

  // 6. Switch examples
  container.appendChild(createSectionHeading('Switch examples', '.kobos-switch'));
  const switchExamples = [
    { label: 'Cost locked', desc: '', on: true, help: 'Cost is locked by admin — contact admin to unlock.' },
    { label: 'Cost locked', desc: '', on: true, denied: true, help: 'Admin permission required.', helpError: true },
    { label: 'Dealer approved', desc: '', on: true },
    { label: 'Employee active', desc: '', on: true, help: 'Changes must be made in the HR system.' },
    { label: 'Auto-apply rule enabled', desc: '', on: true },
    { label: 'Saving…', desc: '', on: false, loading: true, help: 'Saving…' },
    { label: 'Customer-facing PDF allowed', desc: '', on: false }
  ];
  switchExamples.forEach(ex => {
    const row = document.createElement('div');
    row.className = 'kobos-field-option';
    const sw = createSwitch(ex.on, ex.disabled || false, ex.loading || false, ex.denied || false);
    row.appendChild(sw);
    if (ex.label === 'Cost locked' && !ex.denied && !ex.loading) {
      sw.addEventListener('click', () => {
        const isOn = sw.classList.contains('is-on');
        showToast('Cost locked: ' + (isOn ? 'On' : 'Off'));
      });
    }
    if (ex.label === 'Customer-facing PDF allowed') {
      sw.addEventListener('click', () => {
        const isOn = sw.classList.contains('is-on');
        showToast('Customer-facing PDF allowed: ' + (isOn ? 'On' : 'Off'));
      });
    }
    const textCol = document.createElement('div');
    const label = document.createElement('div');
    label.className = 'option-label';
    label.textContent = ex.label;
    textCol.appendChild(label);
    if (ex.desc) {
      const desc = document.createElement('div');
      desc.className = 'option-desc';
      desc.textContent = ex.desc;
      textCol.appendChild(desc);
    }
    if (ex.help) {
      const help = document.createElement('div');
      help.className = 'kobos-field-option__help' + (ex.helpError ? ' is-error' : '');
      help.textContent = ex.help;
      textCol.appendChild(help);
    }
    row.appendChild(textCol);
    container.appendChild(row);
  });

  // 7. Order Options & Rules
  container.appendChild(createSectionHeading('Order Options & Rules', '.kobos-card'));
  const card = document.createElement('div');
  card.className = 'kobos-card';
  const title = document.createElement('div');
  title.className = 'kobos-card__title';
  title.textContent = 'Order Options & Rules';
  card.appendChild(title);
  const sub = document.createElement('div');
  sub.className = 'kobos-card__subtitle';
  sub.textContent = 'Order #1042 · Anderson Cabinets · Production, freight, cost, and portal options';
  card.appendChild(sub);

  // PRODUCTION OPTIONS
  const prodHeader = document.createElement('div');
  prodHeader.style.font = 'var(--kobos-type-table-header)';
  prodHeader.style.textTransform = 'uppercase';
  prodHeader.style.marginTop = '16px';
  prodHeader.textContent = 'PRODUCTION OPTIONS';
  card.appendChild(prodHeader);
  const prodDivider = document.createElement('div');
  prodDivider.style.height = '1px';
  prodDivider.style.backgroundColor = 'var(--kobos-border-subtle)';
  prodDivider.style.margin = '8px 0';
  card.appendChild(prodDivider);

  const hingeRow = document.createElement('div');
  hingeRow.className = 'kobos-field-option';
  const hingeCb = createCheckbox(true);
  hingeRow.appendChild(hingeCb);
  const hingeText = document.createElement('div');
  const hingeLabel = document.createElement('div');
  hingeLabel.className = 'option-label';
  hingeLabel.textContent = 'Hinge boring';
  hingeText.appendChild(hingeLabel);
  hingeRow.appendChild(hingeText);
  card.appendChild(hingeRow);

  const rushRow = document.createElement('div');
  rushRow.className = 'kobos-field-option';
  const rushCb = createCheckbox(false);
  rushRow.appendChild(rushCb);
  const rushText = document.createElement('div');
  const rushLabel = document.createElement('div');
  rushLabel.className = 'option-label';
  rushLabel.textContent = 'Rush order';
  rushText.appendChild(rushLabel);
  const rushDesc = document.createElement('div');
  rushDesc.className = 'option-desc';
  rushDesc.textContent = 'Expedite production schedule if available';
  rushText.appendChild(rushDesc);
  const rushHelp = document.createElement('div');
  rushHelp.className = 'kobos-field-option__help is-warning';
  rushHelp.textContent = 'Rush not available for painted finish.';
  rushText.appendChild(rushHelp);
  rushRow.appendChild(rushText);
  card.appendChild(rushRow);

  const reviewRow = document.createElement('div');
  reviewRow.className = 'kobos-field-option';
  const reviewCb = createCheckbox(true);
  reviewRow.appendChild(reviewCb);
  const reviewText = document.createElement('div');
  const reviewLabel = document.createElement('div');
  reviewLabel.className = 'option-label';
  reviewLabel.textContent = 'Needs review';
  reviewText.appendChild(reviewLabel);
  reviewRow.appendChild(reviewText);
  card.appendChild(reviewRow);

  // FREIGHT OPTIONS
  const freightHeader = document.createElement('div');
  freightHeader.style.font = 'var(--kobos-type-table-header)';
  freightHeader.style.textTransform = 'uppercase';
  freightHeader.style.marginTop = '16px';
  freightHeader.textContent = 'FREIGHT OPTIONS';
  card.appendChild(freightHeader);
  const freightDivider = document.createElement('div');
  freightDivider.style.height = '1px';
  freightDivider.style.backgroundColor = 'var(--kobos-border-subtle)';
  freightDivider.style.margin = '8px 0';
  card.appendChild(freightDivider);

  const resRow = document.createElement('div');
  resRow.className = 'kobos-field-option';
  const resCb = createCheckbox(false);
  resRow.appendChild(resCb);
  const resText = document.createElement('div');
  const resLabel = document.createElement('div');
  resLabel.className = 'option-label';
  resLabel.textContent = 'Residential delivery';
  resText.appendChild(resLabel);
  resRow.appendChild(resText);
  card.appendChild(resRow);

  const liftRow = document.createElement('div');
  liftRow.className = 'kobos-field-option';
  const liftCb = createCheckbox(false);
  liftRow.appendChild(liftCb);
  const liftText = document.createElement('div');
  const liftLabel = document.createElement('div');
  liftLabel.className = 'option-label';
  liftLabel.textContent = 'Lift-gate required';
  liftText.appendChild(liftLabel);
  liftRow.appendChild(liftText);
  card.appendChild(liftRow);

  // COST CONTROLS
  const costHeader = document.createElement('div');
  costHeader.style.font = 'var(--kobos-type-table-header)';
  costHeader.style.textTransform = 'uppercase';
  costHeader.style.marginTop = '16px';
  costHeader.textContent = 'COST CONTROLS';
  card.appendChild(costHeader);
  const costDivider = document.createElement('div');
  costDivider.style.height = '1px';
  costDivider.style.backgroundColor = 'var(--kobos-border-subtle)';
  costDivider.style.margin = '8px 0';
  card.appendChild(costDivider);

  const costLockedRow = document.createElement('div');
  costLockedRow.className = 'kobos-field-option';
  const costSw = createSwitch(true);
  costLockedRow.appendChild(costSw);
  const costText = document.createElement('div');
  const costLabel = document.createElement('div');
  costLabel.className = 'option-label';
  costLabel.textContent = 'Cost locked';
  costText.appendChild(costLabel);
  const costHelp = document.createElement('div');
  costHelp.className = 'kobos-field-option__help';
  costHelp.textContent = 'Cost is locked.';
  costText.appendChild(costHelp);
  costLockedRow.appendChild(costText);
  card.appendChild(costLockedRow);
  costSw.addEventListener('click', () => {
    const isOn = costSw.classList.contains('is-on');
    showToast('Cost locked: ' + (isOn ? 'On' : 'Off'));
  });

  const autoRow = document.createElement('div');
  autoRow.className = 'kobos-field-option';
  const autoSw = createSwitch(true);
  autoRow.appendChild(autoSw);
  const autoText = document.createElement('div');
  const autoLabel = document.createElement('div');
  autoLabel.className = 'option-label';
  autoLabel.textContent = 'Auto-apply rule';
  autoText.appendChild(autoLabel);
  autoRow.appendChild(autoText);
  card.appendChild(autoRow);

  // PORTAL CONTROLS
  const portalHeader = document.createElement('div');
  portalHeader.style.font = 'var(--kobos-type-table-header)';
  portalHeader.style.textTransform = 'uppercase';
  portalHeader.style.marginTop = '16px';
  portalHeader.textContent = 'PORTAL CONTROLS';
  card.appendChild(portalHeader);
  const portalDivider = document.createElement('div');
  portalDivider.style.height = '1px';
  portalDivider.style.backgroundColor = 'var(--kobos-border-subtle)';
  portalDivider.style.margin = '8px 0';
  card.appendChild(portalDivider);

  const pdfRow = document.createElement('div');
  pdfRow.className = 'kobos-field-option';
  const pdfSw = createSwitch(true);
  pdfRow.appendChild(pdfSw);
  const pdfText = document.createElement('div');
  const pdfLabel = document.createElement('div');
  pdfLabel.className = 'option-label';
  pdfLabel.textContent = 'Customer-facing PDF allowed';
  pdfText.appendChild(pdfLabel);
  pdfRow.appendChild(pdfText);
  card.appendChild(pdfRow);
  pdfSw.addEventListener('click', () => {
    const isOn = pdfSw.classList.contains('is-on');
    showToast('Customer-facing PDF allowed: ' + (isOn ? 'On' : 'Off'));
  });

  const dealerRow = document.createElement('div');
  dealerRow.className = 'kobos-field-option';
  const dealerSw = createSwitch(false);
  dealerRow.appendChild(dealerSw);
  const dealerText = document.createElement('div');
  const dealerLabel = document.createElement('div');
  dealerLabel.className = 'option-label';
  dealerLabel.textContent = 'Dealer approved';
  dealerText.appendChild(dealerLabel);
  dealerRow.appendChild(dealerText);
  card.appendChild(dealerRow);

  // EMPLOYEE CONTROLS
  const empHeader = document.createElement('div');
  empHeader.style.font = 'var(--kobos-type-table-header)';
  empHeader.style.textTransform = 'uppercase';
  empHeader.style.marginTop = '16px';
  empHeader.textContent = 'EMPLOYEE CONTROLS';
  card.appendChild(empHeader);
  const empDivider = document.createElement('div');
  empDivider.style.height = '1px';
  empDivider.style.backgroundColor = 'var(--kobos-border-subtle)';
  empDivider.style.margin = '8px 0';
  card.appendChild(empDivider);

  const empRow = document.createElement('div');
  empRow.className = 'kobos-field-option';
  const empSw = createSwitch(true);
  empRow.appendChild(empSw);
  const empText = document.createElement('div');
  const empLabel = document.createElement('div');
  empLabel.className = 'option-label';
  empLabel.textContent = 'Employee active';
  empText.appendChild(empLabel);
  empRow.appendChild(empText);
  card.appendChild(empRow);

  // Footer
  const actions = document.createElement('div');
  actions.className = 'kobos-card__actions';
  actions.style.marginTop = '16px';
  const saveBtn = document.createElement('button');
  saveBtn.className = 'kobos-btn kobos-btn--primary';
  saveBtn.textContent = 'Save Options';
  actions.appendChild(saveBtn);
  const reviewBtn = document.createElement('button');
  reviewBtn.className = 'kobos-btn kobos-btn--secondary';
  reviewBtn.textContent = 'Request Review';
  actions.appendChild(reviewBtn);
  card.appendChild(actions);
  container.appendChild(card);

  // 8. Accessibility & usage rules
  container.appendChild(createSectionHeading('Accessibility & usage rules', '.kobos-field-option'));
  const list = document.createElement('ul');
  list.style.marginLeft = '20px';
  list.style.paddingLeft = '0';
  list.style.lineHeight = '1.7';
  const rules = [
    'Checkbox: use for multiple selections or single boolean — never when only one option is allowed (use Radio instead).',
    'Radio: use when one option must be selected from a small visible set — use Select for many options.',
    'Switch: use for persistent on/off settings — do not use for destructive actions requiring confirmation.',
    'Focus state uses info/default 2px ring on all three controls — always visible for keyboard navigation.',
    'Error states must include helper message text — never rely on color alone (red border is not enough).',
    'Disabled and permission denied must be visually distinct — permission denied should explain why access is limited.',
    'Switch state must be communicated by label text, not color alone — \'Cost locked\' is on/off, not just green/gray.',
    'Radio groups must have a visible group label — users must understand what the options belong to.',
    'Loading switch changes must show visual indicator and prevent repeated toggles during async operations.',
    'Touch targets should remain comfortable for shop-floor devices — minimum 44×44px recommended.'
  ];
  rules.forEach(rule => {
    const li = document.createElement('li');
    li.textContent = rule;
    list.appendChild(li);
  });
  container.appendChild(list);
}

const renderers = {
  'color-system': renderColorSystem,
  'business-colors': renderBusinessColors,
  'typography': renderTypography,
  'radius-elevation': renderRadiusElevation,
  'spacing': renderSpacing,
  'buttons': renderButtons,
  'inputs': renderInputs,
  'select': renderSelect,
  'checkbox': renderCheckbox,
  'badges': renderBadges,
  'cards': renderCards
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

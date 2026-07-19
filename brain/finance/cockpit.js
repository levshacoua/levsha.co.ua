const HELP_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>';
const THESIS_ENDPOINT = "https://brain.levsha.co.ua/finance/thesis";
const JOURNAL_ENDPOINT = "https://brain.levsha.co.ua/finance/journal";
const SETTINGS_ENDPOINT = "https://brain.levsha.co.ua/finance/settings";
const WATCHLIST_ENDPOINT = "https://brain.levsha.co.ua/finance/watchlist";
const DISCOVERY_ENDPOINT = "https://brain.levsha.co.ua/finance/discover";
const THESIS_PASSWORD_HEADER = "X-Finance-Gate-Password";
const JOURNAL_PASSWORD_HEADER = THESIS_PASSWORD_HEADER;
const SETTINGS_PASSWORD_HEADER = THESIS_PASSWORD_HEADER;
const WATCHLIST_PASSWORD_HEADER = THESIS_PASSWORD_HEADER;
const DISCOVERY_PASSWORD_HEADER = THESIS_PASSWORD_HEADER;
const TOOLTIP_EDGE_GAP = 8;
const JOURNAL_ACTION_OPTIONS = ["buy", "sell", "deposit", "dividend"];
const THESIS_STATUS_OPTIONS = [
  "strengthening",
  "valid",
  "mixed",
  "weakening",
  "invalidated",
  "insufficient-evidence",
];
const THESIS_TREND_OPTIONS = ["up", "flat", "down"];
const WATCHLIST_STATUS_OPTIONS = ["watching", "promoted", "dropped"];
const COCKPIT_VIEWS = ["dashboard", "theses", "dependency-map", "bottlenecks", "watchlist"];
const DEFAULT_COCKPIT_VIEW = "dashboard";
const SVG_NS = "http://www.w3.org/2000/svg";
const BOTTLENECK_DRAG_THRESHOLD_PX = 4;
const BOTTLENECK_LIFECYCLES = [
  "emerging",
  "accelerating",
  "entrenched",
  "peaking",
  "weakening",
  "resolved",
  "displaced",
];
const BOTTLENECK_SCORE_LABELS = {
  criticality: "критичність",
  supplier_concentration: "концентрація постачальників",
  substitution_difficulty: "складність заміни",
  capacity_lead_time: "строк нарощування потужностей",
  demand_growth: "зростання попиту",
  pricing_power: "цінова влада",
};
const BOTTLENECK_TYPE_LABELS = {
  capacity: "потужності",
  "capacity-constraint": "обмеження потужностей",
  monopoly: "монополія",
  "scarce-material": "дефіцитна сировина",
  "long-lead-time": "довгий строк",
  "supplier-concentration": "концентрація постачальників",
  regulatory: "регуляторне",
  ip: "інтелектуальна власність",
  geographic: "географічне",
};
const BOTTLENECK_LIFECYCLE_LABELS = {
  accelerating: "прискорюється",
  entrenched: "усталене",
  emerging: "виникає",
  peaking: "пік",
  weakening: "послаблюється",
  resolved: "усунене",
  displaced: "витіснене",
};
const BOTTLENECK_MONETIZATION_LABELS = {
  clear: "ясна",
  partial: "часткова",
  unclear: "неясна",
};
let gatePassword = "";
let tooltipId = 0;
let currentSnapshot = null;
let autopayState = { weekly_autopay_active: true, weekly_contribution_usd: 50 };
let bottleneckView = { scale: 1, x: 0, y: 0, selectedId: null, nodes: [], edges: [] };
let bottleneckPointer = null;

const SUMMARY_HELP = {
  "Equity Value": "Сумарна вартість портфеля акцій",
  "Crypto Value": "Сумарна вартість крипто-портфеля",
  "Equity Invested": "Чистий капітал з кишені в акціях: купівлі мінус продажі з журналу",
  "Crypto Invested": "Чистий капітал з кишені в крипто: внесений invested_usd мінус крипто-продажі; рахується окремо від акцій",
  "Кеш на рахунку": "Реальний кеш на рахунку Robinhood зараз",
  "Щотижневий внесок": "Автоплатіж $50 щопʼятниці — додається до кешу коли надходить",
  "Доступно цього циклу": "Реальний кеш, який можна розмістити цього циклу без урахування рекомендованих продажів",
};

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const km = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 200000, hash: "SHA-256" },
    km,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

function b64(value) {
  return Uint8Array.from(atob(value), char => char.charCodeAt(0));
}

async function decryptSnapshot(password) {
  const envelope = await (await fetch("finance.enc.json", { cache: "no-store" })).json();
  const key = await deriveKey(password, b64(envelope.salt));
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64(envelope.iv) },
    key,
    b64(envelope.ciphertext)
  );
  return JSON.parse(new TextDecoder().decode(plaintext));
}

function reveal() {
  document.getElementById("password-gate").style.display = "none";
  document.getElementById("cockpit").style.display = "block";
  showCurrentView();
  resetTransactionForm();
  setWatchlistReadOnly(false);
  setDiscoveryReadOnly(false);
}

async function unlock() {
  const password = document.getElementById("password-input").value.trim();
  if (!password) return;
  const err = document.getElementById("error-msg");
  err.style.display = "none";
  try {
    const snapshot = await decryptSnapshot(password);
    gatePassword = password;
    render(snapshot);
    reveal();
  } catch (e) {
    err.style.display = "block";
  }
}

function render(snapshot) {
  currentSnapshot = snapshot;
  autopayState = autopayValuesFromSnapshot(snapshot);
  decorateHelpLabels();
  setupAutopayControl(snapshot);
  setupTransactionForm();
  setupWatchlistForm();
  setupDiscoveryRun();
  renderMeta(snapshot);
  renderMetrics(snapshot);
  renderEquities(snapshot.equity_portfolio.positions);
  renderCrypto(snapshot.crypto.positions);
  renderTheses(snapshot.theses);
  renderWatchlist(snapshot.watchlist || []);
  renderBottlenecks(snapshot.bottlenecks || { nodes: [], edges: [] });
  renderDependencyCandidates(snapshot);
  renderDiscovery(snapshot.discovery || { last_run: "", trends: [], buy_recs: [] });
  renderRecommendation(snapshot.weekly_recommendation.positions);
}

function renderMeta(snapshot) {
  const portfolio = snapshot.equity_portfolio;
  document.getElementById("snapshot-meta").textContent =
    `${formatDate(snapshot.generated_at)} · ${portfolio.market_mode} · thesis fields editable`;
}

function renderMetrics(snapshot) {
  const portfolio = snapshot.equity_portfolio;
  const crypto = snapshot.crypto;
  const cashAvailable = money(portfolio.cash_available);
  const recommendedSellProceeds = money(
    portfolio.recommended_sell_proceeds ?? portfolio.total_sell_cash
  );
  const deployableIfSellsExecuted = money(
    portfolio.deployable_if_sells_executed ?? portfolio.available_buy_cash
  );
  const metrics = [
    { label: "Equity Value", value: money(portfolio.total_value) },
    { label: "Crypto Value", value: money(crypto.total_value) },
    { label: "Equity Invested", value: money(portfolio.equity_invested_net) },
    { label: "Crypto Invested", value: money(crypto.invested_net) },
    { label: "Кеш на рахунку", value: cashAvailable },
    { label: "Щотижневий внесок", value: money(weeklyContributionMetricValue(snapshot)) },
    {
      label: "Доступно цього циклу",
      value: cashAvailable,
      secondary: `+${recommendedSellProceeds} якщо виконаєш рекомендовані продажі`,
      help: `${SUMMARY_HELP["Доступно цього циклу"]}. Умовно доступно після рекомендованих продажів: ${deployableIfSellsExecuted}`,
    },
  ];
  const root = document.getElementById("metrics");
  root.replaceChildren(...metrics.map(metric => {
    const item = document.createElement("div");
    item.className = "metric";
    item.append(
      labelWithHelp(metric.label, metric.help || SUMMARY_HELP[metric.label]),
      el("div", "value", metric.value)
    );
    if (metric.secondary) {
      item.append(el("div", "secondary", metric.secondary));
    }
    return item;
  }));
}

function weeklyContributionMetricValue(snapshot) {
  const state = snapshot === currentSnapshot ? autopayState : autopayValuesFromSnapshot(snapshot);
  return state.weekly_autopay_active ? state.weekly_contribution_usd : 0;
}

function renderEquities(rows) {
  const body = document.getElementById("equity-body");
  body.replaceChildren(...rows.map(row => tr([
    row.ticker,
    money(row.value),
    money(row.cost_basis),
    coloredMoney(row.unrealized_pnl),
    coloredMoney(row.realized_pnl),
    pct(row.weight_pct),
    coloredPct(row.deviation_pct),
    signalPill(row.latest_signal),
  ], [1, 2, 3, 4, 5, 6])));
}

function renderCrypto(rows) {
  const body = document.getElementById("crypto-body");
  body.replaceChildren(...rows.map(row => tr([
    row.symbol,
    number(row.amount, 8),
    money(row.invested_usd),
    money(row.value),
    coloredMoney(row.pnl),
    coloredPct(row.drawdown_pct),
    pill(row.status),
  ], [1, 2, 3, 4, 5])));
}

function renderTheses(rows) {
  const root = document.getElementById("theses");
  root.replaceChildren(...rows.map(row => {
    const card = document.createElement("article");
    card.className = "thesis-card";
    card.dataset.thesisId = row.id;
    const meta = document.createElement("div");
    meta.className = "meta";
    renderThesisMeta(meta, row);
    card.append(
      el("h3", "", row.title),
      meta,
      thesisEditForm(row, card, meta),
      el("div", "risk", row.key_risk)
    );
    return card;
  }));
}

function renderThesisMeta(meta, row) {
  meta.replaceChildren(
    pill(row.status),
    pill(`${row.conviction}/5 ${row.conviction_trend}`),
    pill(row.horizon),
    pill(row.linked_tickers.join(", "))
  );
}

function thesisEditForm(row, card, meta) {
  const form = document.createElement("form");
  form.className = "thesis-edit";
  form.append(
    thesisField("Conviction", numberSelect("conviction", row.conviction, [1, 2, 3, 4, 5])),
    thesisField("Status", optionSelect("status", row.status, THESIS_STATUS_OPTIONS)),
    thesisField("Trend", optionSelect("conviction_trend", row.conviction_trend, THESIS_TREND_OPTIONS)),
    thesisField("Horizon", horizonInput(row.horizon))
  );

  const actions = document.createElement("div");
  actions.className = "thesis-actions";
  const save = document.createElement("button");
  save.type = "submit";
  save.textContent = "Save";
  const state = el("span", "thesis-save-state", "");
  state.setAttribute("role", "status");
  actions.append(save, state);
  form.append(actions);

  form.addEventListener("submit", event => {
    event.preventDefault();
    saveThesisEdit(row, form, card, meta, save, state);
  });

  return form;
}

function thesisField(label, control) {
  const wrapper = document.createElement("label");
  wrapper.className = "thesis-field";
  wrapper.append(el("span", "", label), control);
  return wrapper;
}

function numberSelect(name, value, options) {
  const select = optionSelect(name, String(value), options.map(option => String(option)));
  select.inputMode = "numeric";
  return select;
}

function optionSelect(name, value, options) {
  const select = document.createElement("select");
  select.name = name;
  select.required = true;
  options.forEach(optionValue => {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = optionValue;
    option.selected = optionValue === String(value);
    select.append(option);
  });
  return select;
}

function horizonInput(value) {
  const input = document.createElement("input");
  input.name = "horizon";
  input.type = "text";
  input.maxLength = 40;
  input.required = true;
  input.value = value || "";
  return input;
}

async function saveThesisEdit(row, form, card, meta, saveButton, state) {
  if (!gatePassword) {
    setThesisState(card, state, "error", "Unlock again before saving.");
    return;
  }

  const previous = thesisEditableSnapshot(row);
  const draft = thesisEditableValues(form);
  Object.assign(row, draft);
  renderThesisMeta(meta, row);
  setThesisControlsDisabled(form, saveButton, true);
  setThesisState(card, state, "saving", "Saving...");

  try {
    const response = await fetch(THESIS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [THESIS_PASSWORD_HEADER]: gatePassword,
      },
      body: JSON.stringify(thesisPayload(row.id, draft)),
    });
    if (!response.ok) {
      throw new Error(await responseErrorMessage(response));
    }
    Object.assign(row, draft);
    setThesisState(card, state, "saved", "Saved");
  } catch (error) {
    Object.assign(row, previous);
    applyThesisValues(form, previous);
    renderThesisMeta(meta, row);
    setThesisState(card, state, "error", error.message || "Save failed");
  } finally {
    setThesisControlsDisabled(form, saveButton, false);
  }
}

function thesisEditableSnapshot(row) {
  return {
    conviction: Number(row.conviction),
    status: row.status,
    conviction_trend: row.conviction_trend,
    horizon: row.horizon || "",
  };
}

function thesisEditableValues(form) {
  return {
    conviction: Number(form.elements.conviction.value),
    status: form.elements.status.value,
    conviction_trend: form.elements.conviction_trend.value,
    horizon: form.elements.horizon.value.trim(),
  };
}

function thesisPayload(thesis, values) {
  return {
    thesis,
    conviction: values.conviction,
    status: values.status,
    conviction_trend: values.conviction_trend,
    horizon: values.horizon,
  };
}

function applyThesisValues(form, values) {
  form.elements.conviction.value = String(values.conviction);
  form.elements.status.value = values.status;
  form.elements.conviction_trend.value = values.conviction_trend;
  form.elements.horizon.value = values.horizon;
}

function setThesisControlsDisabled(form, saveButton, disabled) {
  [...form.elements].forEach(control => {
    control.disabled = disabled;
  });
  saveButton.disabled = disabled;
}

function setThesisState(card, state, status, message) {
  card.dataset.saveStatus = status;
  state.textContent = message;
}

function setupAutopayControl(snapshot) {
  const control = document.getElementById("autopay-control");
  const activeInput = document.getElementById("autopay-active");
  const amountInput = document.getElementById("autopay-amount");
  if (!control || !activeInput || !amountInput) return;

  applyAutopayValues(autopayValuesFromSnapshot(snapshot));
  if (control.dataset.ready === "true") return;
  control.dataset.ready = "true";

  activeInput.addEventListener("change", () => persistAutopaySettings());
  amountInput.addEventListener("blur", () => persistAutopaySettings());
  amountInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      amountInput.blur();
    }
  });
}

function autopayValuesFromSnapshot(snapshot) {
  return {
    weekly_autopay_active: snapshot.weekly_autopay_active ?? true,
    weekly_contribution_usd: Number(
      snapshot.weekly_contribution_usd ?? snapshot.equity_portfolio?.weekly_contribution ?? 50
    ),
  };
}

function autopayValuesFromControls() {
  return {
    weekly_autopay_active: document.getElementById("autopay-active").checked,
    weekly_contribution_usd: numberOrZero(document.getElementById("autopay-amount").value),
  };
}

function autopayPayload(values) {
  return {
    weekly_autopay_active: Boolean(values.weekly_autopay_active),
    weekly_contribution_usd: Number(values.weekly_contribution_usd),
  };
}

function applyAutopayValues(values) {
  autopayState = autopayPayload(values);
  const activeInput = document.getElementById("autopay-active");
  const amountInput = document.getElementById("autopay-amount");
  if (activeInput) activeInput.checked = autopayState.weekly_autopay_active;
  if (amountInput) amountInput.value = formatAmountInput(autopayState.weekly_contribution_usd);
}

async function persistAutopaySettings() {
  const control = document.getElementById("autopay-control");
  const state = document.getElementById("autopay-state");
  if (!gatePassword) {
    setAutopayState(control, state, "error", "Unlock again before saving.");
    applyAutopayValues(autopayState);
    return;
  }

  const previous = { ...autopayState };
  const draft = autopayValuesFromControls();
  if (!Number.isFinite(draft.weekly_contribution_usd) || draft.weekly_contribution_usd < 0) {
    setAutopayState(control, state, "error", "Amount must be non-negative.");
    applyAutopayValues(previous);
    return;
  }

  const payload = autopayPayload(draft);
  if (
    payload.weekly_autopay_active === previous.weekly_autopay_active &&
    payload.weekly_contribution_usd === previous.weekly_contribution_usd
  ) {
    return;
  }

  applyAutopayValues(payload);
  if (currentSnapshot) renderMetrics(currentSnapshot);
  setAutopayControlsDisabled(true);
  setAutopayState(control, state, "saving", "Saving...");

  try {
    const response = await fetch(SETTINGS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [SETTINGS_PASSWORD_HEADER]: gatePassword,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(await responseErrorMessage(response));
    }
    setAutopayState(control, state, "saved", "Saved");
  } catch (error) {
    applyAutopayValues(previous);
    if (currentSnapshot) renderMetrics(currentSnapshot);
    setAutopayState(control, state, "error", error.message || "Save failed");
  } finally {
    setAutopayControlsDisabled(false);
  }
}

function setAutopayControlsDisabled(disabled) {
  ["autopay-active", "autopay-amount"].forEach(id => {
    const control = document.getElementById(id);
    if (control) control.disabled = disabled;
  });
}

function setAutopayState(control, state, status, message) {
  if (control) control.dataset.saveStatus = status;
  if (state) state.textContent = message;
}

function setupTransactionForm() {
  const form = document.getElementById("transaction-form");
  if (!form || form.dataset.ready === "true") return;

  form.dataset.ready = "true";
  const action = form.elements.action;
  action.addEventListener("change", () => updateTransactionFields(form));
  form.addEventListener("submit", event => {
    event.preventDefault();
    submitTransaction(form);
  });
  resetTransactionForm();
}

function resetTransactionForm() {
  const form = document.getElementById("transaction-form");
  if (!form) return;
  form.reset();
  form.elements.date.value = todayIsoDate();
  updateTransactionFields(form);
}

function updateTransactionFields(form) {
  const action = form.elements.action.value;
  const isDeposit = action === "deposit";
  const isTrade = action === "buy" || action === "sell";
  const isDividend = action === "dividend";

  form.elements.ticker.disabled = isDeposit;
  form.elements.ticker.required = !isDeposit;
  if (isDeposit) form.elements.ticker.value = "";

  form.elements.shares.required = isTrade;
  form.elements.price.required = isTrade;
  form.elements.amount_usd.required = isTrade || isDeposit || isDividend;
}

async function submitTransaction(form) {
  const state = document.getElementById("transaction-state");
  const submit = document.getElementById("transaction-submit");
  if (!gatePassword) {
    setTransactionState(form, state, "error", "Unlock again before posting.");
    return;
  }

  const draft = transactionValues(form);
  const validation = validateJournalDraft(draft);
  if (!validation.ok) {
    setTransactionState(form, state, "error", validation.error);
    return;
  }

  const payload = journalPayload(draft);
  setTransactionControlsDisabled(form, submit, true);
  setTransactionState(form, state, "saving", "Saving...");

  try {
    const response = await fetch(JOURNAL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [JOURNAL_PASSWORD_HEADER]: gatePassword,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(await responseErrorMessage(response));
    }
    resetTransactionForm();
    setTransactionState(
      form,
      state,
      "saved",
      "Saved. It will appear here after the backend rebuilds and redeploys."
    );
  } catch (error) {
    setTransactionState(form, state, "error", error.message || "Save failed");
  } finally {
    setTransactionControlsDisabled(form, submit, false);
  }
}

function transactionValues(form) {
  return {
    action: form.elements.action.value,
    date: form.elements.date.value,
    ticker: form.elements.ticker.value,
    shares: form.elements.shares.value,
    price: form.elements.price.value,
    amount_usd: form.elements.amount_usd.value,
  };
}

function validateJournalDraft(values) {
  const action = String(values.action || "").trim();
  if (!JOURNAL_ACTION_OPTIONS.includes(action)) {
    return { ok: false, error: "Choose a valid action." };
  }
  if (!isIsoDate(values.date)) {
    return { ok: false, error: "Use an ISO date." };
  }
  if (action !== "deposit" && !String(values.ticker || "").trim()) {
    return { ok: false, error: "Ticker is required." };
  }

  const requiredNumbers = ["amount_usd"];
  if (action === "buy" || action === "sell") {
    requiredNumbers.push("shares", "price");
  }

  for (const field of requiredNumbers) {
    if (String(values[field] ?? "").trim() === "") {
      return { ok: false, error: `${field} is required.` };
    }
  }

  for (const field of ["shares", "price", "amount_usd"]) {
    const raw = String(values[field] ?? "").trim();
    if (raw === "") continue;
    if (!isNonNegativeNumber(raw)) {
      return { ok: false, error: `${field} must be non-negative.` };
    }
  }

  return { ok: true, error: "" };
}

function journalPayload(values) {
  const action = String(values.action).trim();
  const payload = {
    date: String(values.date).trim(),
    action,
    shares: numberOrZero(values.shares),
    price: numberOrZero(values.price),
    amount_usd: numberOrZero(values.amount_usd),
  };
  if (action !== "deposit") {
    payload.ticker = String(values.ticker || "").trim().toUpperCase();
  }
  return payload;
}

function numberOrZero(value) {
  const raw = String(value ?? "").trim();
  return raw === "" ? 0 : Number(raw);
}

function isNonNegativeNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0;
}

function isIsoDate(value) {
  const text = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const date = new Date(`${text}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === text;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function setTransactionControlsDisabled(form, submitButton, disabled) {
  [...form.elements].forEach(control => {
    control.disabled = disabled;
  });
  if (!disabled) updateTransactionFields(form);
  submitButton.disabled = disabled;
}

function setTransactionState(form, state, status, message) {
  form.dataset.saveStatus = status;
  state.textContent = message;
}

function setupWatchlistForm() {
  const form = document.getElementById("watchlist-form");
  if (!form || form.dataset.ready === "true") return;

  form.dataset.ready = "true";
  form.addEventListener("submit", event => {
    event.preventDefault();
    submitWatchlist(form);
  });
  resetWatchlistForm();
  setWatchlistReadOnly(!gatePassword);
}

function resetWatchlistForm() {
  const form = document.getElementById("watchlist-form");
  if (!form) return;
  form.reset();
  form.elements.status.value = "watching";
}

async function submitWatchlist(form) {
  const state = document.getElementById("watchlist-state");
  const submit = document.getElementById("watchlist-submit");
  if (!gatePassword) {
    setWatchlistState(form, state, "error", "Розблокуй cockpit ще раз перед збереженням.");
    setWatchlistReadOnly(true);
    return;
  }

  const draft = watchlistValues(form);
  const validation = validateWatchlistDraft(draft);
  if (!validation.ok) {
    setWatchlistState(form, state, "error", validation.error);
    return;
  }

  const payload = watchlistPayload(draft);
  setWatchlistControlsDisabled(form, submit, true);
  setWatchlistState(form, state, "saving", "Зберігаю...");

  try {
    const response = await fetch(WATCHLIST_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [WATCHLIST_PASSWORD_HEADER]: gatePassword,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(await responseErrorMessage(response));
    }
    appendWatchlistRow(payload);
    resetWatchlistForm();
    setWatchlistState(form, state, "saved", "Збережено.");
  } catch (error) {
    setWatchlistState(form, state, "error", error.message || "Не вдалося зберегти");
  } finally {
    setWatchlistControlsDisabled(form, submit, false);
  }
}

function watchlistValues(form) {
  return {
    ticker: form.elements.ticker.value,
    source: form.elements.source.value,
    status: form.elements.status.value,
  };
}

function validateWatchlistDraft(values) {
  if (!String(values.ticker || "").trim()) {
    return { ok: false, error: "Вкажи тікер або назву." };
  }
  if (!WATCHLIST_STATUS_OPTIONS.includes(String(values.status || "").trim())) {
    return { ok: false, error: "Обери коректний статус." };
  }
  return { ok: true, error: "" };
}

function watchlistPayload(values) {
  return {
    ticker: String(values.ticker || "").trim().toUpperCase(),
    source: String(values.source || "").trim() || "idea",
    status: String(values.status || "watching").trim(),
  };
}

function appendWatchlistRow(payload) {
  if (!currentSnapshot) return;
  const rows = [...(currentSnapshot.watchlist || [])];
  const existingIndex = rows.findIndex(row => row.ticker === payload.ticker);
  const row = {
    id: payload.ticker.toLowerCase().replace(/[^a-z0-9]+/g, "-") || payload.ticker,
    ticker: payload.ticker,
    thesis: "",
    bottleneck: "",
    source: payload.source,
    status: payload.status,
    held_position: watchlistTickerIsHeld(payload.ticker),
    linked_thesis: watchlistTickerHasThesis(payload.ticker),
  };
  if (existingIndex >= 0) rows.splice(existingIndex, 1, row);
  else rows.push(row);
  currentSnapshot.watchlist = sortWatchlistRows(rows);
  renderWatchlist(currentSnapshot.watchlist);
}

function watchlistTickerIsHeld(ticker) {
  return Boolean(
    currentSnapshot?.equity_portfolio?.positions?.some(position => position.ticker === ticker)
  );
}

function watchlistTickerHasThesis(ticker) {
  return Boolean(
    currentSnapshot?.theses?.some(thesis => (thesis.linked_tickers || []).includes(ticker))
  );
}

function sortWatchlistRows(rows) {
  return [...rows].sort((left, right) => (
    String(left.status || "").localeCompare(String(right.status || "")) ||
    String(left.ticker || "").localeCompare(String(right.ticker || "")) ||
    String(left.id || "").localeCompare(String(right.id || ""))
  ));
}

function setWatchlistControlsDisabled(form, submitButton, disabled) {
  [...form.elements].forEach(control => {
    control.disabled = disabled;
  });
  submitButton.disabled = disabled;
}

function setWatchlistReadOnly(readOnly) {
  const form = document.getElementById("watchlist-form");
  const submit = document.getElementById("watchlist-submit");
  if (!form || !submit) return;
  setWatchlistControlsDisabled(form, submit, readOnly);
}

function setWatchlistState(form, state, status, message) {
  form.dataset.saveStatus = status;
  state.textContent = message;
}

function renderWatchlist(rows) {
  const root = document.getElementById("watchlist");
  const empty = document.getElementById("watchlist-empty");
  if (!root || !empty) return;

  const sortedRows = sortWatchlistRows(rows || []);
  if (!sortedRows.length) {
    root.replaceChildren();
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  root.replaceChildren(...sortedRows.map(row => {
    const item = document.createElement("article");
    item.className = "watchlist-item";
    if (row.held_position) item.classList.add("is-held");
    if (row.linked_thesis) item.classList.add("has-thesis");

    const title = document.createElement("div");
    title.className = "watchlist-title";
    title.append(el("strong", "", row.ticker), watchlistFlags(row));

    item.append(
      title,
      el("p", "", watchlistNote(row)),
      watchlistMeta(row)
    );
    return item;
  }));
}

function watchlistNote(row) {
  const parts = [];
  if (row.thesis) parts.push(`теза: ${row.thesis}`);
  if (row.bottleneck) parts.push(`вузьке місце: ${row.bottleneck}`);
  return parts.join(" / ") || "Моніторити як можливу майбутню ставку.";
}

function watchlistFlags(row) {
  const flags = [];
  if (row.held_position) flags.push("у портфелі");
  if (row.linked_thesis) flags.push("теза");
  const meta = document.createElement("div");
  meta.className = "bottleneck-meta watchlist-flags";
  meta.replaceChildren(...flags.map(flag => pill(flag)));
  return meta;
}

function watchlistMeta(row) {
  const meta = document.createElement("div");
  meta.className = "bottleneck-meta";
  meta.replaceChildren(
    pill(row.status || "watching"),
    watchlistSourceBadge(row.source)
  );
  return meta;
}

function watchlistSourceBadge(source) {
  const normalized = String(source || "idea").trim();
  const token = normalized.toLowerCase();
  if (token === "bottleneck-scan" || token.includes("discovery")) {
    return pill("рекомендовано як bottleneck", "pill-signal-review");
  }
  return pill(normalized || "idea", "pill-signal-hold");
}

function setupDiscoveryRun() {
  const button = document.getElementById("discovery-run");
  if (!button || button.dataset.ready === "true") return;
  button.dataset.ready = "true";
  button.addEventListener("click", runDiscovery);
  setDiscoveryReadOnly(!gatePassword);
}

async function runDiscovery() {
  const button = document.getElementById("discovery-run");
  const state = document.getElementById("discovery-run-state");
  if (!button || !state) return;
  if (!gatePassword) {
    setDiscoveryState("error", "Розблокуй cockpit ще раз перед запуском.");
    setDiscoveryReadOnly(true);
    return;
  }

  button.disabled = true;
  setDiscoveryState("saving", "Запускаю...");
  try {
    const response = await fetch(DISCOVERY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [DISCOVERY_PASSWORD_HEADER]: gatePassword,
      },
      body: JSON.stringify({}),
    });
    if (response.status === 202) {
      setDiscoveryState(
        "saved",
        "Запущено. Ресьорч триває ~кілька хвилин — онови сторінку пізніше."
      );
      return;
    }
    if (response.status === 409) {
      setDiscoveryState("saved", "Вже виконується.");
      return;
    }
    throw new Error(await responseErrorMessage(response));
  } catch (error) {
    setDiscoveryState("error", error.message || "Не вдалося запустити ресьорч");
  } finally {
    button.disabled = !gatePassword;
  }
}

function setDiscoveryReadOnly(readOnly) {
  const button = document.getElementById("discovery-run");
  if (button) button.disabled = readOnly;
}

function setDiscoveryState(status, message) {
  const view = document.getElementById("view-bottlenecks");
  const state = document.getElementById("discovery-run-state");
  if (view) view.dataset.saveStatus = status;
  if (state) state.textContent = message;
}

function renderDiscovery(discovery) {
  renderDiscoveryLastRun(discovery.last_run);
  renderDiscoveryTrends(discovery.trends || []);
  renderDiscoveryBuyRecs(discovery.buy_recs || []);
}

function renderDiscoveryLastRun(lastRun) {
  const root = document.getElementById("discovery-last-run");
  if (!root) return;
  root.textContent = lastRun ? `Станом на ${lastRun}` : "Ще не запускалось";
}

function renderDiscoveryTrends(trends) {
  const root = document.getElementById("discovery-trends");
  if (!root) return;
  if (!trends.length) {
    root.replaceChildren(el("p", "muted", "Поки немає кешованих трендів."));
    return;
  }
  root.replaceChildren(...trends.map(trend => {
    const item = document.createElement("article");
    item.className = "discovery-trend";
    item.append(
      el("h3", "", trend.title || trend.id || "Тренд"),
      el("p", "", trend.note || "Нотатки ще немає.")
    );
    return item;
  }));
}

function renderDiscoveryBuyRecs(rows) {
  const root = document.getElementById("discovery-buy-recs");
  if (!root) return;
  if (!rows.length) {
    root.replaceChildren(el("p", "muted", "Поки немає кешованих buy-recommendations."));
    return;
  }
  root.replaceChildren(...rows.map(discoveryBuyRecCard));
}

function discoveryBuyRecCard(row) {
  const card = document.createElement("article");
  card.className = "discovery-buy-rec";
  if (row.held_position || row.held) card.classList.add("is-held");

  const title = document.createElement("div");
  title.className = "discovery-buy-rec-title";
  title.append(el("strong", "", row.ticker || "Кандидат"), discoveryBuyRecMeta(row));

  card.append(
    title,
    el("p", "", row.rationale || row.note || ""),
    sourceLinks(row.source_urls || row.sources || [])
  );
  return card;
}

function discoveryBuyRecMeta(row) {
  const meta = document.createElement("div");
  meta.className = "bottleneck-meta";
  const items = [];
  if (row.trend) items.push(row.trend);
  if (row.chokepoint || row.bottleneck) items.push(row.chokepoint || row.bottleneck);
  const score = row.beneficiary_probability_pct ?? row.beneficiary_pct ?? row.probability_pct;
  if (score !== undefined && score !== null && score !== "") items.push(`${score}%`);
  if (row.held_position || row.held) items.push("у портфелі");
  if (row.in_watchlist) items.push("у Watchlist");
  meta.replaceChildren(...items.map(item => pill(item)));
  return meta;
}

function sourceLinks(urls) {
  const list = Array.isArray(urls) ? urls : [urls].filter(Boolean);
  const root = document.createElement("div");
  root.className = "source-links";
  if (!list.length) {
    root.append(el("span", "muted", "Джерела не вказані."));
    return root;
  }
  root.append(el("span", "source-links-label", "Джерела:"));
  list.forEach((url, index) => {
    const link = document.createElement("a");
    link.href = String(url);
    link.textContent = `джерело ${index + 1}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    root.append(link);
  });
  return root;
}

function renderBottlenecks(graph) {
  const nodes = [...(graph.nodes || [])].sort(
    (left, right) => Number(right.composite_strength) - Number(left.composite_strength)
  );
  const edges = graph.edges || [];
  bottleneckView.nodes = nodes;
  bottleneckView.edges = edges;
  if (!bottleneckView.selectedId || !nodes.some(node => node.id === bottleneckView.selectedId)) {
    bottleneckView.selectedId = nodes[0]?.id || null;
  }

  const empty = document.getElementById("bottleneck-empty");
  const shell = document.querySelector(".bottleneck-shell");
  const list = document.getElementById("bottleneck-list");
  if (!nodes.length) {
    if (empty) empty.hidden = false;
    if (shell) shell.hidden = true;
    if (list) list.replaceChildren();
    return;
  }
  if (empty) empty.hidden = true;
  if (shell) shell.hidden = false;

  renderBottleneckGraph(nodes, edges);
  renderBottleneckLegend(nodes, edges);
  renderBottleneckDetail(nodes.find(node => node.id === bottleneckView.selectedId) || nodes[0]);
  renderBottleneckList(nodes);
  setupBottleneckControls();
}

function renderDependencyCandidates(snapshot) {
  const root = document.getElementById("dependency-candidates");
  if (!root) return;
  const candidates = dependencyCandidatesFromSnapshot(snapshot);
  if (!candidates.length) {
    root.replaceChildren(el("p", "muted", "Поки немає не-портфельних кандидатів у snapshot."));
    return;
  }
  root.replaceChildren(...candidates.map(dependencyCandidateRow));
}

function dependencyCandidatesFromSnapshot(snapshot) {
  const directCandidates = snapshot?.dependency_candidates;
  const discoveryCandidates = snapshot?.discovery?.candidates;
  const candidates = Array.isArray(directCandidates) ? directCandidates : discoveryCandidates;
  return Array.isArray(candidates) ? candidates : [];
}

function dependencyCandidateRow(candidate) {
  const item = document.createElement("article");
  item.className = "dependency-candidate";
  if (candidate.held_position || candidate.held) item.classList.add("is-held");
  const title = candidate.ticker || candidate.name || candidate.title || "Кандидат";
  const score = candidate.score ?? candidate.beneficiary_probability_pct ?? candidate.probability_pct;
  const state = el("span", "dependency-candidate-state", "");
  state.setAttribute("role", "status");
  const actions = document.createElement("div");
  actions.className = "dependency-candidate-actions";
  if (candidate.held_position || candidate.held) {
    actions.append(pill("у портфелі", "pill-signal-hold"));
  } else {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = candidate.in_watchlist ? "у Watchlist" : "додати у Watchlist";
    button.disabled = !gatePassword || Boolean(candidate.in_watchlist);
    button.addEventListener("click", () => submitDependencyCandidateToWatchlist(candidate, button, state));
    actions.append(button);
  }
  if (candidate.linked_thesis) actions.append(pill("теза"));
  item.append(
    el("strong", "", title),
    el("p", "", candidate.note || candidate.reason || candidate.thesis || "")
  );
  if (score !== undefined && score !== null && score !== "") {
    item.append(pill(`${score}%`));
  }
  item.append(actions, state);
  return item;
}

async function submitDependencyCandidateToWatchlist(candidate, button, state) {
  if (!gatePassword) {
    state.textContent = "Розблокуй cockpit ще раз перед збереженням.";
    return;
  }
  const ticker = String(candidate.ticker || candidate.name || "").trim().toUpperCase();
  if (!ticker) {
    state.textContent = "Немає тікера для Watchlist.";
    return;
  }

  const payload = watchlistPayload({
    ticker,
    source: "bottleneck-scan",
    status: "watching",
  });
  button.disabled = true;
  state.textContent = "Зберігаю...";
  try {
    const response = await fetch(WATCHLIST_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [WATCHLIST_PASSWORD_HEADER]: gatePassword,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(await responseErrorMessage(response));
    }
    candidate.in_watchlist = true;
    button.textContent = "у Watchlist";
    appendWatchlistRow(payload);
    state.textContent = "Збережено.";
  } catch (error) {
    button.disabled = false;
    state.textContent = error.message || "Не вдалося зберегти";
  }
}

function renderBottleneckGraph(nodes, edges) {
  const svg = document.getElementById("bottleneck-graph");
  if (!svg) return;
  const width = Math.max(svg.clientWidth || 720, 320);
  const height = Math.max(svg.clientHeight || 460, 320);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const layout = bottleneckLayout(nodes, width, height);
  const defs = svgNode("defs");
  const marker = svgNode("marker", {
    id: "bottleneck-arrow",
    viewBox: "0 0 10 10",
    refX: "9",
    refY: "5",
    markerWidth: "6",
    markerHeight: "6",
    orient: "auto-start-reverse",
  });
  marker.append(svgNode("path", { d: "M 0 0 L 10 5 L 0 10 z", class: "bottleneck-arrow" }));
  defs.append(marker);

  const viewport = svgNode("g", {
    transform: `translate(${bottleneckView.x} ${bottleneckView.y}) scale(${bottleneckView.scale})`,
  });
  const edgeLayer = svgNode("g", { class: "bottleneck-edges" });
  edges.forEach(edge => {
    const from = layout.get(edge.from);
    const to = layout.get(edge.to);
    if (!from || !to) return;
    const path = svgNode("path", {
      class: "bottleneck-edge",
      d: edgePath(from, to),
      "marker-end": "url(#bottleneck-arrow)",
    });
    edgeLayer.append(path);
  });

  const nodeLayer = svgNode("g", { class: "bottleneck-nodes" });
  nodes.forEach(node => {
    const point = layout.get(node.id);
    const radius = 17 + (Number(node.composite_strength || 0) / 100) * 18;
    const group = svgNode("g", {
      class: `bottleneck-node lifecycle-${cssToken(node.lifecycle)}${node.id === bottleneckView.selectedId ? " is-selected" : ""}`,
      tabindex: "0",
      role: "button",
      "data-bottleneck-node": node.id,
      "aria-label": node.title,
      transform: `translate(${point.x} ${point.y})`,
    });
    group.append(
      svgNode("circle", { r: String(radius) }),
      svgText("text", nodeLabel(node.title), { y: String(radius + 17), "text-anchor": "middle" }),
      svgText("text", String(node.composite_strength), {
        y: "5",
        "text-anchor": "middle",
        class: "bottleneck-strength",
      })
    );
    group.addEventListener("click", () => selectBottleneck(node.id));
    group.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectBottleneck(node.id);
      }
    });
    nodeLayer.append(group);
  });

  viewport.append(edgeLayer, nodeLayer);
  svg.replaceChildren(defs, viewport);
  setupBottleneckPan(svg);
}

function renderBottleneckLegend(nodes, edges) {
  const root = document.getElementById("bottleneck-legend");
  if (!root) return;
  const usedLifecycles = new Set(nodes.map(node => node.lifecycle).filter(Boolean));
  const lifecycleItems = BOTTLENECK_LIFECYCLES.filter(lifecycle => usedLifecycles.has(lifecycle));
  const colorList = document.createElement("div");
  colorList.className = "bottleneck-legend-swatches";
  colorList.replaceChildren(...lifecycleItems.map(lifecycle => {
    const item = document.createElement("span");
    item.className = "bottleneck-legend-swatch-item";
    item.append(
      el("span", `bottleneck-legend-swatch lifecycle-${cssToken(lifecycle)}`, ""),
      bottleneckDisplay(BOTTLENECK_LIFECYCLE_LABELS, lifecycle)
    );
    return item;
  }));

  root.replaceChildren(
    bottleneckLegendItem("size", "Розмір вузла", "сила вузького місця (composite 0-100)"),
    bottleneckLegendItem("color", "Колір вузла", colorList),
    bottleneckLegendItem("line", "Лінія", `залежність (depends_on)${edges.length ? "" : " - у цьому snapshot немає"}`)
  );
}

function bottleneckLegendItem(kind, label, value) {
  const item = document.createElement("div");
  item.className = `bottleneck-legend-item is-${kind}`;
  const marker = document.createElement("span");
  marker.className = "bottleneck-legend-marker";
  const body = document.createElement("span");
  body.className = "bottleneck-legend-text";
  body.append(el("b", "", label), typeof value === "string" ? document.createTextNode(value) : value);
  item.append(marker, body);
  return item;
}

function bottleneckLayout(nodes, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusX = Math.max(110, width * 0.34);
  const radiusY = Math.max(90, height * 0.30);
  const layout = new Map();
  nodes.forEach((node, index) => {
    const angle = (-Math.PI / 2) + ((Math.PI * 2 * index) / Math.max(nodes.length, 1));
    layout.set(node.id, {
      x: centerX + Math.cos(angle) * radiusX,
      y: centerY + Math.sin(angle) * radiusY,
    });
  });
  return layout;
}

function edgePath(from, to) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  return `M ${from.x} ${from.y} Q ${midX} ${midY - 28} ${to.x} ${to.y}`;
}

function selectBottleneck(id) {
  bottleneckView.selectedId = id;
  renderBottleneckGraph(bottleneckView.nodes, bottleneckView.edges);
  renderBottleneckDetail(bottleneckView.nodes.find(node => node.id === id));
  renderBottleneckList(bottleneckView.nodes);
}

function renderBottleneckDetail(node) {
  const root = document.getElementById("bottleneck-detail");
  if (!root || !node) return;
  const scores = Object.entries(node.scores || {});
  const signals = node.disappearing_signals || [];
  const companies = [...(node.candidate_companies || [])].sort(
    (left, right) => Number(right.beneficiary_probability_pct) - Number(left.beneficiary_probability_pct)
  );
  root.replaceChildren(
    el("div", "bottleneck-kicker", `${bottleneckDisplay(BOTTLENECK_LIFECYCLE_LABELS, node.lifecycle)} / ${bottleneckDisplay(BOTTLENECK_TYPE_LABELS, node.type)}`),
    el("h3", "", node.title),
    bottleneckMetaRow([
      `${node.composite_strength}/100 сила`,
      `${bottleneckDisplay(BOTTLENECK_MONETIZATION_LABELS, node.monetization)} монетизація`,
    ]),
    bottleneckScores(scores),
    bottleneckSignals(signals),
    bottleneckCompanies(companies)
  );
}

function bottleneckMetaRow(items) {
  const row = document.createElement("div");
  row.className = "bottleneck-meta";
  row.replaceChildren(...items.map(item => pill(item)));
  return row;
}

function bottleneckScores(scores) {
  const section = document.createElement("section");
  section.className = "bottleneck-detail-section";
  section.append(el("h4", "", "Оцінки"));
  const grid = document.createElement("div");
  grid.className = "bottleneck-score-grid";
  scores.forEach(([name, value]) => {
    const item = document.createElement("div");
    item.className = "bottleneck-score";
    item.append(el("span", "", bottleneckDisplay(BOTTLENECK_SCORE_LABELS, name)), el("b", "", `${value}/5`));
    grid.append(item);
  });
  section.append(grid);
  return section;
}

function bottleneckSignals(signals) {
  const section = document.createElement("section");
  section.className = "bottleneck-detail-section";
  section.append(el("h4", "", "Сигнали зникнення"));
  const list = document.createElement("ul");
  list.replaceChildren(...signals.map(signal => {
    const item = document.createElement("li");
    item.textContent = signal;
    return item;
  }));
  section.append(list);
  return section;
}

function bottleneckCompanies(companies) {
  const section = document.createElement("section");
  section.className = "bottleneck-detail-section";
  section.append(el("h4", "", "Компанії-кандидати"));
  const list = document.createElement("div");
  list.className = "bottleneck-companies";
  if (!companies.length) {
    list.append(el("p", "muted", "Компаній-кандидатів поки немає."));
  }
  companies.forEach(company => {
    const item = document.createElement("article");
    item.className = "bottleneck-company";
    if (company.held_position) item.classList.add("is-held");
    if (company.linked_thesis) item.classList.add("has-thesis");
    item.append(
      el("strong", "", company.ticker),
      el("span", "bottleneck-company-probability", `${company.beneficiary_probability_pct}%`),
      el("p", "", company.note || "")
    );
    const flags = [];
    if (company.held_position) flags.push("у портфелі");
    if (company.linked_thesis) flags.push("теза");
    if (flags.length) item.append(bottleneckMetaRow(flags));
    list.append(item);
  });
  section.append(list);
  return section;
}

function renderBottleneckList(nodes) {
  const root = document.getElementById("bottleneck-list");
  if (!root) return;
  root.replaceChildren(...nodes.map(node => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "bottleneck-list-item";
    button.classList.toggle("is-selected", node.id === bottleneckView.selectedId);
    button.append(
      el("strong", "", node.title),
      el("span", "", `${node.composite_strength}/100 / ${bottleneckDisplay(BOTTLENECK_LIFECYCLE_LABELS, node.lifecycle)}`)
    );
    button.addEventListener("click", () => selectBottleneck(node.id));
    return button;
  }));
}

function setupBottleneckControls() {
  const zoomIn = document.getElementById("bottleneck-zoom-in");
  const zoomOut = document.getElementById("bottleneck-zoom-out");
  const reset = document.getElementById("bottleneck-zoom-reset");
  if (!zoomIn || zoomIn.dataset.ready === "true") return;
  zoomIn.dataset.ready = "true";
  zoomOut.dataset.ready = "true";
  reset.dataset.ready = "true";
  zoomIn.addEventListener("click", () => zoomBottleneckGraph(1.18));
  zoomOut.addEventListener("click", () => zoomBottleneckGraph(0.84));
  reset.addEventListener("click", resetBottleneckGraph);
  window.addEventListener("resize", () => renderBottleneckGraph(bottleneckView.nodes, bottleneckView.edges));
}

function setupBottleneckPan(svg) {
  if (svg.dataset.panReady === "true") return;
  svg.dataset.panReady = "true";
  svg.addEventListener("pointerdown", event => {
    if (event.button !== undefined && event.button !== 0) return;
    bottleneckPointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      viewX: bottleneckView.x,
      viewY: bottleneckView.y,
      dragged: false,
      targetId: bottleneckNodeIdFromTarget(event.target),
    };
  });
  svg.addEventListener("pointermove", event => {
    if (!bottleneckPointer || bottleneckPointer.id !== event.pointerId) return;
    const dx = event.clientX - bottleneckPointer.x;
    const dy = event.clientY - bottleneckPointer.y;
    if (!bottleneckPointer.dragged) {
      if (Math.hypot(dx, dy) < BOTTLENECK_DRAG_THRESHOLD_PX) return;
      bottleneckPointer.dragged = true;
      svg.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    bottleneckView.x = bottleneckPointer.viewX + dx;
    bottleneckView.y = bottleneckPointer.viewY + dy;
    renderBottleneckGraph(bottleneckView.nodes, bottleneckView.edges);
  });
  svg.addEventListener("pointerup", event => {
    if (!bottleneckPointer || bottleneckPointer.id !== event.pointerId) return;
    const pointer = bottleneckPointer;
    bottleneckPointer = null;
    if (pointer.dragged) return;
    const id = bottleneckNodeIdFromTarget(event.target) || pointer.targetId;
    if (id) selectBottleneck(id);
  });
  svg.addEventListener("pointercancel", event => {
    if (bottleneckPointer?.id === event.pointerId) bottleneckPointer = null;
  });
  svg.addEventListener("wheel", event => {
    event.preventDefault();
    zoomBottleneckGraph(event.deltaY < 0 ? 1.08 : 0.92);
  }, { passive: false });
}

function bottleneckNodeIdFromTarget(target) {
  const node = target instanceof Element ? target.closest("[data-bottleneck-node]") : null;
  return node?.dataset.bottleneckNode || node?.id || null;
}

function zoomBottleneckGraph(factor) {
  bottleneckView.scale = clamp(bottleneckView.scale * factor, 0.55, 2.6);
  renderBottleneckGraph(bottleneckView.nodes, bottleneckView.edges);
}

function resetBottleneckGraph() {
  bottleneckView.scale = 1;
  bottleneckView.x = 0;
  bottleneckView.y = 0;
  renderBottleneckGraph(bottleneckView.nodes, bottleneckView.edges);
}

function bottleneckDisplay(labels, value) {
  return labels[value] || String(value || "").replaceAll("_", " ");
}

function svgNode(tag, attributes = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function svgText(tag, text, attributes = {}) {
  const node = svgNode(tag, attributes);
  node.textContent = text;
  return node;
}

function nodeLabel(title) {
  const words = String(title || "").split(/\s+/).filter(Boolean);
  return words.slice(0, 4).join(" ");
}

function cssToken(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

async function responseErrorMessage(response) {
  try {
    const body = await response.json();
    if (body && typeof body.detail === "string") return body.detail;
    if (body && typeof body.message === "string") return body.message;
  } catch (e) {}
  return `Save failed (${response.status})`;
}

function renderRecommendation(rows) {
  const body = document.getElementById("recommendation-body");
  body.replaceChildren(...rows.map(row => tr([
    row.ticker,
    pct(row.current_allocation),
    pct(row.target_allocation),
    coloredPct(row.delta),
    signalPill(row.advisory === "review" ? "REVIEW" : row.recommended_action),
    money(row.recommended_dollar_amount),
    number(row.recommended_share_quantity, 4),
    row.rule,
    pill(row.approval_status),
  ], [1, 2, 3, 5, 6])));
}

function tr(values, numericIndexes = []) {
  const row = document.createElement("tr");
  values.forEach((value, index) => {
    const cell = document.createElement("td");
    if (numericIndexes.includes(index)) cell.className = "num";
    if (value instanceof Node) cell.append(value);
    else cell.textContent = value;
    row.append(cell);
  });
  return row;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

function labelWithHelp(label, tooltip) {
  const node = el("div", "label help-label", "");
  node.append(document.createTextNode(label), helpTip(tooltip));
  return node;
}

function decorateHelpLabels() {
  document.querySelectorAll("[data-help]").forEach(node => {
    if (node.querySelector(".help-tip")) return;
    const tooltip = node.getAttribute("data-help");
    node.append(helpTip(tooltip));
  });
}

function helpTip(text) {
  const wrapper = document.createElement("span");
  wrapper.className = "help-tip";
  wrapper.tabIndex = 0;
  wrapper.setAttribute("role", "img");
  wrapper.setAttribute("aria-label", text);
  wrapper.innerHTML = HELP_ICON;

  const tooltip = document.createElement("span");
  tooltip.className = "tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.id = `help-tooltip-${++tooltipId}`;
  tooltip.hidden = true;
  tooltip.textContent = text;
  wrapper.setAttribute("aria-describedby", tooltip.id);
  document.body.append(tooltip);

  const show = () => {
    tooltip.hidden = false;
    tooltip.classList.add("is-visible");
    positionTooltip(wrapper, tooltip);
  };
  const hide = () => {
    tooltip.classList.remove("is-visible", "tooltip-down");
    tooltip.hidden = true;
  };
  const reposition = () => {
    if (!tooltip.hidden) positionTooltip(wrapper, tooltip);
  };

  wrapper.addEventListener("mouseenter", show);
  wrapper.addEventListener("mouseleave", hide);
  wrapper.addEventListener("focus", show);
  wrapper.addEventListener("blur", hide);
  wrapper.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      wrapper.blur();
      hide();
    }
  });
  window.addEventListener("resize", reposition);
  window.addEventListener("scroll", reposition, true);
  return wrapper;
}

function positionTooltip(anchor, tooltip) {
  const anchorRect = anchor.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const gap = TOOLTIP_EDGE_GAP;
  const centeredLeft = anchorRect.left + (anchorRect.width / 2) - (tooltipRect.width / 2);
  const left = clamp(centeredLeft, gap, window.innerWidth - tooltipRect.width - gap);
  const aboveTop = anchorRect.top - tooltipRect.height - gap;
  const opensDown = aboveTop < gap;
  const top = opensDown
    ? anchorRect.bottom + gap
    : aboveTop;

  tooltip.classList.toggle("tooltip-down", opensDown);
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${Math.min(top, window.innerHeight - tooltipRect.height - gap)}px`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pill(text, extraClassName = "") {
  return el("span", ["pill", extraClassName].filter(Boolean).join(" "), text);
}

function signalPill(text) {
  const signal = String(text || "").trim().toUpperCase();
  const className = {
    BUY: "pill-signal-buy",
    SELL: "pill-signal-sell",
    HOLD: "pill-signal-hold",
    REVIEW: "pill-signal-review",
  }[signal] || "";
  return pill(signal || text, className);
}

function money(value) {
  return currency.format(Number(value || 0));
}

function coloredMoney(value) {
  return colored(money(value), Number(value || 0));
}

function pct(value) {
  return `${number(value, 2)}%`;
}

function coloredPct(value) {
  return colored(pct(value), Number(value || 0));
}

function colored(text, value) {
  const node = el("span", value > 0 ? "pos" : value < 0 ? "neg" : "", text);
  return node;
}

function number(value, digits) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

function formatAmountInput(value) {
  const numberValue = Number(value || 0);
  return Number.isInteger(numberValue) ? String(numberValue) : String(numberValue);
}

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function currentViewFromHash() {
  const rawHash = String(location.hash || "").replace(/^#/, "");
  return COCKPIT_VIEWS.includes(rawHash) ? rawHash : DEFAULT_COCKPIT_VIEW;
}

function ensureDefaultHash() {
  if (COCKPIT_VIEWS.includes(String(location.hash || "").replace(/^#/, ""))) return;
  location.replace(`#${DEFAULT_COCKPIT_VIEW}`);
}

function showCurrentView() {
  const currentView = currentViewFromHash();
  document.querySelectorAll("[data-view]").forEach(view => {
    view.hidden = view.dataset.view !== currentView;
  });
  document.querySelectorAll("[data-view-link]").forEach(link => {
    const isActive = link.dataset.viewLink === currentView;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

const currency = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

if (typeof document !== "undefined") {
  ensureDefaultHash();
  showCurrentView();
  window.addEventListener("hashchange", showCurrentView);
  document.getElementById("unlock-btn").addEventListener("click", unlock);
  document.getElementById("password-input").addEventListener("keydown", event => {
    if (event.key === "Enter") unlock();
  });
  document.getElementById("lock-btn").addEventListener("click", () => {
    gatePassword = "";
    location.reload();
  });
}

if (typeof module !== "undefined") {
  module.exports = {
    JOURNAL_ENDPOINT,
    JOURNAL_PASSWORD_HEADER,
    SETTINGS_ENDPOINT,
    SETTINGS_PASSWORD_HEADER,
    WATCHLIST_ENDPOINT,
    WATCHLIST_PASSWORD_HEADER,
    DISCOVERY_ENDPOINT,
    DISCOVERY_PASSWORD_HEADER,
    autopayPayload,
    journalPayload,
    validateWatchlistDraft,
    watchlistPayload,
    validateJournalDraft,
  };
}

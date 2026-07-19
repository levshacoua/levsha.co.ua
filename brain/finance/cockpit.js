const HELP_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>';
const THESIS_ENDPOINT = "https://brain.levsha.co.ua/finance/thesis";
const JOURNAL_ENDPOINT = "https://brain.levsha.co.ua/finance/journal";
const THESIS_PASSWORD_HEADER = "X-Finance-Gate-Password";
const JOURNAL_PASSWORD_HEADER = THESIS_PASSWORD_HEADER;
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
let gatePassword = "";
let tooltipId = 0;

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
  resetTransactionForm();
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
  decorateHelpLabels();
  setupTransactionForm();
  renderMeta(snapshot);
  renderMetrics(snapshot);
  renderEquities(snapshot.equity_portfolio.positions);
  renderCrypto(snapshot.crypto.positions);
  renderTheses(snapshot.theses);
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
    { label: "Щотижневий внесок", value: money(portfolio.weekly_contribution) },
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

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const currency = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

if (typeof document !== "undefined") {
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
    journalPayload,
    validateJournalDraft,
  };
}

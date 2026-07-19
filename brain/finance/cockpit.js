const LB_GATE_KEY = "lb_gate_pw";
const HELP_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>';

const SUMMARY_HELP = {
  "Equity Value": "Сумарна вартість портфеля акцій",
  "Crypto Value": "Сумарна вартість крипто-портфеля",
  "Кеш на рахунку": "Реальний кеш на рахунку Robinhood зараз",
  "Щотижневий внесок": "Автоплатіж $50 щопʼятниці — додається до кешу коли надходить",
  "Доступно цього циклу": "Скільки можна розмістити цього циклу = кеш + виручка від рекомендованих продажів",
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
}

async function unlock() {
  const password = document.getElementById("password-input").value.trim();
  if (!password) return;
  const err = document.getElementById("error-msg");
  err.style.display = "none";
  try {
    const snapshot = await decryptSnapshot(password);
    try { sessionStorage.setItem(LB_GATE_KEY, password); } catch (e) {}
    render(snapshot);
    reveal();
  } catch (e) {
    err.style.display = "block";
  }
}

function render(snapshot) {
  decorateHelpLabels();
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
    `${formatDate(snapshot.generated_at)} · ${portfolio.market_mode} · read-only`;
}

function renderMetrics(snapshot) {
  const portfolio = snapshot.equity_portfolio;
  const crypto = snapshot.crypto;
  const cashAvailable = money(portfolio.cash_available);
  const totalSellCash = money(portfolio.total_sell_cash);
  const metrics = [
    { label: "Equity Value", value: money(portfolio.total_value) },
    { label: "Crypto Value", value: money(crypto.total_value) },
    { label: "Кеш на рахунку", value: cashAvailable },
    { label: "Щотижневий внесок", value: money(portfolio.weekly_contribution) },
    {
      label: "Доступно цього циклу",
      value: money(portfolio.available_buy_cash),
      help: `${SUMMARY_HELP["Доступно цього циклу"]} = кеш ${cashAvailable} + виручка від рекомендованих продажів ${totalSellCash}`,
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
    pill(row.latest_signal),
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
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.append(
      pill(row.status),
      pill(`${row.conviction}/5 ${row.conviction_trend}`),
      pill(row.linked_tickers.join(", "))
    );
    card.append(el("h3", "", row.title), meta, el("div", "risk", row.key_risk));
    return card;
  }));
}

function renderRecommendation(rows) {
  const body = document.getElementById("recommendation-body");
  body.replaceChildren(...rows.map(row => tr([
    row.ticker,
    pct(row.current_allocation),
    pct(row.target_allocation),
    coloredPct(row.delta),
    pill(row.recommended_action),
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
  tooltip.textContent = text;
  wrapper.append(tooltip);
  return wrapper;
}

function pill(text) {
  return el("span", "pill", text);
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

document.getElementById("unlock-btn").addEventListener("click", unlock);
document.getElementById("password-input").addEventListener("keydown", event => {
  if (event.key === "Enter") unlock();
});
document.getElementById("lock-btn").addEventListener("click", () => {
  try { sessionStorage.removeItem(LB_GATE_KEY); } catch (e) {}
  location.reload();
});

(function autoUnlock() {
  let password = null;
  try { password = sessionStorage.getItem(LB_GATE_KEY); } catch (e) {}
  if (password) {
    document.getElementById("password-input").value = password;
    unlock();
  }
})();

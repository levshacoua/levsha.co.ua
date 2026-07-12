// Team management page — password unlocks the atlas graph (auth check + offline fallback),
// then the page renders the LIVE roster from the Team API (/team/api/stats) so what you see
// is what the brain actually uses right now. Saves are real (autosave) with server-confirmed
// feedback; the encrypted graph is only the offline fallback. NOTE: requests intentionally
// send no Content-Type header — keeps them CORS-simple (the API parses the JSON body anyway).
const API_BASE = "https://brain.levsha.co.ua";
let apiToken = null;

async function pbkdf2Bits(password, saltBytes, bits) {
  const enc = new TextEncoder();
  const km = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: 200000, hash: "SHA-256" }, km, bits
  );
}

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const km = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt, iterations: 200000, hash: "SHA-256" },
    km, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
  );
}

async function deriveApiToken(password) {
  const bits = await pbkdf2Bits(password, new TextEncoder().encode("leftys-team-api"), 256);
  return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function fetchStats() {
  const r = await fetch(API_BASE + "/team/api/stats", { headers: { "X-Team-Token": apiToken } });
  if (!r.ok) throw new Error("stats " + r.status);
  const d = await r.json();
  if (!d.ok) throw new Error(d.reason || "stats failed");
  return d;
}

function rosterFromStats(stats) {
  const roles = Object.entries(stats.roles || {}).map(([key, r]) => ({
    key, label: r.label || key, model: r.model, assignment: r.assignment,
    capabilities: r.capabilities || [],
  }));
  const models = Object.keys(stats.models || {}).length
    ? Object.keys(stats.models)
    : [...new Set(roles.map(r => r.model).filter(Boolean))];
  return { roles, models: models.sort(), live: true };
}

function rosterFromGraph(graph) {
  const roles = graph.nodes.filter(n => n.kind === "role").map(n => ({
    key: (n.id || "").replace(/^role:/, ""), label: n.label, model: n.model,
    assignment: n.assignment, capabilities: n.capabilities || [],
  }));
  const models = graph.nodes.filter(n => n.kind === "model")
    .map(n => (n.id || "").replace(/^model:/, "")).filter(Boolean).sort();
  return { roles, models, live: false, generated: graph.generated };
}

async function unlock() {
  const password = document.getElementById("password-input").value.trim();
  if (!password) return;
  const errorEl = document.getElementById("error-msg");
  errorEl.style.display = "none";
  try {
    const response = await fetch("../atlas/graph.enc.json", { cache: "no-store" });
    if (!response.ok) throw new Error("failed to load graph");
    const enc = await response.json();
    const b = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
    const key = await deriveKey(password, b(enc.salt));
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b(enc.iv) }, key, b(enc.ciphertext));
    const parsed = JSON.parse(new TextDecoder().decode(plain));
    const graph = parsed.graph || parsed;
    apiToken = await deriveApiToken(password);
    document.getElementById("password-gate").style.display = "none";
    document.getElementById("app").style.display = "block";
    try {
      const stats = await fetchStats();
      renderTeam(rosterFromStats(stats));
      document.getElementById("generated").textContent = "🟢 live";
    } catch (e) {
      renderTeam(rosterFromGraph(graph));
      document.getElementById("generated").textContent =
        `⚠ офлайн-знімок ${graph.generated || ""} (API недоступний)`;
    }
  } catch (e) {
    errorEl.style.display = "block";
  }
}

async function apiPost(path, body) {
  const r = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "X-Team-Token": apiToken },
    body: JSON.stringify(body),
  });
  return r.json();
}

function setStatusLine(el, text, cls) {
  el.textContent = text;
  el.className = "save-status " + (cls || "");
}

async function refreshCardTruth(card, roleKey) {
  try {
    const stats = await fetchStats();
    const r = (stats.roles || {})[roleKey];
    if (r) {
      card.querySelector(".current").textContent = r.model || "—";
      card.querySelector(".assign").textContent = r.assignment ? ` (${r.assignment})` : "";
    }
  } catch (e) { /* keep optimistic value */ }
}

function renderTeam(roster) {
  const list = document.getElementById("team-list");
  list.innerHTML = "";

  roster.roles.sort((a, b) => (a.label || "").localeCompare(b.label || "")).forEach(role => {
    const card = document.createElement("div");
    card.className = "role-card";
    const options = roster.models
      .map(m => `<option value="${m}" ${m === role.model ? "selected" : ""}>${m}</option>`).join("");
    const duties = (role.capabilities || []).map(c => `<li>${c}</li>`).join("");

    card.innerHTML = `
      <h3>${role.label || role.key}</h3>
      <div class="role-model">⚙ зараз: <span class="current">${role.model || "—"}</span><span class="assign">${role.assignment ? ` (${role.assignment})` : ""}</span></div>
      <details class="duties"><summary>Обов'язки (${(role.capabilities || []).length})</summary><ul>${duties}</ul></details>
      <div class="role-actions">
        <select aria-label="model for ${role.key}">${options}</select>
        <button type="button" data-act="unset" class="unset" title="Повернути автоматичний вибір">unset</button>
      </div>
      <div class="save-status"></div>
      <div class="confirm-row" style="display:none">
        <span class="warn"></span>
        <button type="button" data-act="confirm">Все одно застосувати</button>
      </div>
    `;

    const select = card.querySelector("select");
    const status = card.querySelector(".save-status");
    const confirmRow = card.querySelector(".confirm-row");

    async function save(model, confirmed) {
      setStatusLine(status, "⏳ зберігаю…", "");
      confirmRow.style.display = "none";
      try {
        const res = await apiPost("/team/api/set", { role: role.key, model, ...(confirmed ? { confirm: true } : {}) });
        if (res.ok) {
          setStatusLine(status, `✅ застосовано: ${res.role} → ${res.model} (${res.assignment || "pinned"})`, "ok");
          refreshCardTruth(card, role.key);
        } else if (res.needs_confirm) {
          card.querySelector(".warn").textContent = `⚠️ ${res.reason}`;
          confirmRow.style.display = "flex";
          setStatusLine(status, "", "");
        } else {
          setStatusLine(status, `❌ ${res.reason || "відхилено"}`, "err");
        }
      } catch (e) {
        setStatusLine(status, "⚠️ API недоступний — команда скопійована в буфер, встав боту", "warn");
        navigator.clipboard.writeText(`/team set ${role.key} ${model}`).catch(() => {});
      }
    }

    select.addEventListener("change", () => save(select.value, false));
    card.querySelector('[data-act="confirm"]').addEventListener("click", () => save(select.value, true));
    card.querySelector('[data-act="unset"]').addEventListener("click", async () => {
      setStatusLine(status, "⏳ зберігаю…", "");
      try {
        const res = await apiPost("/team/api/unset", { role: role.key });
        if (res.ok) {
          setStatusLine(status, `✅ ${role.key}: пін знято (авто-вибір)`, "ok");
          refreshCardTruth(card, role.key);
        } else {
          setStatusLine(status, `❌ ${res.reason || "відхилено"}`, "err");
        }
      } catch (e) {
        setStatusLine(status, "⚠️ API недоступний — команда в буфері", "warn");
        navigator.clipboard.writeText(`/team unset ${role.key}`).catch(() => {});
      }
    });

    list.appendChild(card);
  });

  if (!roster.roles.length) list.innerHTML = '<p class="hint">Ролі не знайдено.</p>';
}

document.getElementById("unlock-btn").addEventListener("click", unlock);
document.getElementById("password-input").addEventListener("keydown", e => { if (e.key === "Enter") unlock(); });

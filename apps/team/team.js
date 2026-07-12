// Team management page — decrypts the global atlas graph (same password), derives the
// Team API token from the SAME password, and AUTOSAVES role→model changes through
// https://brain.levsha.co.ua/team/api with live feedback (LB-098). Clipboard command
// remains the fallback when the API is unreachable.
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
    renderTeam(graph);
  } catch (e) {
    errorEl.style.display = "block";
  }
}

async function apiPost(path, body) {
  const r = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Team-Token": apiToken },
    body: JSON.stringify(body),
  });
  return r.json();
}

function setStatusLine(el, text, cls) {
  el.textContent = text;
  el.className = "save-status " + (cls || "");
}

function renderTeam(graph) {
  document.getElementById("generated").textContent = `Generated: ${graph.generated || ""}`;
  const roles = graph.nodes.filter(n => n.kind === "role");
  const models = graph.nodes.filter(n => n.kind === "model")
    .map(n => (n.id || "").replace(/^model:/, "")).filter(Boolean).sort();
  const list = document.getElementById("team-list");
  list.innerHTML = "";

  roles.sort((a, b) => (a.label || "").localeCompare(b.label || "")).forEach(role => {
    const roleKey = (role.id || "").replace(/^role:/, "");
    const card = document.createElement("div");
    card.className = "role-card";
    const options = models
      .map(m => `<option value="${m}" ${m === role.model ? "selected" : ""}>${m}</option>`).join("");

    card.innerHTML = `
      <h3>${role.label || roleKey}</h3>
      <div class="role-model">⚙ зараз: <span class="current">${role.model || "—"}</span>${role.assignment ? ` (${role.assignment})` : ""}</div>
      <div class="role-actions">
        <select aria-label="model for ${roleKey}">${options}</select>
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
    const currentEl = card.querySelector(".current");

    async function save(model, confirmed) {
      setStatusLine(status, "⏳ зберігаю…", "");
      confirmRow.style.display = "none";
      try {
        const res = await apiPost("/team/api/set", { role: roleKey, model, ...(confirmed ? { confirm: true } : {}) });
        if (res.ok) {
          currentEl.textContent = res.model;
          setStatusLine(status, `✅ застосовано: ${res.role} → ${res.model} (${res.assignment || "pinned"})`, "ok");
        } else if (res.needs_confirm) {
          card.querySelector(".warn").textContent = `⚠️ ${res.reason}`;
          confirmRow.style.display = "flex";
          setStatusLine(status, "", "");
        } else {
          setStatusLine(status, `❌ ${res.reason || "відхилено"}`, "err");
        }
      } catch (e) {
        setStatusLine(status, "⚠️ API недоступний — команда скопійована в буфер, встав боту", "warn");
        navigator.clipboard.writeText(`/team set ${roleKey} ${model}`).catch(() => {});
      }
    }

    select.addEventListener("change", () => save(select.value, false));
    card.querySelector('[data-act="confirm"]').addEventListener("click", () => save(select.value, true));
    card.querySelector('[data-act="unset"]').addEventListener("click", async () => {
      setStatusLine(status, "⏳ зберігаю…", "");
      try {
        const res = await apiPost("/team/api/unset", { role: roleKey });
        if (res.ok) {
          currentEl.textContent = res.model || "auto";
          setStatusLine(status, `✅ ${roleKey}: пін знято (авто-вибір)`, "ok");
        } else {
          setStatusLine(status, `❌ ${res.reason || "відхилено"}`, "err");
        }
      } catch (e) {
        setStatusLine(status, "⚠️ API недоступний — команда в буфері", "warn");
        navigator.clipboard.writeText(`/team unset ${roleKey}`).catch(() => {});
      }
    });

    list.appendChild(card);
  });

  if (!roles.length) list.innerHTML = '<p class="hint">У графі немає ролей — онови глобальний Atlas.</p>';
}

document.getElementById("unlock-btn").addEventListener("click", unlock);
document.getElementById("password-input").addEventListener("keydown", e => { if (e.key === "Enter") unlock(); });

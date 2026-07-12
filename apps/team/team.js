// Team management page — password unlocks the atlas graph (auth check + offline fallback),
// then the page renders the LIVE roster from the Team API (/team/api/stats) so what you see
// is what the brain actually uses right now. Saves are real (autosave) with server-confirmed
// feedback; the encrypted graph is only the offline fallback. NOTE: requests intentionally
// send no Content-Type header — keeps them CORS-simple (the API parses the JSON body anyway).
const API_BASE = "https://brain.levsha.co.ua";
let apiToken = null;
let expandedRoleKey = null;
let lastRoleStatus = null;

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
    model_variant: r.model_variant, effort: r.effort,
    contour: r.contour || r.group || roleManifestContour(stats.workflow, key),
    capabilities: r.capabilities || [], peer_scores: r.peer_scores || [],
  }));
  const models = Object.keys(stats.models || {}).length
    ? Object.keys(stats.models)
    : [...new Set(roles.map(r => r.model).filter(Boolean))];
  return { roles, models: models.sort(), live: true };
}

function rosterFromGraph(graph) {
  const roles = graph.nodes.filter(n => n.kind === "role").map(n => ({
    key: (n.id || "").replace(/^role:/, ""), label: n.label, model: n.model,
    assignment: n.assignment, model_variant: n.model_variant, effort: n.effort,
    contour: n.contour || n.group, capabilities: n.capabilities || [],
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
      window.teamStats = stats;
      renderSummary(stats);
      renderPipeline(stats);
      renderTeam(rosterFromStats(stats));
      document.getElementById("generated").textContent = "🟢 live";
    } catch (e) {
      const roster = rosterFromGraph(graph);
      renderPipeline({ roles: Object.fromEntries(roster.roles.map(r => [r.key, r])) });
      renderTeam(roster);
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
    window.teamStats = stats;
    renderPipeline(stats);
    const r = (stats.roles || {})[roleKey];
    if (r) {
      card.querySelector(".current").textContent = r.model || "—";
      card.querySelector(".assign").textContent = r.assignment ? ` (${r.assignment})` : "";
    }
  } catch (e) { /* keep optimistic value */ }
}

async function refreshTeamTruth(roleKey) {
  const stats = await fetchStats();
  window.teamStats = stats;
  renderSummary(stats);
  renderPipeline(stats);
  renderTeam(rosterFromStats(stats));
  return (stats.roles || {})[roleKey];
}

function roleModelParts(role) {
  const parts = [role && role.model ? role.model : "auto"];
  if (role && role.model_variant) parts.push(role.model_variant);
  if (role && role.effort) parts.push(role.effort);
  return parts;
}

function roleModelText(role) {
  return roleModelParts(role).join(" · ");
}

function roleModelChip(role) {
  const pinned = role && role.assignment;
  return `<span class="model-chip${pinned ? " pinned" : ""}">${roleModelText(role)}${pinned ? " <span class=\"pin\">pinned</span>" : ""}</span>`;
}

const ROLE_GROUPS = [
  { key: "main", title: "Основний конвеєр", roles: ["ceo", "architect", "developer", "frontend", "local_worker", "reviewer"] },
  { key: "planning", title: "Планування", roles: ["planner", "project_manager", "product_manager"] },
  { key: "support", title: "Підтримка", roles: ["knowledge", "logger", "secretary", "security"] },
  { key: "schedule", title: "Розклад", roles: ["nightly", "researcher"] },
];

const ROLE_GROUP_BY_KEY = ROLE_GROUPS.reduce((acc, group) => {
  group.roles.forEach(role => { acc[role] = group.key; });
  return acc;
}, {});

function roleGroupKey(role) {
  return (role.contour && ROLE_GROUPS.some(g => g.key === role.contour) && role.contour)
    || ROLE_GROUP_BY_KEY[role.key]
    || "support";
}

function renderTeam(roster) {
  const list = document.getElementById("team-list");
  list.innerHTML = "";

  const rolesByGroup = ROLE_GROUPS.map(group => ({ ...group, items: [] }));
  const groupIndex = Object.fromEntries(rolesByGroup.map((group, index) => [group.key, index]));
  roster.roles.forEach(role => {
    rolesByGroup[groupIndex[roleGroupKey(role)] || 0].items.push(role);
  });

  rolesByGroup.forEach(group => {
    group.items.sort((a, b) => {
      const ai = group.roles.indexOf(a.key);
      const bi = group.roles.indexOf(b.key);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      return (a.label || "").localeCompare(b.label || "");
    });
  });

  rolesByGroup.filter(group => group.items.length).forEach(group => {
    const header = document.createElement("h2");
    header.className = "role-section";
    header.innerHTML = `<span>${group.title}</span><em>${group.items.length}</em>`;
    list.appendChild(header);

    group.items.forEach(role => {
    const card = document.createElement("div");
    card.className = "role-card";
    card.dataset.role = role.key;
    const options = roster.models
      .map(m => `<option value="${m}" ${m === role.model ? "selected" : ""}>${m}</option>`).join("");
    const duties = (role.capabilities || []).map(c => `<li>${c}</li>`).join("");
    const isOpen = expandedRoleKey === role.key;

    card.innerHTML = `
      <button type="button" class="role-row" aria-expanded="${isOpen ? "true" : "false"}">
        <span class="role-title">${role.label || role.key}</span>
        ${roleModelChip(role)}
      </button>
      <div class="role-body" ${isOpen ? "" : "hidden"}>
        <div class="role-model">⚙ зараз: <span class="current">${role.model || "—"}</span><span class="assign">${role.assignment ? ` (${role.assignment})` : ""}</span></div>
        <details class="duties"><summary>Обов'язки (${(role.capabilities || []).length})</summary><ul>${duties}</ul></details>
        <details class="analytics"><summary>Аналітика</summary><div class="charts"></div></details>
        <div class="role-actions">
          <select aria-label="model for ${role.key}">${options}</select>
          <button type="button" data-act="unset" class="unset" title="Повернути автоматичний вибір">unset</button>
        </div>
        <div class="save-status"></div>
        <div class="confirm-row" style="display:none">
          <span class="warn"></span>
          <button type="button" data-act="confirm">Все одно застосувати</button>
        </div>
      </div>
    `;

    const row = card.querySelector(".role-row");
    const select = card.querySelector("select");
    const status = card.querySelector(".save-status");
    const confirmRow = card.querySelector(".confirm-row");
    if (lastRoleStatus && lastRoleStatus.role === role.key) {
      setStatusLine(status, lastRoleStatus.text, lastRoleStatus.cls);
    }

    row.addEventListener("click", () => {
      expandedRoleKey = expandedRoleKey === role.key ? null : role.key;
      renderTeam(roster);
    });

    async function save(model, confirmed) {
      setStatusLine(status, "⏳ зберігаю…", "");
      confirmRow.style.display = "none";
      try {
        const res = await apiPost("/team/api/set", { role: role.key, model, ...(confirmed ? { confirm: true } : {}) });
        if (res.ok) {
          lastRoleStatus = { role: role.key, text: `✅ застосовано: ${res.role} → ${res.model} (${res.assignment || "pinned"})`, cls: "ok" };
          setStatusLine(status, lastRoleStatus.text, lastRoleStatus.cls);
          try {
            await refreshTeamTruth(role.key);
          } catch (e) {
            refreshCardTruth(card, role.key);
          }
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
          lastRoleStatus = { role: role.key, text: `✅ ${role.key}: пін знято (авто-вибір)`, cls: "ok" };
          setStatusLine(status, lastRoleStatus.text, lastRoleStatus.cls);
          try {
            await refreshTeamTruth(role.key);
          } catch (e) {
            refreshCardTruth(card, role.key);
          }
        } else {
          setStatusLine(status, `❌ ${res.reason || "відхилено"}`, "err");
        }
      } catch (e) {
        setStatusLine(status, "⚠️ API недоступний — команда в буфері", "warn");
        navigator.clipboard.writeText(`/team unset ${role.key}`).catch(() => {});
      }
    });

    const analytics = card.querySelector(".analytics");
    analytics.addEventListener("toggle", () => {
      if (analytics.open && !analytics.dataset.done) {
        analytics.dataset.done = "1";
        renderRoleCharts(analytics.querySelector(".charts"), role);
      }
    });

    list.appendChild(card);
  });
  });

  if (!roster.roles.length) list.innerHTML = '<p class="hint">Ролі не знайдено.</p>';
}

document.getElementById("unlock-btn").addEventListener("click", unlock);
document.getElementById("password-input").addEventListener("keydown", e => { if (e.key === "Enter") unlock(); });


// ---- Dashboards (LB-099 page half) ----
function fmtTok(n) { return n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? (n/1e3).toFixed(1)+"K" : String(n); }

function renderSummary(stats) {
  const el = document.getElementById("summary");
  if (!el) return;
  // peer-review trigger button (LB-100)
  let btn = document.getElementById("peer-review-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "peer-review-btn";
    btn.className = "peer-btn";
    btn.textContent = "🔍 Запустити peer-оцінку";
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.textContent = "⏳ рейтери оцінюють (1-3 хв)…";
      try {
        const res = await apiPost("/team/api/peer-review", {});
        btn.textContent = res.ok ? `✅ ${res.summary || "готово"} — онови Аналітику` : `❌ ${res.reason || "відхилено"}`;
      } catch (e) {
        btn.textContent = "⚠️ API недоступний";
      }
      setTimeout(() => { btn.disabled = false; btn.textContent = "🔍 Запустити peer-оцінку"; }, 8000);
    });
    el.parentNode.insertBefore(btn, el.nextSibling);
  }
  const models = stats.models || {};
  let tokens = 0, seconds = 0;
  Object.values(models).forEach(m => {
    const u = m.usage_30d || {};
    tokens += (u.tokens_in || 0) + (u.tokens_out || 0);
    seconds += u.seconds || 0;
  });
  const spend = stats.spend_estimate_usd || {};
  const spendTxt = typeof spend === "object" ? `$${(spend.total ?? 0).toFixed(2)}` : `$${(+spend).toFixed(2)}`;
  const provs = Object.entries(stats.providers || {}).map(([name, p]) => {
    const lim = p && (p.limits || p.limit || p.usage) ? JSON.stringify(p.limits || p.limit || p.usage).slice(0, 40) : "н/д";
    return `${name}: ${p && p.available === false ? "⛔" : "🟢"} ${lim}`;
  }).join("<br>");
  el.innerHTML = `
    <div class="stat">Токени 30д<br><b>${fmtTok(tokens)}</b></div>
    <div class="stat">Машинний час 30д<br><b>${(seconds/3600).toFixed(1)} год</b></div>
    <div class="stat">Витрати (оцінка)<br><b>${spendTxt}</b></div>
    <div class="stat">Ліміти провайдерів<br>${provs || "н/д"}</div>`;
}

const PIE_COLORS = ["#00aced", "#4caf50", "#e0a030", "#ff6b6b", "#9c6ade", "#607d8b", "#c0ca33"];

function pie(container, caption, labels, data) {
  const box = document.createElement("div");
  box.className = "chart-box";
  const canvas = document.createElement("canvas");
  box.appendChild(canvas);
  const cap = document.createElement("div");
  cap.className = "cap";
  cap.textContent = caption;
  box.appendChild(cap);
  container.appendChild(box);
  new Chart(canvas, {
    type: "doughnut",
    data: { labels, datasets: [{ data, backgroundColor: PIE_COLORS, borderWidth: 0 }] },
    options: { plugins: { legend: { position: "bottom", labels: { color: "#ccc", font: { size: 10 } } } } },
  });
}

function renderRoleCharts(container, role) {
  const stats = window.teamStats || {};
  const models = stats.models || {};
  const my = role.model && models[role.model] ? (models[role.model].usage_30d || {}) : {};

  // 1) time share: this role's model vs the rest of the team
  const totalSec = Object.values(models).reduce((s, m) => s + ((m.usage_30d || {}).seconds || 0), 0);
  const mySec = my.seconds || 0;
  if (totalSec > 0) {
    pie(container, `Час: ${role.model || "—"} vs команда (30д)`,
        [role.model || "—", "решта команди"], [Math.round(mySec), Math.round(totalSec - mySec)]);
  }

  // 2) reliability: ok vs failures of the effective model
  const runs = my.runs || 0, fails = my.failures || 0;
  if (runs > 0) {
    pie(container, `Надійність ${role.model} (${runs} ранів)`,
        ["успішні", "збої"], [runs - fails, fails]);
  }

  // 3) peer scores (avg per rater) when present
  const scores = role.peer_scores || (stats.roles && stats.roles[role.key] && stats.roles[role.key].peer_scores) || [];
  if (scores.length) {
    const byRater = {};
    scores.forEach(s => { (byRater[s.rater] ||= []).push(s.score); });
    const labels = Object.keys(byRater);
    const data = labels.map(r => byRater[r].reduce((a, b) => a + b, 0) / byRater[r].length);
    pie(container, "Оцінки старших моделей (сер.)", labels, data);
  } else {
    const note = document.createElement("div");
    note.className = "cap";
    note.textContent = "Peer-оцінок ще немає — з'являться після першого запуску оцінювання (LB-100).";
    container.appendChild(note);
  }

  if (!container.children.length) {
    container.innerHTML = '<div class="cap">Немає даних за 30 днів для цієї моделі.</div>';
  }
}


// ---- Живий опис взаємодії команди (модель підставляється з поточних призначень) ----
function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));
}

function asArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : Object.values(v);
}

function workflowSection(workflow, names) {
  for (const name of names) {
    if (workflow && workflow[name]) return workflow[name];
  }
  return null;
}

function roleManifestContour(workflow, roleKey) {
  if (!workflow) return "";
  const groups = workflow.role_groups || workflow.groups || workflow.contours || workflow.role_contours;
  if (!groups) return "";
  for (const [groupKey, value] of Object.entries(groups)) {
    const roles = Array.isArray(value) ? value : (value.roles || value.items || value.role_keys || []);
    if (roles.includes(roleKey)) return value.key || value.contour || groupKey;
  }
  const roleMeta = workflow.roles && workflow.roles[roleKey];
  return roleMeta && (roleMeta.contour || roleMeta.group || "");
}

function workflowSteps(workflow) {
  const section = workflowSection(workflow, ["main", "primary", "pipeline", "workflow"]);
  return asArray(
    workflow.steps || workflow.pipeline_steps || workflow.interaction_steps
    || (section && (section.steps || section.items))
  );
}

function workflowFlow(workflow) {
  const section = workflowSection(workflow, ["main", "primary", "pipeline", "workflow"]);
  return asArray(
    workflow.flow || workflow.chips || workflow.pipeline_flow
    || (section && (section.flow || section.chips || section.items))
  );
}

function planningFlow(workflow) {
  const planning = workflowSection(workflow, ["planning_flow", "planning", "planning_contour", "plan"]);
  const manifestFlow = asArray(
    Array.isArray(planning) ? planning : (planning && (planning.flow || planning.chips || planning.items || planning.steps))
  );
  if (manifestFlow.length) return manifestFlow;
  return [
    { label: "Workflow manifest ще не доступний у відповіді API." },
  ];
}

function chipRoleKeys(item) {
  if (!item || typeof item === "string") return [];
  const raw = item.roles || item.role_keys || item.keys || item.role || item.key;
  return Array.isArray(raw) ? raw : (raw ? [raw] : []);
}

function chipLabel(item) {
  if (typeof item === "string") return item;
  return item.label || item.name || item.title || chipRoleKeys(item).join(" / ") || "step";
}

function renderChip(item, roles) {
  const keys = typeof item === "string" && roles[item] ? [item] : chipRoleKeys(item);
  const label = typeof item === "string" && roles[item] ? (roles[item].label || item) : chipLabel(item);
  const modelText = keys.length
    ? keys.map(key => roleModelText(roles[key] || { model: "auto" })).join(" / ")
    : (item && typeof item === "object" && (item.model || item.model_variant || item.effort)
      ? roleModelText(item)
      : "");
  return `<span class="chip">${esc(label)}${modelText ? `<em>${esc(modelText)}</em>` : ""}</span>`;
}

function renderFlowRow(title, items, roles) {
  if (!items.length) return "";
  return `<div class="flow-row"><strong>${esc(title)}</strong>${items.map(item => renderChip(item, roles)).join('<span class="arr">→</span>')}</div>`;
}

function renderWorkflowStep(step, roles) {
  if (typeof step === "string") return `<li>${esc(step)}</li>`;
  const title = step.title || step.label || step.name;
  const text = step.text || step.description || step.summary || "";
  const keys = chipRoleKeys(step);
  const roleBits = keys.map(key => `<span class="m">${esc(roleModelText(roles[key] || { model: "auto" }))}</span>`).join(" / ");
  return `<li>${title ? `<b>${esc(title)}</b>${text ? " — " : ""}` : ""}${esc(text)}${roleBits ? ` ${roleBits}` : ""}</li>`;
}

function renderPipeline(stats) {
  const el = document.getElementById("pipeline-steps");
  if (!el) return;
  const R = stats.roles || {};
  const workflow = stats.workflow;
  const flow = document.getElementById("pipeline-flow");

  if (!workflow) {
    if (flow) flow.innerHTML = "";
    el.innerHTML = '<li class="hint">Workflow manifest ще не доступний у відповіді API. Онови backend або відкрий live API; сторінка не впала.</li>';
    return;
  }

  const steps = workflowSteps(workflow);
  if (flow) {
    const rows = [
      renderFlowRow("Основний конвеєр", workflowFlow(workflow), R),
      renderFlowRow("Планування", planningFlow(workflow), R),
    ].filter(Boolean);
    flow.innerHTML = rows.join("");
  }
  el.innerHTML = steps.length
    ? steps.map(step => renderWorkflowStep(step, R)).join("")
    : '<li class="hint">Workflow manifest отримано, але кроки не описані.</li>';
}

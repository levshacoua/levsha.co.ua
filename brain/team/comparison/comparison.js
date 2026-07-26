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
    const b = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
    let data;
    let usingSample = false;
    try {
      const response = await fetch("comparison.enc.json", { cache: "no-store" });
      if (!response.ok) throw new Error("enc not found");
      const enc = await response.json();
      const key = await deriveKey(password, b(enc.salt));
      const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b(enc.iv) }, key, b(enc.ciphertext));
      data = JSON.parse(new TextDecoder().decode(plain));
    } catch (fetchErr) {
      const response = await fetch("sample.json", { cache: "no-store" });
      if (!response.ok) throw fetchErr;
      data = await response.json();
      usingSample = true;
    }
    apiToken = await deriveApiToken(password);
    document.getElementById("password-gate").style.display = "none";
    try { sessionStorage.setItem("lb_gate_pw", document.getElementById("password-input").value.trim()); } catch (e) {}
    document.getElementById("app").style.display = "block";
    if (usingSample) {
      const banner = document.getElementById("sample-banner");
      if (banner) banner.classList.add("show");
    }
    const genEl = document.getElementById("generated");
    if (genEl) genEl.textContent = data.generated || "";
    const projEl = document.getElementById("project-name");
    if (projEl) projEl.textContent = "leftys-brain";
    renderComparison(data);
  } catch (e) {
    errorEl.style.display = "block";
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

function renderComparison(data) {
  const tbody = document.getElementById("comparison-body");
  if (!tbody) return;
  tbody.innerHTML = "";
  const models = data.models || [];
  models.forEach(model => {
    const row = document.createElement("tr");
    // Model
    const modelTd = document.createElement("td");
    let modelHtml = `<span class="model-name">${escapeHtml(model.id || "")}</span>`;
    const badgeClass = model.status === "team" ? "badge-team" : "badge-candidate";
    modelHtml += ` <span class="model-badge ${badgeClass}">${escapeHtml(model.status || "")}</span>`;
    if (model.team_role) {
      modelHtml += `<div class="model-meta">role: ${escapeHtml(model.team_role)}</div>`;
    }
    if (model.capability_note) {
      modelHtml += `<div class="model-meta">${escapeHtml(model.capability_note)}</div>`;
    }
    modelTd.innerHTML = modelHtml;
    row.appendChild(modelTd);
    // Kind
    const kindTd = document.createElement("td");
    kindTd.textContent = model.kind || "";
    row.appendChild(kindTd);
    // Location
    const locTd = document.createElement("td");
    locTd.textContent = model.local_or_cloud || "";
    row.appendChild(locTd);
    // Context (k)
    const ctxTd = document.createElement("td");
    ctxTd.textContent = model.context != null ? Math.round(model.context / 1000) : "—";
    row.appendChild(ctxTd);
    // $In/1M
    const inTd = document.createElement("td");
    inTd.textContent = model.usd_in_per_m != null ? model.usd_in_per_m : "—";
    row.appendChild(inTd);
    // $Out/1M
    const outTd = document.createElement("td");
    outTd.textContent = model.usd_out_per_m != null ? model.usd_out_per_m : "—";
    row.appendChild(outTd);
    // Levels 1-3
    for (let lvl = 1; lvl <= 3; lvl++) {
      const levelData = (model.levels && model.levels[String(lvl)]) || {};
      const levelTd = createLevelTd(levelData, model.id, lvl);
      row.appendChild(levelTd);
    }
    tbody.appendChild(row);
  });
  attachListeners(tbody);
}

function createLevelTd(levelData, modelId, level) {
  const td = document.createElement("td");
  td.className = "level-cell";
  let html = `<div class="level-state">${escapeHtml(levelData.state || "not_taken")}</div>`;
  if (levelData.implementation_na) {
    html += `<div class="level-na">N/A (no repo adapter)</div>`;
  }
  if (levelData.passed !== null && levelData.passed !== undefined) {
    const pClass = levelData.passed ? "passed" : "failed";
    html += `<div class="level-pass ${pClass}">${levelData.passed ? "passed" : "failed"}</div>`;
  }
  if (levelData.mean != null) {
    html += `<div class="level-mean">mean: ${levelData.mean}</div>`;
  }
  if (levelData.wall_seconds != null) {
    html += `<div class="level-seconds">${levelData.wall_seconds}s</div>`;
  }
  const state = levelData.state || "not_taken";
  if ((state === "not_taken" || state === "error") && !levelData.implementation_na) {
    html += `<button class="action-btn" data-model-id="${escapeHtml(modelId)}" data-level="${level}">Пройти іспит</button>`;
  } else if (state === "queued" || state === "running") {
    html += `<div class="level-queued">pending...</div>`;
  }
  const judges = levelData.judges || [];
  if (judges.length > 0) {
    html += `<button class="details-btn">details</button><div class="details-content">`;
    judges.forEach(judge => {
      if (judge.status === "unparseable") {
        html += `<div class="judge-item unparseable">judge: ${escapeHtml(judge.judge || "")} — unparseable</div>`;
      } else {
        html += `<div class="judge-item">`;
        html += `<span class="judge-score">${escapeHtml(judge.judge || "")}: ${judge.score != null ? judge.score : ""}</span>`;
        if (judge.comment) {
          html += `<div class="judge-comment">${escapeHtml(judge.comment)}</div>`;
        }
        if (judge.recommendation) {
          html += `<div class="judge-rec">${escapeHtml(judge.recommendation)}</div>`;
        }
        html += `</div>`;
      }
    });
    html += `</div>`;
  }
  td.innerHTML = html;
  return td;
}

function attachListeners(tbody) {
  tbody.addEventListener("click", async (ev) => {
    const target = ev.target;
    if (target.classList.contains("details-btn")) {
      const content = target.nextElementSibling;
      if (content && content.classList.contains("details-content")) {
        content.classList.toggle("show");
      }
      return;
    }
    if (target.classList.contains("action-btn")) {
      const modelId = target.dataset.modelId;
      const levelStr = target.dataset.level;
      const level = parseInt(levelStr, 10);
      if (!modelId || !level) return;
      target.disabled = true;
      const originalText = target.textContent;
      target.textContent = "⏳ sending...";
      try {
        const resp = await fetch(API_BASE + "/team/api/exam/enqueue", {
          method: "POST",
          headers: { "X-Team-Token": apiToken },
          body: JSON.stringify({ model_id: modelId, level: level }),
        });
        if (resp.status === 401 || resp.status === 403) {
          target.classList.add("error");
          target.textContent = "⛔ auth error";
          return;
        }
        const result = await resp.json();
        if (result && result.ok) {
          const td = target.closest("td");
          if (td) {
            td.innerHTML = `<div class="level-state">queued</div><div class="level-queued">pending...</div>`;
          }
        } else {
          target.classList.add("error");
          target.textContent = "❌ " + (result && result.reason ? escapeHtml(result.reason) : "failed");
          setTimeout(() => {
            if (target.parentNode) {
              target.disabled = false;
              target.textContent = originalText;
              target.classList.remove("error");
            }
          }, 4000);
        }
      } catch (err) {
        target.classList.add("error");
        target.textContent = "⚠️ network error";
        setTimeout(() => {
          if (target.parentNode) {
            target.disabled = false;
            target.textContent = originalText;
            target.classList.remove("error");
          }
        }, 4000);
      }
    }
  });
}

document.getElementById("unlock-btn").addEventListener("click", unlock);
document.getElementById("password-input").addEventListener("keydown", e => { if (e.key === "Enter") unlock(); });

// single-session gate (same key as team.js)
(function(){var p=null;try{p=sessionStorage.getItem("lb_gate_pw");}catch(e){}if(p){var el=document.getElementById("password-input");if(el){el.value=p;unlock();}}})();

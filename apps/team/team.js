// Team management page — reads the GLOBAL atlas graph (same password), renders the
// role roster, and copies /team bot commands to the clipboard (intent pattern).
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt, iterations: 200000, hash: "SHA-256" },
    keyMaterial, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
  );
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
    const salt = Uint8Array.from(atob(enc.salt), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(enc.iv), c => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(enc.ciphertext), c => c.charCodeAt(0));
    const key = await deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ciphertext);
    const graph = JSON.parse(new TextDecoder().decode(decrypted)).graph
      || JSON.parse(new TextDecoder().decode(decrypted));
    document.getElementById("password-gate").style.display = "none";
    document.getElementById("app").style.display = "block";
    renderTeam(graph);
  } catch (e) {
    errorEl.style.display = "block";
  }
}

function renderTeam(graph) {
  document.getElementById("generated").textContent = `Generated: ${graph.generated || ""}`;
  const roles = graph.nodes.filter(n => n.kind === "role");
  const models = graph.nodes.filter(n => n.kind === "model")
    .map(n => (n.id || "").replace(/^model:/, ""))
    .filter(Boolean)
    .sort();
  const list = document.getElementById("team-list");
  list.innerHTML = "";

  roles.sort((a, b) => (a.label || "").localeCompare(b.label || "")).forEach(role => {
    const roleKey = (role.id || "").replace(/^role:/, "");
    const card = document.createElement("div");
    card.className = "role-card";

    const options = models
      .map(m => `<option value="${m}" ${m === role.model ? "selected" : ""}>${m}</option>`)
      .join("");

    card.innerHTML = `
      <h3>${role.label || roleKey}</h3>
      <div class="role-model">⚙ зараз: ${role.model || "—"}${role.assignment ? ` (${role.assignment})` : ""}</div>
      <div class="role-actions">
        <select aria-label="model for ${roleKey}">${options}</select>
        <button type="button" data-act="set">Скопіювати команду</button>
        <button type="button" data-act="unset" class="unset" title="Повернути автоматичний вибір">unset</button>
        <span class="copied">скопійовано ✓</span>
      </div>
    `;

    const select = card.querySelector("select");
    const copied = card.querySelector(".copied");
    const flash = () => { copied.classList.add("show"); setTimeout(() => copied.classList.remove("show"), 1600); };

    card.querySelector('[data-act="set"]').addEventListener("click", () => {
      navigator.clipboard.writeText(`/team set ${roleKey} ${select.value}`).then(flash);
    });
    card.querySelector('[data-act="unset"]').addEventListener("click", () => {
      navigator.clipboard.writeText(`/team unset ${roleKey}`).then(flash);
    });

    list.appendChild(card);
  });

  if (!roles.length) {
    list.innerHTML = '<p class="hint">У графі немає ролей — онови глобальний Atlas.</p>';
  }
}

document.getElementById("unlock-btn").addEventListener("click", unlock);
document.getElementById("password-input").addEventListener("keydown", e => {
  if (e.key === "Enter") unlock();
});

const BOT_USERNAME = 'leftys_brain_bot';
let currentParent = null;

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 200000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

async function unlock() {
  const password = document.getElementById("password-input").value.trim();
  if (!password) return;

  const errorEl = document.getElementById("error-msg");
  errorEl.style.display = "none";

  try {
    const response = await fetch("graph.enc.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to load encrypted graph");
    const enc = await response.json();

    const salt = Uint8Array.from(atob(enc.salt), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(enc.iv), c => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(enc.ciphertext), c => c.charCodeAt(0));

    // Encrypted data is the only source of truth — no plaintext fallback.
    const key = await deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );
    const jsonStr = new TextDecoder().decode(decrypted);
    const graph = JSON.parse(jsonStr);

    if (graph) {
      document.getElementById("password-gate").style.display = "none";
    try{sessionStorage.setItem("lb_gate_pw",document.getElementById("password-input").value.trim());}catch(e){}
      document.getElementById("app").style.display = "block";
      renderGraph(graph);
    }
  } catch (e) {
    errorEl.textContent = "Incorrect password";
    errorEl.style.display = "block";
  }
}

function renderGraph(graph) {
  document.getElementById("project-name").textContent = graph.project;
  document.getElementById("generated").textContent = `Generated: ${graph.generated}`;

  const canvas = document.getElementById("canvas");
  canvas.innerHTML = "";

  const viewport = document.createElement("div");
  viewport.id = "viewport";
  viewport.style.position = "absolute";
  viewport.style.left = "0";
  viewport.style.top = "0";
  viewport.style.transformOrigin = "0 0";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "edges";
  svg.style.position = "absolute";
  svg.style.left = "0";
  svg.style.top = "0";
  svg.style.pointerEvents = "none";
  viewport.appendChild(svg);
  canvas.appendChild(viewport);

  // Group nodes by lane; nodes without a group fall back to their layer
  // (team/projects layers) so no node is ever silently dropped.
  // Owner 2026-07-12: a role is the wrapper, its model lives INSIDE the role card —
  // assigned model nodes are redundant on the map; only unassigned (idle) models stay visible.
  const assignedModels = new Set(
    graph.nodes.filter(n => n.kind === "role" && n.model).map(n => "model:" + n.model)
  );
  const visibleNodes = graph.nodes.filter(
    n => !(n.kind === "model" && assignedModels.has(n.id))
  );

  const groups = {};
  visibleNodes.forEach(node => {
    const key = node.group || node.layer || "other";
    if (!groups[key]) groups[key] = [];
    groups[key].push(node);
  });

  const knownOrder = ["team", "project", "projects", "erp", "api", "mcp", "web", "entity"];
  const groupOrder = [
    ...knownOrder.filter(g => groups[g]),
    ...Object.keys(groups).filter(g => !knownOrder.includes(g)).sort(),
  ];
  const laneWidth = 290;
  const nodeWidth = 250;
  const nodeHeight = 84;
  const verticalGap = 15;
  const startX = 30;
  const startY = 30;

  const positions = {};
  let maxY = 0;
  let currentX = startX;

  groupOrder.forEach(group => {
    if (!groups[group]) return;
    let y = startY;
    groups[group].forEach(node => {
      positions[node.id] = { x: currentX, y: y };
      y += nodeHeight + verticalGap;
    });
    maxY = Math.max(maxY, y);
    currentX += laneWidth;
  });

  const svgWidth = currentX + 50;
  const svgHeight = maxY + 50;
  svg.setAttribute("width", svgWidth);
  svg.setAttribute("height", svgHeight);

  // Draw edges (under nodes); keep endpoints updatable for the post-render reflow.
  graph.edges.forEach(edge => {
    const fromPos = positions[edge.from];
    const toPos = positions[edge.to];
    if (!fromPos || !toPos) return;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.dataset.from = edge.from;
    line.dataset.to = edge.to;
    line.setAttribute("x1", fromPos.x + nodeWidth / 2);
    line.setAttribute("y1", fromPos.y + nodeHeight / 2);
    line.setAttribute("x2", toPos.x + nodeWidth / 2);
    line.setAttribute("y2", toPos.y + nodeHeight / 2);

    let stroke = "var(--atlas-line)";
    let strokeWidth = "1.5";
    if (edge.kind === "data") {
      stroke = "var(--atlas-accent)";
      strokeWidth = "1";
    } else if (edge.kind === "contains") {
      stroke = "rgba(0,172,237,0.08)";
      strokeWidth = "2";
    }
    line.setAttribute("stroke", stroke);
    line.setAttribute("stroke-width", strokeWidth);
    svg.appendChild(line);
  });

  // Create node elements
  const expandedNodes = new Set();

  visibleNodes.forEach(node => {
    const pos = positions[node.id];
    if (!pos) return;

    const nodeEl = document.createElement("div");
    nodeEl.className = `node status-${node.status}`;
    nodeEl.style.position = "absolute";
    nodeEl.style.left = pos.x + "px";
    nodeEl.style.top = pos.y + "px";
    nodeEl.style.width = nodeWidth + "px";

    // Team/project nodes may lack tasks/status — never let one node kill the render.
    const tasks = node.tasks || { open: 0, review: 0, next: 0 };
    const status = node.status || node.kind || "planned";
    nodeEl.className = `node status-${status}`;
    let metaLine = "";
    if (node.model) {
      metaLine = `<div class="node-meta">⚙ ${node.model}${node.assignment ? ` (${node.assignment})` : ""}</div>`;
    } else if (node.accepted !== undefined) {
      const parts = [`✅ ${node.accepted} accepted`];
      if (node.head) parts.push(node.head);
      if (node.last_accept) parts.push(node.last_accept);
      metaLine = `<div class="node-meta">${parts.join(" · ")}</div>`;
    }
    nodeEl.innerHTML = `
      <div class="node-header">
        <span class="node-label">${node.label || node.id}</span>
        <span class="status-chip ${status}">${status}</span>
        <span class="task-badge">${(tasks.open || 0) + (tasks.review || 0) + (tasks.next || 0)}</span>
      </div>
      ${metaLine}
    `;

    const header = nodeEl.querySelector('.node-header');
    if (header) {
      const addUnder = document.createElement('span');
      addUnder.className = 'add-under-btn';
      addUnder.textContent = '+';
      addUnder.setAttribute('aria-label', 'Add under this node');
      addUnder.addEventListener('click', (e) => {
        e.stopPropagation();
        showAddForm(node);
      });
      header.appendChild(addUnder);
    }

    nodeEl.addEventListener("click", () => {
      const existing = nodeEl.querySelector(".expanded-content");
      if (existing) {
        existing.remove();
        nodeEl.classList.remove("expanded");
        nodeEl.style.zIndex = "";
        expandedNodes.delete(node.id);
      } else {
        const exp = document.createElement("div");
        exp.className = "expanded-content";
        let html = '<ul class="capabilities">';
        (node.capabilities || []).forEach(cap => {
          html += `<li>${cap}</li>`;
        });
        html += "</ul>";
        const t = node.tasks || {};
        html += `<div class="tasks">
          <div>Open: ${t.open || 0}</div>
          <div>Review: ${t.review || 0}</div>
          <div>Next: ${t.next || 0}</div>
        </div>`;
        exp.innerHTML = html;
        nodeEl.appendChild(exp);
        nodeEl.classList.add("expanded");
        nodeEl.style.zIndex = "20";
        expandedNodes.add(node.id);
      }
    });

    nodeEl.addEventListener("mousedown", e => e.stopPropagation());
    nodeEl.dataset.id = node.id;
    viewport.appendChild(nodeEl);
  });

  // Reflow: cards have variable heights (meta lines, two-line labels) — re-stack each
  // lane by measured height so cards never overlap, then re-anchor edge endpoints.
  let reflowMaxY = 0;
  groupOrder.forEach(group => {
    if (!groups[group]) return;
    let y = startY;
    groups[group].forEach(node => {
      const el = viewport.querySelector(`.node[data-id="${CSS.escape(node.id)}"]`);
      if (!el) return;
      el.style.top = y + "px";
      positions[node.id] = { x: positions[node.id].x, y: y, h: el.offsetHeight };
      y += el.offsetHeight + verticalGap;
    });
    reflowMaxY = Math.max(reflowMaxY, y);
  });
  svg.setAttribute("height", reflowMaxY + 50);
  svg.querySelectorAll("line[data-from]").forEach(line => {
    const f = positions[line.dataset.from];
    const t = positions[line.dataset.to];
    if (!f || !t) return;
    line.setAttribute("y1", f.y + (f.h || nodeHeight) / 2);
    line.setAttribute("y2", t.y + (t.h || nodeHeight) / 2);
  });

  // Pan / zoom state
  let panX = 0;
  let panY = 0;
  let zoom = 1;

  function updateTransform() {
    viewport.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  }

  // Background drag to pan
  let isDragging = false;
  let startClientX = 0;
  let startClientY = 0;

  canvas.addEventListener("mousedown", e => {
    if (e.target === canvas || e.target === viewport || e.target.id === "edges") {
      isDragging = true;
      startClientX = e.clientX;
      startClientY = e.clientY;
    }
  });

  document.addEventListener("mousemove", e => {
    if (isDragging) {
      panX += e.clientX - startClientX;
      panY += e.clientY - startClientY;
      startClientX = e.clientX;
      startClientY = e.clientY;
      updateTransform();
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Wheel zoom
  canvas.addEventListener("wheel", e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    zoom *= factor;
    zoom = Math.max(0.3, Math.min(4, zoom));
    updateTransform();
  });

  // Toolbar buttons
  document.getElementById("zoom-in").addEventListener("click", () => {
    zoom *= 1.2;
    zoom = Math.min(4, zoom);
    updateTransform();
  });

  document.getElementById("zoom-out").addEventListener("click", () => {
    zoom *= 0.8;
    zoom = Math.max(0.3, zoom);
    updateTransform();
  });

  document.getElementById("reset-view").addEventListener("click", () => {
    panX = 0;
    panY = 0;
    zoom = 1;
    updateTransform();
  });

  updateTransform();
}

function showAddForm(parentNode = null) {
  const modal = document.getElementById('add-modal');
  const titleInput = document.getElementById('intent-title');
  const groupSelect = document.getElementById('intent-group');
  const noteInput = document.getElementById('intent-note');
  const relatesEl = document.getElementById('intent-relates');
  if (!modal || !titleInput || !groupSelect) return;

  currentParent = parentNode;

  titleInput.value = '';
  groupSelect.value = parentNode ? parentNode.group : 'web';
  if (noteInput) noteInput.value = '';

  if (relatesEl) {
    if (parentNode) {
      relatesEl.innerHTML = `relates to: <strong>${parentNode.label}</strong>`;
      relatesEl.style.display = 'block';
    } else {
      relatesEl.style.display = 'none';
      relatesEl.innerHTML = '';
    }
  }

  modal.style.display = 'flex';
  titleInput.focus();
}

function buildIntent() {
  const titleInput = document.getElementById('intent-title');
  const groupSelect = document.getElementById('intent-group');
  const noteInput = document.getElementById('intent-note');
  if (!titleInput || !groupSelect) return null;

  const title = titleInput.value.trim();
  if (!title) return null;

  const group = groupSelect.value;
  const note = noteInput ? noteInput.value.trim() : '';

  let intent = `#TASK KOBOS Atlas add-node "${title}" group=${group}`;
  if (currentParent && currentParent.id) {
    intent += ` under=${currentParent.id}`;
  }
  if (note) {
    intent += ` — ${note}`;
  }
  return intent;
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
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied');
  }).catch(() => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('Copied');
  });
}

// Wire up password gate
document.getElementById("unlock-btn").addEventListener("click", unlock);
document.getElementById("password-input").addEventListener("keypress", e => {
  if (e.key === "Enter") unlock();
});

// Add intent UI
const addGlobalBtn = document.getElementById('add-global-btn');
if (addGlobalBtn) {
  addGlobalBtn.addEventListener('click', () => showAddForm(null));
}

const modalEl = document.getElementById('add-modal');
const intentForm = document.getElementById('intent-form');
const cancelBtn = document.getElementById('intent-cancel');
const copyBtn = document.getElementById('intent-copy');

if (cancelBtn && modalEl) {
  cancelBtn.addEventListener('click', () => {
    modalEl.style.display = 'none';
  });
}

if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    const intentText = buildIntent();
    if (intentText) {
      copyToClipboard(intentText);
    }
  });
}

if (intentForm && modalEl) {
  intentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const intentText = buildIntent();
    if (intentText) {
      const encoded = encodeURIComponent(intentText);
      window.open(`https://t.me/${BOT_USERNAME}?text=${encoded}`, '_blank');
      showToast("Sent to Lefty's Brain");
      modalEl.style.display = 'none';
    }
  });
}

/* LB single-session gate: auto-unlock from sessionStorage (enter password once per session) */
(function(){var p=null;try{p=sessionStorage.getItem("lb_gate_pw");}catch(e){}if(p){var el=document.getElementById("password-input");if(el){el.value=p;unlock();}}})();

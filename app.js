const STATUS_FILE = "./status.json";

const statusUI = {
  operational: {
    title: "All systems operational",
    description: "The EggSys website is responding to automated checks.",
    symbol: "✓",
    pill: "Operational",
    className: "up"
  },
  degraded: {
    title: "Service may be degraded",
    description: "The latest check did not receive a successful response.",
    symbol: "!",
    pill: "Degraded",
    className: "down"
  },
  outage: {
    title: "Service outage detected",
    description: "The EggSys website did not respond successfully to the latest check.",
    symbol: "×",
    pill: "Outage",
    className: "down"
  },
  pending: {
    title: "Waiting for first check",
    description: "The monitor has not recorded its first result yet.",
    symbol: "…",
    pill: "Pending",
    className: "pending"
  }
};

function formatDate(value) {
  if (!value) return "Time not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time not available";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function renderStatus(data) {
  const state = statusUI[data.status] || statusUI.pending;
  document.getElementById("status-symbol").textContent = state.symbol;
  document.getElementById("status-title").textContent = state.title;
  document.getElementById("status-description").textContent = state.description;
  const pill = document.getElementById("status-pill");
  pill.textContent = state.pill;
  pill.className = "status-pill " + state.className;

  const card = document.querySelector(".status-card");
  card.classList.toggle("is-down", data.status === "outage" || data.status === "degraded");
  if (data.status === "outage" || data.status === "degraded") {
    card.style.background = "linear-gradient(120deg,#32191f,#21151d 60%,#111a2a)";
    card.style.borderColor = "#63303a";
    document.getElementById("status-symbol").style.background = "#51252c";
    document.getElementById("status-symbol").style.color = "var(--red)";
  }

  const updated = data.last_checked || data.last_change;
  document.getElementById("updated-at").textContent = updated
    ? "Last status update: " + formatDate(updated)
    : "Waiting for the first monitoring result";

  renderIncidents(Array.isArray(data.incidents) ? data.incidents : []);
}

function renderIncidents(incidents) {
  const list = document.getElementById("incident-list");
  if (!incidents.length) {
    list.innerHTML = '<div class="empty-state">No incidents have been recorded.</div>';
    return;
  }

  list.replaceChildren();
  incidents.slice().reverse().forEach((incident) => {
    const item = document.createElement("article");
    item.className = "incident-item";
    const marker = document.createElement("span");
    marker.className = "incident-marker" + (incident.status === "outage" || incident.status === "degraded" ? " down" : "");
    marker.setAttribute("aria-hidden", "true");
    const content = document.createElement("div");
    content.className = "incident-content";
    const heading = document.createElement("strong");
    heading.textContent = incident.title || "Status update";
    const description = document.createElement("p");
    description.textContent = incident.message || "The service status changed.";
    const time = document.createElement("time");
    time.textContent = formatDate(incident.time);
    content.append(heading, description, time);
    item.append(marker, content);
    list.append(item);
  });
}

async function loadStatus() {
  try {
    const response = await fetch(STATUS_FILE + "?t=" + Date.now(), { cache: "no-store" });
    if (!response.ok) throw new Error("Status file unavailable");
    renderStatus(await response.json());
  } catch {
    renderStatus({
      status: "pending",
      incidents: [],
      last_checked: null
    });
    document.getElementById("status-description").textContent =
      "Status data is not available yet. The monitor may still be setting up.";
    document.getElementById("incident-list").innerHTML =
      '<div class="empty-state">Incident history will appear after monitoring starts.</div>';
  }
}

async function manualCheck() {
  const button = document.getElementById("manual-check");
  const feedback = document.getElementById("check-feedback");
  button.disabled = true;
  button.classList.add("checking");
  button.innerHTML = '<span aria-hidden="true">↻</span> Checking…';
  feedback.textContent = "Checking the EggSys website directly…";

  try {
    const response = await fetch("/api/check?t=" + Date.now(), { cache: "no-store" });
    if (!response.ok) throw new Error("Endpoint returned HTTP " + response.status + ".");
    const result = await response.json();
    let saved = {};
    try {
      const savedResponse = await fetch(STATUS_FILE + "?t=" + Date.now(), { cache: "no-store" });
      if (savedResponse.ok) saved = await savedResponse.json();
    } catch {}
    renderStatus({
      ...saved,
      status: result.status,
      last_checked: result.checked_at,
      http_status: result.http_status,
      incidents: saved.incidents || []
    });
    feedback.textContent = result.status === "operational"
      ? "Manual check complete: EggSys responded successfully."
      : "Manual check complete: EggSys did not respond successfully.";
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error.";
    feedback.textContent = "Manual check failed: " + detail + " Check the Cloudflare Pages deployment and /api/check function.";
  } finally {
    button.disabled = false;
    button.classList.remove("checking");
    button.innerHTML = '<span aria-hidden="true">↻</span> Check now';
  }
}

document.getElementById("manual-check").addEventListener("click", manualCheck);
loadStatus();
setInterval(loadStatus, 60000);
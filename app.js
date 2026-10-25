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
  const isDown = data.status === "outage" || data.status === "degraded";
  card.classList.toggle("is-down", isDown);
  document.getElementById("status-symbol").style.background = isDown ? "#51252c" : state.className === "pending" ? "#44391f" : "#1a4437";
  document.getElementById("status-symbol").style.color = isDown ? "var(--red)" : state.className === "pending" ? "var(--yellow)" : "var(--green)";

  const updated = data.last_checked || data.last_change;
  document.getElementById("updated-at").textContent = updated
    ? "Last checked: " + formatDate(updated)
    : "Waiting for the first monitoring result";
}

async function loadStatus() {
  try {
    const response = await fetch(STATUS_FILE + "?t=" + Date.now(), { cache: "no-store" });
    if (!response.ok) throw new Error("Status file unavailable");
    renderStatus(await response.json());
  } catch {
    renderStatus({ status: "pending", last_checked: null });
    document.getElementById("status-description").textContent =
      "Status data is not available yet. The monitor may still be setting up.";
  }
}

loadStatus();
setInterval(loadStatus, 60000);

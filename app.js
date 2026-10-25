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
    title: "Checking website…",
    description: "Checking the EggSys website now.",
    symbol: "…",
    pill: "Checking",
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

  document.getElementById("updated-at").textContent = data.checked_at
    ? "Last checked: " + formatDate(data.checked_at)
    : "Checking now…";
}

async function checkWebsite() {
  renderStatus({ status: "pending" });

  try {
    const response = await fetch("/api/check?t=" + Date.now(), { cache: "no-store" });
    if (!response.ok) throw new Error("Check endpoint returned HTTP " + response.status);
    renderStatus(await response.json());
  } catch {
    renderStatus({
      status: "outage",
      checked_at: new Date().toISOString()
    });
    document.getElementById("status-description").textContent =
      "The status check could not be completed. Please try again later.";
  }
}

checkWebsite();
setInterval(checkWebsite, 60000);

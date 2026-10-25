const statusUI = {
  operational: { title: "All systems operational", description: "The website is responding to automated checks.", symbol: "✓", pill: "Operational", className: "up" },
  degraded: { title: "Service may be degraded", description: "The latest check did not receive a successful response.", symbol: "!", pill: "Degraded", className: "down" },
  outage: { title: "Service outage detected", description: "The website did not respond successfully to the latest check.", symbol: "×", pill: "Outage", className: "down" },
  pending: { title: "Checking website…", description: "Checking the website now.", symbol: "…", pill: "Checking", className: "pending" }
};

function formatDate(value) {
  if (!value) return "Time not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time not available";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function renderStatus(data, prefix = "") {
  const state = statusUI[data.status] || statusUI.pending;
  document.getElementById(prefix + "status-symbol").textContent = state.symbol;
  document.getElementById(prefix + "status-title").textContent = state.title;
  document.getElementById(prefix + "status-description").textContent = state.description;
  const pill = document.getElementById(prefix + "status-pill");
  pill.textContent = state.pill;
  pill.className = "status-pill " + (state.className === "down" ? "down" : state.className === "pending" ? "pending" : "");
  const card = document.getElementById(prefix ? "home-status-card" : "status-card") || document.querySelector(prefix ? "#home-status-card" : ".status-card");
  const isDown = data.status === "outage" || data.status === "degraded";
  card.classList.toggle("is-down", isDown);
  const symbol = document.getElementById(prefix + "status-symbol");
  symbol.style.background = isDown ? "#51252c" : state.className === "pending" ? "#44391f" : "#1a4437";
  symbol.style.color = isDown ? "var(--red)" : state.className === "pending" ? "var(--yellow)" : "var(--green)";
  document.getElementById(prefix + "updated-at").textContent = data.checked_at ? "Last checked: " + formatDate(data.checked_at) : "Checking now…";
}

async function checkWebsite(endpoint, prefix = "") {
  renderStatus({ status: "pending" }, prefix);
  try {
    const response = await fetch(endpoint + "?t=" + Date.now(), { cache: "no-store" });
    if (!response.ok) throw new Error("Check endpoint returned HTTP " + response.status);
    renderStatus(await response.json(), prefix);
  } catch {
    renderStatus({ status: "outage", checked_at: new Date().toISOString() }, prefix);
    document.getElementById(prefix + "status-description").textContent = "The status check could not be completed. Please try again later.";
  }
}

checkWebsite("/api/check");
checkWebsite("/api/check-home", "home-");
setInterval(() => checkWebsite("/api/check"), 60000);
setInterval(() => checkWebsite("/api/check-home", "home-"), 60000);

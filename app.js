const services = [
  { id: "homepage", name: "TC Homepage", url: "https://theegget.com", description: "The main Theegget Creations landing page." },
  { id: "creations", name: "Creations", url: "https://creations.theegget.com", description: "The Theegget Creations hub." },
  { id: "accounts", name: "TC Accounts", url: "https://accounts.theegget.com", description: "TC account and sign-in services." },
  { id: "admin", name: "TC Admin", url: "https://admin.theegget.com", description: "The TC administration dashboard." },
  { id: "social", name: "Theegget's Social", url: "https://social.theegget.com", description: "The TC social platform." },
  { id: "sites", name: "TC Sites", url: "https://sites.theegget.com", description: "TC website management." },
  { id: "dev", name: "TC Dev", url: "https://dev.theegget.com", description: "The TC developer site." },
  { id: "eggsys", name: "EggSys", url: "https://eggsys.theegget.com", description: "The EggetSystem website." },
  { id: "tc-api", name: "API for TC", url: "https://tc-api.theegget.com/status", description: "Theegget Creations API." },
  { id: "es-api", name: "API for EggetSystem", url: "https://es-api.theegget.com/", description: "EggetSystem API." }
];

const statusUI = {
  operational: { title: "Operational", description: "The service responded successfully.", symbol: "✓", pill: "Operational", className: "up" },
  degraded: { title: "Degraded", description: "The service responded with an unexpected result.", symbol: "!", pill: "Degraded", className: "down" },
  outage: { title: "Service unavailable", description: "The service did not respond successfully to the latest check.", symbol: "×", pill: "Outage", className: "down" },
  pending: { title: "Checking…", description: "Checking the service now.", symbol: "…", pill: "Checking", className: "pending" }
};

function formatDate(value) {
  if (!value) return "Time not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time not available";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function createServiceCard(service) {
  const card = document.createElement("section");
  card.className = "status-card";
  card.id = service.id + "-card";
  card.setAttribute("aria-live", "polite");
  card.innerHTML = `
    <div class="status-symbol" id="${service.id}-symbol" aria-hidden="true">…</div>
    <div class="status-copy">
      <p class="service-name"></p>
      <p class="status-kicker">CURRENT STATUS</p>
      <h2 id="${service.id}-title">Checking…</h2>
      <p id="${service.id}-description"></p>
      <a class="service-link" href="${service.url}" target="_blank" rel="noopener noreferrer">${service.url.replace(/^https:\/\//, "")} ↗</a>
    </div>
    <span class="status-pill pending" id="${service.id}-pill">Checking</span>
  `;
  card.querySelector(".service-name").textContent = service.name;
  document.getElementById("services-list").append(card);
  const updated = document.createElement("p");
  updated.className = "updated-at";
  updated.id = service.id + "-updated";
  updated.textContent = "Waiting for first check…";
  document.getElementById("services-list").append(updated);
}

function renderStatus(service, data) {
  const state = statusUI[data.status] || statusUI.pending;
  const card = document.getElementById(service.id + "-card");
  const symbol = document.getElementById(service.id + "-symbol");
  symbol.textContent = state.symbol;
  symbol.style.background = state.className === "down" ? "#51252c" : state.className === "pending" ? "#44391f" : "#1a4437";
  symbol.style.color = state.className === "down" ? "var(--red)" : state.className === "pending" ? "var(--yellow)" : "var(--green)";
  document.getElementById(service.id + "-title").textContent = state.title;
  document.getElementById(service.id + "-description").textContent = data.status === "operational" ? service.description : state.description;
  const pill = document.getElementById(service.id + "-pill");
  pill.textContent = state.pill;
  pill.className = "status-pill " + (state.className === "down" ? "down" : state.className === "pending" ? "pending" : "");
  card.classList.toggle("is-down", state.className === "down");
  document.getElementById(service.id + "-updated").textContent = data.checked_at ? "Last checked: " + formatDate(data.checked_at) : "Checking now…";
}

async function checkService(service) {
  renderStatus(service, { status: "pending" });
  try {
    const response = await fetch("/api/check/" + service.id + "?t=" + Date.now(), { cache: "no-store" });
    if (!response.ok) throw new Error("Status endpoint returned HTTP " + response.status);
    renderStatus(service, await response.json());
  } catch {
    renderStatus(service, { status: "outage", checked_at: new Date().toISOString() });
    document.getElementById(service.id + "-description").textContent = "The status check could not be completed.";
  }
}

services.forEach(createServiceCard);
services.forEach(checkService);
setInterval(() => services.forEach(checkService), 60000);

const services = [
  { id: "homepage", name: "TC Homepage", host: "theegget.com", url: "https://theegget.com", description: "The main Theegget Creations landing page." },
  { id: "creations", name: "Creations", host: "creations.theegget.com", url: "https://creations.theegget.com", description: "The Theegget Creations hub." },
  { id: "accounts", name: "TC Accounts", host: "accounts.theegget.com", url: "https://accounts.theegget.com", description: "TC account and sign-in services." },
  { id: "social", name: "Theegget's Social", host: "social.theegget.com", url: "https://social.theegget.com", description: "The TC social platform." },
  { id: "sites", name: "TC Sites", host: "sites.theegget.com", url: "https://sites.theegget.com", description: "TC website management." },
  { id: "dev", name: "TC Dev", host: "dev.theegget.com", url: "https://dev.theegget.com", description: "The TC developer site." },
  { id: "eggsys", name: "EggSys", host: "eggsys.theegget.com", url: "https://eggsys.theegget.com", description: "The EggetSystem website." },
  { id: "tc-api", name: "API for TC", host: "tc-api.theegget.com", url: "https://tc-api.theegget.com/status", description: "Theegget Creations API." },
  { id: "es-api", name: "API for EggetSystem", host: "es-api.theegget.com", url: "https://es-api.theegget.com/", description: "EggetSystem API." }
];

const statusUI = {
  operational: { title: "Operational", description: "The service responded successfully.", symbol: "✓", pill: "Operational", className: "up" },
  degraded: { title: "Degraded", description: "The service responded with an unexpected result.", symbol: "!", pill: "Degraded", className: "down" },
  outage: { title: "Service unavailable", description: "The service did not respond successfully to the latest check.", symbol: "×", pill: "Outage", className: "down" },
  pending: { title: "Checking…", description: "Checking the service now.", symbol: "…", pill: "Checking", className: "pending" },
  maintenance: { title: "Maintenance", description: "This service is currently under scheduled or server-wide maintenance.", symbol: "⚙", pill: "Maintenance", className: "maintenance" }
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
    <div class="status-copy">
      <h2 class="service-name"></h2>
      <div class="service-status-line">
        <a class="service-link" href="${service.url}" target="_blank" rel="noopener noreferrer">${service.host}</a>
        <span class="status-pill pending" id="${service.id}-pill">Checking</span>
      </div>
    </div>
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
  const state = statusUI[data.maintenance ? "maintenance" : data.status] || statusUI.pending;
  const pill = document.getElementById(service.id + "-pill");
  pill.textContent = state.pill;
  pill.className = "status-pill " + (state.className === "down" ? "down" : state.className === "pending" ? "pending" : state.className === "maintenance" ? "maintenance" : "");
  const card = document.getElementById(service.id + "-card");
  card.classList.toggle("is-down", state.className === "down");
  card.classList.toggle("is-maintenance", state.className === "maintenance");
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
  }
}

services.forEach(createServiceCard);
services.forEach(checkService);
setInterval(() => services.forEach(checkService), 60000);

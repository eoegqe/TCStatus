const targets = {
  homepage: { url: "https://theegget.com", service: "TC Homepage" },
  creations: { url: "https://creations.theegget.com", service: "Creations" },
  accounts: { url: "https://accounts.theegget.com", service: "TC Accounts" },
  social: { url: "https://social.theegget.com", service: "Theegget's Social" },
  sites: { url: "https://sites.theegget.com", service: "TC Sites" },
  dev: { url: "https://dev.theegget.com", service: "TC Dev" },
  eggsys: { url: "https://eggsys.theegget.com", service: "EggSys" },
  "tc-api": { url: "https://tc-api.theegget.com/status", service: "API for TC" },
  "es-api": { url: "https://es-api.theegget.com/", service: "API for EggetSystem" }
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/api\/check\/([a-z-]+)$/);
    const target = match ? targets[match[1]] : null;

    if (!target) return env.ASSETS.fetch(request);

    if (request.method !== "GET") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "GET" }
      });
    }

    const checkedAt = new Date().toISOString();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(target.url, {
        method: "GET",
        headers: { "User-Agent": "TCStatus-Manual-Check/1.0" },
        signal: controller.signal,
        redirect: "follow"
      });

      return Response.json({
        service: target.service,
        status: response.status >= 200 && response.status < 400 ? "operational" : "outage",
        http_status: response.status,
        checked_at: checkedAt
      }, { headers: { "Cache-Control": "no-store" } });
    } catch {
      return Response.json({
        service: target.service,
        status: "outage",
        http_status: null,
        checked_at: checkedAt
      }, { headers: { "Cache-Control": "no-store" } });
    } finally {
      clearTimeout(timeout);
    }
  }
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/check") {
      return env.ASSETS.fetch(request);
    }

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
      const response = await fetch("https://eggsys.theegget.com", {
        method: "GET",
        headers: { "User-Agent": "TCStatus-Manual-Check/1.0" },
        signal: controller.signal,
        redirect: "follow"
      });

      return Response.json({
        service: "EggSys website",
        status: response.status >= 200 && response.status < 400 ? "operational" : "outage",
        http_status: response.status,
        checked_at: checkedAt
      }, {
        headers: { "Cache-Control": "no-store" }
      });
    } catch {
      return Response.json({
        service: "EggSys website",
        status: "outage",
        http_status: null,
        checked_at: checkedAt
      }, {
        headers: { "Cache-Control": "no-store" }
      });
    } finally {
      clearTimeout(timeout);
    }
  }
};

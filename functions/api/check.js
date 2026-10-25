export async function onRequestGet() {
  const url = "https://eggsys.theegget.com";
  const checkedAt = new Date().toISOString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "TCStatus-Manual-Check/1.0" },
      signal: controller.signal,
      redirect: "follow"
    });
    const status = response.status >= 200 && response.status < 400 ? "operational" : "outage";
    return Response.json({
      service: "EggSys website",
      status,
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

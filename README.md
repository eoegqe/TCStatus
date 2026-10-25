# TCStatus — EggSys Status

A lightweight status page for the EggSys website operated by Theegget Creations.

**Monitored service:** https://eggsys.theegget.com

## Cloudflare Worker deployment

This repository is configured for the Cloudflare Worker named `tcstatus`, using the dashboard's `npx wrangler deploy` command.

- `wrangler.jsonc` configures the Worker and serves the static files from the repository root.
- `worker.js` provides the `GET /api/check` endpoint used by the **Check now** button.
- `.assetsignore` prevents Worker source/configuration and GitHub workflow files from being published as public static assets.

The Cloudflare Worker should use the repository root as its root directory and deploy with `npx wrangler deploy`.

## Monitoring

The GitHub Actions workflow at `.github/workflows/monitor.yml` checks the EggSys website approximately every five minutes and can also be started manually from **Actions → Monitor EggSys website → Run workflow**.

The workflow uses the repository's Actions token to commit `status.json` when the detected status changes. It records incidents for transitions after the initial check, retaining the latest 50 recorded incidents.

## Notes

- The check confirms that the public website returns an HTTP response in the successful range (200–399); it does not test login, APIs, or every feature inside EggSys.
- Scheduled checks depend on GitHub Actions being enabled and may start later than the exact scheduled minute.
- Status data is served from `status.json` alongside the static page.

# TCStatus — EggSys Status

A lightweight status page for the EggSys website operated by Theegget Creations.

**Monitored service:** https://eggsys.theegget.com

## GitHub Pages setup

1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select branch **main** and folder **/ (root)**, then save.
4. Wait for GitHub Pages to publish the site. The page should be available at the Pages URL shown in Settings.

## Monitoring

The GitHub Actions workflow at `.github/workflows/monitor.yml` checks the EggSys website approximately every five minutes and can also be started manually from **Actions → Monitor EggSys website → Run workflow**.

The workflow uses the repository's Actions token to commit `status.json` when the detected status changes. It records incidents for transitions after the initial check, retaining the latest 50 recorded incidents.

## Notes

- The check confirms that the public website returns an HTTP response in the successful range (200–399); it does not test login, APIs, or every feature inside EggSys.
- Scheduled checks depend on GitHub Actions being enabled and may start later than the exact scheduled minute.
- Status data is served from `status.json` alongside the static page.
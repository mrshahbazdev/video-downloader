# All-in-One Video Downloader (AdSense-Ready)

A polished, AdSense-ready Node.js video downloader built on top of [yt-dlp](https://github.com/yt-dlp/yt-dlp). It supports 1000+ sites (YouTube, TikTok, Instagram, Twitter/X, Facebook, Vimeo, Dailymotion, Reddit, and many more) through a clean web UI and REST API.

## Features

- Modern, responsive UI with dark/light mode.
- Web UI to paste a URL, preview video info, and download.
- REST API (`/api/info`, `/api/download`, `/health`).
- Format selection (best, bestvideo, bestaudio, or specific format id).
- Cookie-consent banner for GDPR/Cookie Law compliance.
- Legal pages: Privacy Policy, Terms of Service, DMCA, Disclaimer, Cookie Policy.
- SEO meta tags, Open Graph, Twitter Cards, robots.txt, and sitemap.xml.
- AdSense placeholders and dynamic `ads.txt` generation.
- Downloads saved in the `downloads/` folder.
- CLI for command-line use.

## Requirements

- Node.js 18+
- Python 3.10+ (yt-dlp will auto-download on first run)

## Install

```bash
cd video-downloader
npm install
```

Copy environment file:

```bash
cp .env.example .env
```

Edit `.env` to set:

```env
PORT=3000
SITE_TITLE=ClipVault
ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

Replace `ADSENSE_CLIENT_ID` with your real Google AdSense publisher ID to enable ads and `ads.txt`.

## Usage

### Web UI

```bash
npm start
```

Open <http://localhost:3000> in your browser.

### REST API

**Get video info:**

```bash
curl -X POST http://localhost:3000/api/info \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.youtube.com/watch?v=..."}'
```

**Download video:**

```bash
curl -X POST http://localhost:3000/api/download \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.youtube.com/watch?v=...","formatId":"best"}'
```

### CLI

```bash
node cli.js <URL> [formatId]
```

Example:

```bash
node cli.js "https://www.youtube.com/watch?v=..." best
```

## AdSense / Monetization

1. Update `ADSENSE_CLIENT_ID` in `.env`.
2. Add your ad units to the `ad-unit` partial or replace the placeholders on the pages.
3. Verify `/ads.txt` returns the correct AdSense line.
4. Submit the site to Google AdSense once it is live on a real domain.

## Important Pages for AdSense / SEO

- `/privacy` — Privacy Policy
- `/terms` — Terms of Service
- `/disclaimer` — Usage Disclaimer
- `/dmca` — Copyright Takedown
- `/cookie-policy` — Cookie Policy
- `/ads.txt` — AdSense authorization file
- `/robots.txt` — Search engine instructions
- `/sitemap.xml` — Sitemap for search engines

## Supported Sites

This tool uses yt-dlp, which supports 1000+ sites. See the full list:
<https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md>

## Disclaimer

Only download content you have the right to use. Respect copyright law and the Terms of Service of each platform. This tool is for educational and personal use.

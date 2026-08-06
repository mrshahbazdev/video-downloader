# ClipVault — All-in-One Video Downloader (AdSense-Ready)

A polished, AdSense-ready Node.js video downloader built on top of [yt-dlp](https://github.com/yt-dlp/yt-dlp). It supports 1000+ sites (YouTube, TikTok, Instagram, Twitter/X, Facebook, Vimeo, Dailymotion, Reddit, and many more) through a clean web UI and REST API.

**Live demo:** https://clipvaultz.online (also works on any domain you point to the app)

## Features

- Modern, responsive UI with dark/light mode.
- Web UI to paste a URL, preview video info, and download.
- REST API (`/api/info`, `/api/download`, `/api/download-proxy`, `/health`).
- Format selection (best, bestvideo, bestaudio, or specific format id).
- Direct URL fallback for muxed formats — saves server bandwidth.
- Cookie-consent banner for GDPR/Cookie Law compliance.
- Legal pages: Privacy Policy, Terms of Service, DMCA, Disclaimer, Cookie Policy, Content Policy.
- SEO meta tags, Open Graph, Twitter Cards, robots.txt, and sitemap.xml.
- AdSense placeholders and dynamic `ads.txt` generation.
- Downloads saved in the `downloads/` folder and auto-cleaned.
- CLI for command-line use.
- **Admin panel (in progress)** — manage site settings, AdSense, GSC/Bing verification, tools, and blog posts via MySQL.

## Requirements

- Node.js 18+
- Python 3.10+ (yt-dlp will auto-download on first run)
- MySQL 5.7+ (optional for admin panel; SQLite fallback coming soon)

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
CONTACT_EMAIL=contact@clipvaultz.online
CONTACT_ADDRESS="123 Example St, City, Country"
YOUTUBE_COOKIES_PATH=
CAPTCHA_MODE=math
CAPTCHA_SECRET=change_me_to_a_random_string
DOWNLOAD_TOKEN_SECRET=change_me_to_another_random_string

# MySQL (only needed for the admin panel)
DB_HOST=localhost
DB_USER=clipvault_user
DB_PASSWORD=your_db_password
DB_NAME=clipvault_db
```

Replace `ADSENSE_CLIENT_ID` with your real Google AdSense publisher ID to enable ads and `ads.txt`.

## Build CSS

Tailwind CSS is built locally now (no CDN):

```bash
npm run build:css
```

For development:

```bash
npm run watch:css
```

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
- `/content-policy` — Acceptable Use & Copyright Policy
- `/ads.txt` — AdSense authorization file
- `/robots.txt` — Search engine instructions
- `/sitemap.xml` — Sitemap for search engines

## Admin Panel

A MySQL-backed admin panel is being added to manage:

- Site settings (title, description, contact info, logo, favicon).
- AdSense publisher ID and ad unit slots.
- Google Search Console and Bing Webmaster Tools verification codes.
- Tools catalog and static blog posts.
- User downloads and system health.

Required MySQL credentials are read from `.env`. Set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`, then restart the app. The admin tables are created automatically on startup.

## Deploy on cPanel / Live Domain

1. In cPanel, create a Node.js app for the new domain (`clipvaultz.online`).
2. Set the application root to the `public_html` folder.
3. Upload or clone this repo into that folder.
4. Run `npm install` in the application root.
5. Run `npm run build:css` to generate `public/css/tailwind.min.css`.
6. Edit `.env` with live credentials and your AdSense ID.
7. Create a MySQL database/user and add the credentials to `.env` (for admin panel).
8. Make sure the `.htaccess` paths match your cPanel username and domain. Default:
   ```
   PassengerAppRoot /home/jobspics/domains/clipvaultz.online/public_html
   PassengerNodejs /home/jobspics/nodevenv/domains/clipvaultz.online/public_html/20/bin/node
   ```
9. Restart the Node.js app in cPanel.
10. Point the domain's DNS A/AAAA records to your server IP.
11. Verify `/sitemap.xml`, `/robots.txt`, and `/ads.txt` load correctly.
12. Submit `https://clipvaultz.online/sitemap.xml` to Google Search Console and Bing Webmaster Tools.

## Supported Sites

This tool uses yt-dlp, which supports 1000+ sites. See the full list:
<https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md>

## Disclaimer

Only download content you have the right to use. Respect copyright law and the Terms of Service of each platform. This tool is for educational and personal use.

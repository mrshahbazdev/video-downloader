# All-in-One Video Downloader

A Node.js video downloader built on top of [yt-dlp](https://github.com/yt-dlp/yt-dlp), supporting 1000+ sites (YouTube, TikTok, Instagram, Twitter/X, Facebook, Vimeo, Dailymotion, Reddit, and many more).

## Features

- Web UI to paste a URL, preview video info, and download.
- REST API (`/api/info`, `/api/download`, `/health`).
- Format selection (best, bestvideo, bestaudio, or specific format id).
- CORS enabled for local development.
- Downloads saved in the `downloads/` folder.

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

Edit `.env` if you want to change `PORT` (default 3000).

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

## Supported Sites

This tool uses yt-dlp, which supports 1000+ sites. See the full list:
<https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md>

## Disclaimer

Only download content you have the right to use. Respect copyright law and the Terms of Service of each platform. This tool is for educational and personal use.

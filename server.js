require('dotenv').config();
const express = require('express');
const cors = require('cors');
const layouts = require('express-ejs-layouts');
const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');
const COOKIES_DIR = path.join(__dirname, 'cookies');
const SITE_TITLE = process.env.SITE_TITLE || 'ClipVault';
const ADSENSE_CLIENT_ID = process.env.ADSENSE_CLIENT_ID || 'ca-pub-0000000000000000';
const YOUTUBE_COOKIES_PATH = process.env.YOUTUBE_COOKIES_PATH || '';

if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(COOKIES_DIR)) {
  fs.mkdirSync(COOKIES_DIR, { recursive: true });
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(layouts);
app.set('layout', 'layout');

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.static('public'));
app.use('/downloads', express.static(DOWNLOADS_DIR));

app.locals = {
  siteTitle: SITE_TITLE,
  adsenseClientId: ADSENSE_CLIENT_ID,
  currentYear: new Date().getFullYear(),
};

function getReferer(url) {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

function cleanError(err) {
  const raw = err.stderr || err.message || 'Something went wrong';
  const lines = raw.split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('Deprecated Feature:'));
  const message = lines.join(' ') || 'Something went wrong';

  if (message.includes('Sign in to confirm')) {
    return 'This site is blocking automated requests. Try a different URL, or add cookies if you own the content.';
  }
  if (message.includes('Unsupported URL')) {
    return 'This URL is not supported or the video is unavailable. Check our Supported Sites list.';
  }
  if (message.includes('Unable to download') || message.includes('HTTP Error')) {
    return 'Could not access the video. It may be private, region-blocked, or removed.';
  }

  return message;
}

function getCookiePath(providedCookies) {
  if (YOUTUBE_COOKIES_PATH && fs.existsSync(YOUTUBE_COOKIES_PATH)) {
    return YOUTUBE_COOKIES_PATH;
  }
  if (!providedCookies) return null;
  const id = randomUUID();
  const cookiePath = path.join(COOKIES_DIR, `${id}.txt`);
  fs.writeFileSync(cookiePath, providedCookies);
  return cookiePath;
}

function cleanupCookiePath(cookiePath) {
  if (cookiePath && cookiePath !== YOUTUBE_COOKIES_PATH && fs.existsSync(cookiePath)) {
    fs.unlinkSync(cookiePath);
  }
}

function renderPage(req, res, view, options = {}) {
  const defaultMeta = {
    title: options.meta?.title || SITE_TITLE,
    description: options.meta?.description || 'Download videos from YouTube, TikTok, Instagram, Twitter, Facebook, and 1000+ sites quickly and securely.',
    image: '/images/og-default.png',
    url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
  };
  res.render(view, { ...options, meta: defaultMeta, path: req.path });
}

app.get('/', (req, res) => {
  renderPage(req, res, 'index', {
    meta: {
      title: `${SITE_TITLE} — Free Online Video Downloader`,
      description: 'Download videos from 1000+ platforms including YouTube, TikTok, Instagram, Facebook, Twitter, Vimeo, and Dailymotion.',
    },
  });
});

app.get('/supported-sites', (req, res) => {
  renderPage(req, res, 'supported-sites', {
    meta: {
      title: `Supported Sites — ${SITE_TITLE}`,
      description: 'Browse the 1000+ video platforms supported by our downloader.',
    },
  });
});

app.get('/how-to-use', (req, res) => {
  renderPage(req, res, 'how-to-use', {
    meta: {
      title: `How to Use — ${SITE_TITLE}`,
      description: 'Learn how to download videos from your favorite platforms in seconds.',
    },
  });
});

app.get('/about', (req, res) => {
  renderPage(req, res, 'about', {
    meta: {
      title: `About — ${SITE_TITLE}`,
      description: `Learn more about ${SITE_TITLE}, a privacy-friendly online video downloader.`,
    },
  });
});

app.get('/contact', (req, res) => {
  renderPage(req, res, 'contact', {
    meta: {
      title: `Contact — ${SITE_TITLE}`,
      description: 'Get in touch with the ClipVault team.',
    },
  });
});

app.get('/privacy', (req, res) => {
  renderPage(req, res, 'privacy', {
    meta: {
      title: `Privacy Policy — ${SITE_TITLE}`,
      description: 'Read how we handle your data and protect your privacy.',
    },
  });
});

app.get('/terms', (req, res) => {
  renderPage(req, res, 'terms', {
    meta: {
      title: `Terms of Service — ${SITE_TITLE}`,
      description: 'Read the terms and conditions for using our video downloader.',
    },
  });
});

app.get('/dmca', (req, res) => {
  renderPage(req, res, 'dmca', {
    meta: {
      title: `DMCA — ${SITE_TITLE}`,
      description: 'Report copyright violations and submit takedown requests.',
    },
  });
});

app.get('/disclaimer', (req, res) => {
  renderPage(req, res, 'disclaimer', {
    meta: {
      title: `Disclaimer — ${SITE_TITLE}`,
      description: 'Important usage and copyright disclaimers.',
    },
  });
});

app.get('/cookie-policy', (req, res) => {
  renderPage(req, res, 'cookie-policy', {
    meta: {
      title: `Cookie Policy — ${SITE_TITLE}`,
      description: 'Read how we use cookies and similar technologies.',
    },
  });
});

app.get('/ads.txt', (req, res) => {
  if (!ADSENSE_CLIENT_ID || ADSENSE_CLIENT_ID === 'ca-pub-0000000000000000') {
    return res.type('text/plain').send('# Add ADSENSE_CLIENT_ID to your .env file to enable ads.txt');
  }
  const pubId = ADSENSE_CLIENT_ID.replace('ca-pub-', '');
  res.type('text/plain').send(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0`);
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nAllow: /\nDisallow: /downloads/\nSitemap: /sitemap.xml');
});

app.get('/sitemap.xml', (req, res) => {
  const host = `${req.protocol}://${req.get('host')}`;
  const pages = ['', 'supported-sites', 'how-to-use', 'about', 'contact', 'privacy', 'terms', 'dmca', 'disclaimer', 'cookie-policy'];
  const urls = pages.map((p) => `<url><loc>${host}/${p}</loc><changefreq>weekly</changefreq><priority>${p === '' ? '1.0' : '0.8'}</priority></url>`).join('\n');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
});

app.post('/api/info', async (req, res) => {
  const { url, cookies } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const cookiePath = getCookiePath(cookies);

  try {
    const options = {
      dumpJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: [
        `referer:${getReferer(url)}`,
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ],
    };
    if (cookiePath) options.cookies = cookiePath;

    const info = await youtubedl(url, options);

    const formats = (info.formats || []).map((f) => ({
      format_id: f.format_id,
      ext: f.ext,
      resolution: f.resolution,
      quality: f.quality,
      filesize: f.filesize,
      filesize_approx: f.filesize_approx,
      vcodec: f.vcodec,
      acodec: f.acodec,
      abr: f.abr,
      vbr: f.vbr,
      fps: f.fps,
    }));

    res.json({
      id: info.id,
      title: info.title,
      description: info.description,
      duration: info.duration,
      thumbnail: info.thumbnail,
      webpage_url: info.webpage_url,
      uploader: info.uploader,
      formats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: cleanError(err) || 'Failed to fetch video info' });
  } finally {
    cleanupCookiePath(cookiePath);
  }
});

app.post('/api/download', async (req, res) => {
  const { url, formatId, cookies } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const id = randomUUID();
  const output = path.join(DOWNLOADS_DIR, `${id}_%(title)s.%(ext)s`);
  const cookiePath = getCookiePath(cookies);

  try {
    const options = {
      output,
      format: formatId || 'best',
      noCheckCertificates: true,
      noWarnings: true,
      addHeader: [
        `referer:${getReferer(url)}`,
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ],
    };
    if (cookiePath) options.cookies = cookiePath;

    await youtubedl(url, options);

    const files = fs.readdirSync(DOWNLOADS_DIR).filter((f) => f.startsWith(`${id}_`));
    if (!files.length) throw new Error('Download completed but file not found');

    const file = files[0];
    const sanitized = file.replace(/^[^_]+_/, '');
    fs.renameSync(path.join(DOWNLOADS_DIR, file), path.join(DOWNLOADS_DIR, sanitized));

    res.json({
      success: true,
      filename: sanitized,
      downloadUrl: `/downloads/${encodeURIComponent(sanitized)}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: cleanError(err) || 'Download failed' });
  } finally {
    cleanupCookiePath(cookiePath);
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).render('404', {
    path: req.path,
    meta: {
      title: `404 — ${SITE_TITLE}`,
      description: 'The page you are looking for was not found.',
    },
  });
});

app.listen(PORT, () => {
  console.log(`${SITE_TITLE} server running at http://localhost:${PORT}`);
});

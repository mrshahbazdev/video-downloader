require('dotenv').config();
const express = require('express');
const cors = require('cors');
const layouts = require('express-ejs-layouts');
const fs = require('fs');
const path = require('path');
const { createYtdl, findPython } = require('./lib/ytdlp');
const { downloadYtdlp } = require('./scripts/install-ytdlp');
const { pipeline } = require('node:stream/promises');
const { Readable } = require('node:stream');
const SYSTEM_YTDLP = '/home/ubuntu/.local/bin/yt-dlp';
const DEFAULT_YTDLP = path.join(__dirname, 'bin', 'yt-dlp');
let YTDLP_BINARY = process.env.YOUTUBE_DL_BINARY || (fs.existsSync(SYSTEM_YTDLP) ? SYSTEM_YTDLP : (fs.existsSync(DEFAULT_YTDLP) ? DEFAULT_YTDLP : DEFAULT_YTDLP));
let youtubedl;
const crypto = require('crypto');
const { randomUUID } = crypto;

const app = express();
const PORT = process.env.PORT || 3000;
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');
const COOKIES_DIR = path.join(__dirname, 'cookies');
const SITE_TITLE = process.env.SITE_TITLE || 'ClipVault';
const ADSENSE_CLIENT_ID = process.env.ADSENSE_CLIENT_ID || 'ca-pub-0000000000000000';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'contact@example.com';
const CONTACT_ADDRESS = process.env.CONTACT_ADDRESS || '';
const YOUTUBE_COOKIES_PATH = process.env.YOUTUBE_COOKIES_PATH || '';
const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY || '';
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || '';
const CAPTCHA_MODE = process.env.CAPTCHA_MODE || (RECAPTCHA_SITE_KEY ? 'recaptcha' : 'math');
const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || require('crypto').randomBytes(32).toString('hex');

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
  contactEmail: CONTACT_EMAIL,
  contactAddress: CONTACT_ADDRESS,
  currentYear: new Date().getFullYear(),
  recaptchaSiteKey: RECAPTCHA_SITE_KEY,
  captchaMode: CAPTCHA_MODE,
};

function getReferer(url) {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

async function verifyRecaptcha(token) {
  if (!RECAPTCHA_SECRET_KEY) return { success: true, skipped: true };
  if (!token) return { success: false, error: 'Captcha token missing' };

  try {
    const params = new URLSearchParams();
    params.append('secret', RECAPTCHA_SECRET_KEY);
    params.append('response', token);
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: params,
    });
    const data = await response.json();
    if (!data.success) {
      return { success: false, error: data['error-codes']?.join(', ') || 'Captcha verification failed' };
    }
    const score = typeof data.score === 'number' ? data.score : 1;
    if (score < 0.3) {
      return { success: false, error: 'Suspicious activity detected. Please try again.' };
    }
    return { success: true, score };
  } catch (err) {
    return { success: false, error: 'Could not verify captcha' };
  }
}

function createMathCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const expires = Date.now() + 5 * 60 * 1000;
  const payload = `${a}:${b}:${expires}`;
  const sig = crypto.createHmac('sha256', CAPTCHA_SECRET).update(payload).digest('hex');
  return { token: `${payload}:${sig}`, a, b, answer: a + b };
}

function verifyMathCaptcha(token, answer) {
  if (!token || answer === undefined || answer === '') return { success: false, error: 'Please solve the math challenge' };
  try {
    const [a, b, expires, sig] = token.split(':');
    const payload = `${a}:${b}:${expires}`;
    const expectedSig = crypto.createHmac('sha256', CAPTCHA_SECRET).update(payload).digest('hex');
    if (sig !== expectedSig || Date.now() > parseInt(expires, 10)) {
      return { success: false, error: 'Captcha expired or invalid. Please refresh.' };
    }
    const expected = String(parseInt(a, 10) + parseInt(b, 10));
    if (String(answer).trim() !== expected) {
      return { success: false, error: 'Incorrect answer. Please try again.' };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Invalid captcha' };
  }
}

async function verifyCaptcha(token, answer) {
  if (CAPTCHA_MODE === 'none') return { success: true, skipped: true };
  if (CAPTCHA_MODE === 'math') return verifyMathCaptcha(token, answer);
  return verifyRecaptcha(token);
}

function isYouTube(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    return host === 'youtube.com' || host === 'www.youtube.com' || host === 'youtu.be' || host === 'm.youtube.com' || host.includes('youtube-nocookie.com');
  } catch {
    return false;
  }
}

function isTikTok(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === 'tiktok.com' || host.endsWith('.tiktok.com');
  } catch {
    return false;
  }
}

async function fetchTikWM(url) {
  const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error(`TikWM API returned ${response.status}`);
  const json = await response.json();
  if (json.code !== 0 || !json.data) throw new Error(json.msg || 'TikWM returned no data');
  return json.data;
}

function mapTikTokInfo(data) {
  return {
    id: data.id,
    title: data.title || `TikTok video ${data.id}`,
    description: data.title || '',
    duration: data.duration || 0,
    thumbnail: data.cover,
    webpage_url: `https://www.tiktok.com/@${data.author?.unique_id || 'user'}/video/${data.id}`,
    uploader: data.author?.unique_id || '',
    formats: [
      {
        format_id: 'tiktok-video',
        ext: 'mp4',
        resolution: 'HD',
        quality: 'HD',
        filesize: data.size || null,
        filesize_approx: data.size || null,
        vcodec: 'h264',
        acodec: 'aac',
        abr: null,
        vbr: null,
        fps: null,
      },
      {
        format_id: 'tiktok-audio',
        ext: 'mp3',
        resolution: 'audio only',
        quality: 'audio only',
        filesize: null,
        filesize_approx: null,
        vcodec: 'none',
        acodec: 'mp3',
        abr: null,
        vbr: null,
        fps: null,
      },
    ],
  };
}

async function downloadTikTokMedia(url, formatId, outputPath, data = null) {
  if (!data) data = await fetchTikWM(url);
  const mediaUrl = formatId === 'tiktok-audio' || formatId === 'audio' ? data.music : (data.hdplay || data.play);
  if (!mediaUrl) throw new Error('TikWM did not return a media URL');
  const response = await fetch(mediaUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Referer: 'https://www.tiktok.com/',
    },
  });
  if (!response.ok) throw new Error(`Failed to download TikTok media: ${response.status}`);
  await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(outputPath));
  return { title: data.title, thumbnail: data.cover };
}

function cleanError(err) {
  const raw = err.stderr || err.message || 'Something went wrong';
  const lines = raw.split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('Deprecated Feature:'));
  const message = lines.join(' ') || 'Something went wrong';

  if (message.includes('Sign in to confirm')) {
    return 'YouTube is blocking this server. Try the mweb client, or add PO token + visitor data (or cookies) in Advanced options.';
  }
  if (message.includes('Watch video on YouTube') || message.includes('Error code: 152')) {
    return 'This format is not directly downloadable. Try “Best available” or a different format.';
  }
  if (message.includes('Unsupported URL')) {
    return 'This URL is not supported or the video is unavailable. Check our Supported Sites list.';
  }
  if (message.includes('Your IP address is blocked') || message.includes('HTTP Error 403') || message.includes('HTTP Error 412')) {
    return 'This site is blocking the server IP. Try a proxy (set PROXY_URL in .env) or use cookies if the video is yours.';
  }
  if (message.includes('Unable to download') || message.includes('HTTP Error')) {
    return 'Could not access the video. It may be private, region-blocked, or removed.';
  }

  return message;
}

function sanitizeFilename(title) {
  return String(title || 'video')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 50) || 'video';
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

function getBaseOptions(url, cookiePath) {
  const options = {
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
    addHeader: [
      `referer:${getReferer(url)}`,
      'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ],
  };
  if (process.env.YTDLP_IMPERSONATE === '1') options.impersonate = 'chrome';
  if (process.env.PROXY_URL) options.proxy = process.env.PROXY_URL;
  if (cookiePath) options.cookies = cookiePath;
  return options;
}

function getYouTubeExtractorArgs(poToken, visitorData) {
  const args = [];
  if (poToken && visitorData) {
    args.push(`youtube:player_client=web;player_skip=webpage,configs;po_token=${poToken};visitor_data=${visitorData}`);
    args.push(`youtube:player_client=mweb;po_token=${poToken};visitor_data=${visitorData}`);
  }
  args.push('youtube:player_client=mweb');
  args.push('youtube:player_client=ios;player_skip=webpage,configs');
  args.push('youtube:player_client=android;player_skip=webpage,configs');
  args.push('youtube:player_client=tv');
  args.push('youtube:player_client=web_embedded;player_skip=webpage,configs');
  return [...new Set(args)];
}

function buildOptionSets(base, url, poToken, visitorData) {
  const sets = [base];
  if (!isYouTube(url)) return sets;

  getYouTubeExtractorArgs(poToken, visitorData).forEach((arg) => {
    sets.push({ ...base, extractorArgs: arg });
  });

  return sets;
}

async function callWithFallbacks(url, baseOptions) {
  let lastError;
  for (const opts of baseOptions) {
    try {
      return await youtubedl(url, opts);
    } catch (err) {
      lastError = err;
      console.error('yt-dlp attempt failed:', cleanError(err));
    }
  }
  throw lastError || new Error('All download attempts failed');
}

function getMeta(req, options = {}) {
  const host = `${req.protocol}://${req.get('host')}`;
  return {
    title: options.meta?.title || SITE_TITLE,
    description: options.meta?.description || 'Download videos from YouTube, TikTok, Instagram, Twitter, Facebook, and 1000+ sites quickly and securely.',
    keywords: options.meta?.keywords || '',
    image: `${host}/images/og-default.png`,
    url: `${host}${req.originalUrl}`,
  };
}

function renderPage(req, res, view, options = {}) {
  res.render(view, { ...options, meta: getMeta(req, options), path: req.path });
}

app.get('/', (req, res) => {
  renderPage(req, res, 'index', {
    meta: {
      title: `${SITE_TITLE} — Free All-in-One Video Downloader for 1000+ Sites`,
      description: 'Download videos and audio from YouTube, TikTok, Instagram, Facebook, Twitter/X, Vimeo, Dailymotion, Reddit, Twitch, SoundCloud, and 1000+ sites for free.',
      keywords: 'free video downloader, online video downloader, YouTube downloader, TikTok downloader, Instagram downloader, download videos online, MP4 downloader',
    },
  });
});

app.get('/supported-sites', (req, res) => {
  renderPage(req, res, 'supported-sites', {
    meta: {
      title: `1000+ Supported Video Sites — Free All-in-One Downloader`,
      description: 'Download videos from 1000+ sites including YouTube, TikTok, Instagram, Facebook, Twitter/X, Vimeo, Dailymotion, Reddit, Twitch, SoundCloud, Bilibili, TED, and more.',
      keywords: 'video downloader, download videos online, YouTube downloader, TikTok downloader, Instagram downloader, Facebook downloader, Twitter video downloader, Vimeo downloader, Dailymotion downloader, free video downloader',
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

const blogPosts = require('./data/blogPosts.json');
app.locals.blogPosts = blogPosts;

app.get('/blog', (req, res) => {
  renderPage(req, res, 'blog/index', {
    meta: {
      title: `Video Downloading Guides — ${SITE_TITLE}`,
      description: 'Step-by-step guides for downloading YouTube, TikTok, Instagram, Facebook, Twitter/X, Vimeo, Dailymotion, and 1000+ supported sites.',
      keywords: 'video downloader guides, how to download YouTube videos, TikTok downloader guide, Instagram downloader tutorial, free video downloader tutorials',
    },
  });
});

app.get('/blog/:slug', (req, res, next) => {
  const post = blogPosts.find((p) => p.slug === req.params.slug);
  if (!post) return next();
  const viewPath = path.join(__dirname, 'views', 'blog', `${post.slug}.ejs`);
  const meta = {
    title: `${post.title}`,
    description: post.description || `Read our guide on ${post.title.toLowerCase()} at ${SITE_TITLE}.`,
    keywords: `${post.site} downloader, download ${post.site} videos, ${post.site} to mp4, ${post.site} to mp3, free ${post.site} downloader`,
  };
  if (fs.existsSync(viewPath)) {
    return renderPage(req, res, `blog/${post.slug}`, { meta, post });
  }
  renderPage(req, res, 'blog/post', { meta, post });
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
  const pages = ['', 'supported-sites', 'how-to-use', 'about', 'contact', 'privacy', 'terms', 'dmca', 'disclaimer', 'cookie-policy', 'blog'];
  const blogUrls = blogPosts.map((p) => `<url><loc>${host}/blog/${p.slug}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('\n');
  const urls = pages.map((p) => `<url><loc>${host}/${p}</loc><changefreq>weekly</changefreq><priority>${p === '' ? '1.0' : '0.8'}</priority></url>`).join('\n');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n${blogUrls}\n</urlset>`);
});

app.get('/api/captcha', (req, res) => {
  if (CAPTCHA_MODE !== 'math') return res.json({ mode: CAPTCHA_MODE });
  const { token, a, b } = createMathCaptcha();
  res.json({ token, question: `What is ${a} + ${b}?` });
});

app.post('/api/info', async (req, res) => {
  const { url, cookies, poToken, visitorData, captchaToken, captchaAnswer } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const captcha = await verifyCaptcha(captchaToken, captchaAnswer);
  if (!captcha.success) {
    return res.status(403).json({ error: `Captcha verification failed: ${captcha.error}` });
  }

  const cookiePath = getCookiePath(cookies);

  try {
    const base = {
      ...getBaseOptions(url, cookiePath),
      dumpJson: true,
    };

    const info = await callWithFallbacks(url, buildOptionSets(base, url, poToken, visitorData));

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
    if (isTikTok(url)) {
      try {
        const tw = await fetchTikWM(url);
        return res.json(mapTikTokInfo(tw));
      } catch (twErr) {
        console.error('TikWM fallback failed:', twErr);
      }
    }
    res.status(500).json({ error: cleanError(err) || 'Failed to fetch video info' });
  } finally {
    cleanupCookiePath(cookiePath);
  }
});

app.post('/api/download', async (req, res) => {
  const { url, formatId, cookies, poToken, visitorData, captchaToken, captchaAnswer, title } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const captcha = await verifyCaptcha(captchaToken, captchaAnswer);
  if (!captcha.success) {
    return res.status(403).json({ error: `Captcha verification failed: ${captcha.error}` });
  }

  const id = randomUUID();
  const safeTitle = sanitizeFilename(title);
  const output = path.join(DOWNLOADS_DIR, `${id}.%(ext)s`);
  const cookiePath = getCookiePath(cookies);

  try {
    const selectedFormat = formatId && formatId !== 'best' ? formatId : 'bestvideo*+bestaudio/best';
    const base = {
      ...getBaseOptions(url, cookiePath),
      output,
      format: selectedFormat,
    };

    await callWithFallbacks(url, buildOptionSets(base, url, poToken, visitorData));

    const files = fs.readdirSync(DOWNLOADS_DIR).filter((f) => f.startsWith(`${id}.`) && !f.endsWith('.part'));
    if (!files.length) throw new Error('Download completed but file not found');

    const file = files[0];
    const ext = path.extname(file);
    const sanitized = `${safeTitle}_${id}${ext}`;
    fs.renameSync(path.join(DOWNLOADS_DIR, file), path.join(DOWNLOADS_DIR, sanitized));

    res.json({
      success: true,
      filename: sanitized,
      downloadUrl: `/downloads/${encodeURIComponent(sanitized)}`,
    });
  } catch (err) {
    console.error(err);
    if (isTikTok(url)) {
      try {
        const tw = await fetchTikWM(url);
        const safeTitle = String(tw.title || `tiktok-${tw.id}`).replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').substring(0, 60) || 'tiktok';
        const ext = formatId === 'tiktok-audio' || formatId === 'audio' ? 'mp3' : 'mp4';
        const file = `${id}_${safeTitle}.${ext}`;
        const outputPath = path.join(DOWNLOADS_DIR, file);
        await downloadTikTokMedia(url, formatId, outputPath, tw);
        const sanitized = file.replace(/^[^_]+_/, '');
        fs.renameSync(outputPath, path.join(DOWNLOADS_DIR, sanitized));
        return res.json({
          success: true,
          filename: sanitized,
          downloadUrl: `/downloads/${encodeURIComponent(sanitized)}`,
        });
      } catch (twErr) {
        console.error('TikWM download fallback failed:', twErr);
      }
    }
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

async function startApp() {
  const pythonPath = findPython();
  if (!pythonPath) {
    console.warn('Warning: Python not found in PATH. yt-dlp requires Python 3.9+ to run. Set YOUTUBE_DL_PYTHON to the full path if needed.');
  } else {
    console.log('Using Python for yt-dlp:', pythonPath);
  }

  if (!process.env.YOUTUBE_DL_BINARY && !fs.existsSync(SYSTEM_YTDLP) && !fs.existsSync(YTDLP_BINARY)) {
    YTDLP_BINARY = await downloadYtdlp();
  }

  if (!fs.existsSync(YTDLP_BINARY)) {
    console.error(`yt-dlp binary not found at ${YTDLP_BINARY}. Set YOUTUBE_DL_BINARY or install Python + yt-dlp.`);
    youtubedl = async () => {
      throw new Error('yt-dlp is not configured. Set YOUTUBE_DL_BINARY or install Python so the app can download yt-dlp on startup.');
    };
  } else {
    youtubedl = createYtdl(YTDLP_BINARY);
    console.log('Using yt-dlp binary:', YTDLP_BINARY);
  }

  app.listen(PORT, () => {
    console.log(`${SITE_TITLE} server running at http://localhost:${PORT}`);
  });
}

startApp().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

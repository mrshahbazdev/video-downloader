require('dotenv').config();
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const layouts = require('express-ejs-layouts');
const fs = require('fs');
const path = require('path');
const { createYtdl, findPython } = require('./lib/ytdlp');
const { downloadYtdlp } = require('./scripts/install-ytdlp');
const { pipeline } = require('node:stream/promises');
const { Readable } = require('node:stream');
const session = require('express-session');
const { siteConfig, applySettings } = require('./lib/siteConfig');
const adminDb = require('./lib/adminDb');
const { router: adminRouter, ensureAdminUser } = require('./routes/admin');
const SYSTEM_YTDLP = '/home/ubuntu/.local/bin/yt-dlp';
const DEFAULT_YTDLP = path.join(__dirname, 'bin', 'yt-dlp');
let YTDLP_BINARY = process.env.YOUTUBE_DL_BINARY || (fs.existsSync(SYSTEM_YTDLP) ? SYSTEM_YTDLP : (fs.existsSync(DEFAULT_YTDLP) ? DEFAULT_YTDLP : DEFAULT_YTDLP));
let youtubedl;
const crypto = require('crypto');
const { randomUUID } = crypto;

const toolsData = require('./data/tools.json');
const blogPosts = require('./data/blogPosts.json');

const app = express();
const PORT = process.env.PORT || 3000;
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');

function getAssetVersion() {
  try {
    const cssStat = fs.statSync(path.join(__dirname, 'public', 'css', 'tailwind.min.css'));
    const jsStat = fs.statSync(path.join(__dirname, 'public', 'js', 'downloader.js'));
    return Math.floor(Math.max(cssStat.mtimeMs, jsStat.mtimeMs) / 1000).toString(16);
  } catch {
    return '1';
  }
}
const ASSET_VERSION = getAssetVersion();

function loadInlineCss() {
  try {
    return fs.readFileSync(path.join(__dirname, 'public', 'css', 'tailwind.min.css'), 'utf8');
  } catch {
    return '';
  }
}
const INLINE_CSS = loadInlineCss();
const COOKIES_DIR = path.join(__dirname, 'cookies');
const YOUTUBE_COOKIES_PATH = process.env.YOUTUBE_COOKIES_PATH || '';
const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY || '';
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || '';
const CAPTCHA_MODE = process.env.CAPTCHA_MODE || (RECAPTCHA_SITE_KEY ? 'recaptcha' : 'math');
const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || require('crypto').randomBytes(32).toString('hex');
const DOWNLOAD_TOKEN_SECRET = process.env.DOWNLOAD_TOKEN_SECRET || CAPTCHA_SECRET;

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

app.set('trust proxy', 1);

// cPanel Passenger reports HTTPS via !~Passenger-Proto; ensure Express sees it.
app.use((req, res, next) => {
  const passengerProto = req.get('!~passenger-proto') || req.get('x-forwarded-proto');
  if (passengerProto === 'https') {
    req.headers['x-forwarded-proto'] = 'https';
  }
  next();
});

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Dynamic llms.txt (must be before static middleware so a stale public/llms.txt doesn't override it)
app.get('/llms.txt', (req, res) => {
  const host = `${req.protocol}://${req.get('host')}`;
  const coreLinks = [
    { label: 'Home', path: '', note: 'Main downloader and overview' },
    { label: 'Supported Sites', path: 'supported-sites', note: 'List of 1000+ supported platforms' },
    { label: 'Tools', path: 'tools', note: 'Specialized video, audio, and thumbnail downloaders' },
    { label: 'How to Use', path: 'how-to-use', note: 'Step-by-step download guides' },
    { label: 'Blog', path: 'blog', note: 'Platform-specific download guides and tutorials' },
    { label: 'About', path: 'about', note: 'About ClipVault and the team' },
    { label: 'Contact', path: 'contact', note: 'Contact form and details' },
    { label: 'Privacy Policy', path: 'privacy', note: 'Privacy and data handling' },
    { label: 'Terms of Service', path: 'terms', note: 'Terms of use' },
    { label: 'Content Policy', path: 'content-policy', note: 'Copyright and acceptable content policy' },
    { label: 'Disclaimer', path: 'disclaimer', note: 'Usage disclaimer' },
    { label: 'Cookie Policy', path: 'cookie-policy', note: 'Cookie usage and consent' },
    { label: 'DMCA', path: 'dmca', note: 'DMCA takedown information' },
  ];
  const description = siteConfig.siteDescription || 'Free video download guides and tools for 1000+ platforms.';
  let content = `# ${siteConfig.siteTitle}\n\n> ${description}\n\n${siteConfig.siteTitle} provides fast, privacy-friendly video download guides for 1000+ platforms. No signup or software installation is required. Use the service responsibly and only download content you created, own, or have explicit permission to save.\n\n- Tools accept a public video or playlist URL and return available formats.\n- A simple math captcha protects the tools from automated abuse.\n- Optional advanced settings include site cookies, YouTube PO tokens, and visitor data tokens.\n\n## Core Pages\n`;
  coreLinks.forEach((item) => {
    content += `- [${item.label}](${host}/${item.path}): ${item.note}\n`;
  });
  content += '\n## Blog Guides\n';
  blogPosts.forEach((post) => {
    const notes = post.summary || post.description || 'Free download guide';
    content += `- [${post.title}](${host}/blog/${post.slug}): ${notes}\n`;
  });
  content += '\n## Optional\n';
  content += `- [Sitemap](${host}/sitemap.xml): Full list of indexable pages for search engines and agents.\n`;
  content += `- [Robots](${host}/robots.txt): Crawler access instructions.\n`;
  res.type('text/plain').send(content);
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 365 * 24 * 60 * 60 * 1000 }));
app.use('/downloads', express.static(DOWNLOADS_DIR));
app.use(session({
  name: 'clipvault.sid',
  secret: process.env.ADMIN_SESSION_SECRET || 'change-me-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 },
}));

app.use((req, res, next) => {
  res.locals.siteTitle = siteConfig.siteTitle;
  res.locals.siteDescription = siteConfig.siteDescription || 'Free video download guides and tools for 1000+ platforms.';
  res.locals.authorName = process.env.PUBLISHER_NAME || `${siteConfig.siteTitle} Editorial Team`;
  res.locals.adsenseClientId = siteConfig.adsenseClientId;
  res.locals.contactEmail = siteConfig.contactEmail;
  res.locals.contactAddress = siteConfig.contactAddress;
  res.locals.gscVerification = siteConfig.gscVerification;
  res.locals.bingVerification = siteConfig.bingVerification;
  res.locals.analyticsId = siteConfig.analyticsId;
  res.locals.assetVersion = ASSET_VERSION;
  res.locals.inlineCss = INLINE_CSS;
  next();
});

app.use('/admin', adminRouter);

app.locals = {
  siteTitle: siteConfig.siteTitle,
  siteDescription: siteConfig.siteDescription || 'Free video download guides and tools for 1000+ platforms.',
  authorName: process.env.PUBLISHER_NAME || `${siteConfig.siteTitle} Editorial Team`,
  adsenseClientId: siteConfig.adsenseClientId,
  contactEmail: siteConfig.contactEmail,
  contactAddress: siteConfig.contactAddress,
  gscVerification: siteConfig.gscVerification,
  bingVerification: siteConfig.bingVerification,
  analyticsId: siteConfig.analyticsId,
  currentYear: new Date().getFullYear(),
  recaptchaSiteKey: RECAPTCHA_SITE_KEY,
  captchaMode: CAPTCHA_MODE,
  assetVersion: ASSET_VERSION,
  inlineCss: INLINE_CSS,
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

function isInstagram(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === 'instagram.com' || host.endsWith('.instagram.com');
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
  const videoUrl = data.hdplay || data.play || null;
  const audioUrl = data.music || null;
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
        url: videoUrl,
        direct: !!videoUrl,
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
        url: audioUrl,
        direct: !!audioUrl,
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

function base64Url(input) {
  return input.toString('base64url').replace(/=+$/, '');
}

function signPayload(payload) {
  return crypto
    .createHmac('sha256', DOWNLOAD_TOKEN_SECRET)
    .update(payload)
    .digest('base64url')
    .replace(/=+$/, '');
}

function createDownloadToken(url, filename) {
  const payload = JSON.stringify({ url, filename, exp: Date.now() + 5 * 60 * 1000 });
  const payloadB64 = base64Url(Buffer.from(payload, 'utf8'));
  const signature = signPayload(payloadB64);
  return `${payloadB64}.${signature}`;
}

function verifyDownloadToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;
    const expected = signPayload(payloadB64);
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) return null;
    if (!payload.url || (!payload.url.startsWith('http://') && !payload.url.startsWith('https://'))) return null;
    return payload;
  } catch {
    return null;
  }
}

function isMuxedFormat(f) {
  const videoOk = f.vcodec && f.vcodec !== 'none';
  const audioOk = f.acodec && f.acodec !== 'none';
  const audioOnly = f.vcodec === 'none' && audioOk;
  const unknownMuxed = f.vcodec == null && f.acodec == null && f.url;
  return (videoOk && audioOk) || audioOnly || unknownMuxed;
}

function isHttpFormat(f) {
  if (!f.url) return false;
  if (f.url.startsWith('https://')) return true;
  if (f.url.startsWith('http://')) return true;
  const protocol = String(f.protocol || '').toLowerCase();
  return protocol === 'https' || protocol === 'http';
}

function getDirectDownloadInfo(url, formatId, cookiePath, poToken, visitorData) {
  const formatSelector = formatId && formatId !== 'best' ? formatId : 'bestvideo*+bestaudio/best';
  const base = {
    ...getBaseOptions(url, cookiePath),
    dumpJson: true,
    format: formatSelector,
  };

  return callWithFallbacks(url, buildOptionSets(base, url, poToken, visitorData))
    .then((info) => {
      const format = info.formats?.find((f) => f.format_id === info.format_id) || info;
      if (!format || !format.url) return null;
      if (isMuxedFormat(format) && isHttpFormat(format)) {
        return { url: format.url, ext: format.ext || info.ext || 'mp4', formatId: format.format_id || info.format_id, title: info.title };
      }
      return null;
    })
    .catch((err) => {
      console.error('Direct download info check failed:', cleanError(err));
      return null;
    });
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
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    addHeader: [`referer:${getReferer(url)}`],
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

function getInstagramExtractorArgs() {
  return ['instagram:app_id=ios', 'instagram:app_id=web'];
}

function buildOptionSets(base, url, poToken, visitorData) {
  const sets = [base];
  if (isYouTube(url)) {
    getYouTubeExtractorArgs(poToken, visitorData).forEach((arg) => {
      sets.push({ ...base, extractorArgs: arg });
    });
  } else if (isInstagram(url)) {
    getInstagramExtractorArgs().forEach((arg) => {
      sets.push({ ...base, extractorArgs: arg });
    });
  }

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
    title: options.meta?.title || siteConfig.siteTitle,
    description: options.meta?.description || 'Download videos from YouTube, TikTok, Instagram, Twitter, Facebook, and 1000+ sites quickly and securely.',
    keywords: options.meta?.keywords || '',
    image: `${host}/images/og-default.png`,
    url: `${host}${req.originalUrl}`,
    robots: options.meta?.robots || '',
  };
}

function renderPage(req, res, view, options = {}) {
  res.render(view, { ...options, meta: getMeta(req, options), path: req.path });
}

app.get('/', (req, res) => {
  renderPage(req, res, 'index', {
    meta: {
      title: `${siteConfig.siteTitle} — Free All-in-One Video Downloader for 1000+ Sites`,
      description: 'Download videos and audio from YouTube, TikTok, Instagram, Facebook, Twitter/X, Vimeo, Dailymotion, Reddit, Twitch, SoundCloud, and 1000+ sites for free.',
      keywords: 'free video downloader, online video downloader, YouTube downloader, TikTok downloader, Instagram downloader, download videos online, MP4 downloader',
    },
  });
});

app.get('/tools', (req, res) => {
  renderPage(req, res, 'tools', {
    tools: toolsData,
    meta: {
      title: `Free Video Downloader Tools — ${siteConfig.siteTitle}`,
      description: 'Explore free tools to download videos from YouTube, TikTok, Instagram, Facebook, Twitter/X, Vimeo, and 1000+ sites. Convert to MP3, grab thumbnails, subtitles, and more.',
      keywords: 'video downloader tools, YouTube downloader, TikTok downloader, Instagram downloader, Facebook downloader, Twitter video downloader, MP3 converter, thumbnail downloader, subtitle downloader',
      robots: 'noindex, follow',
    },
  });
});

app.get('/thumbnail', (req, res) => {
  renderPage(req, res, 'thumbnail', {
    meta: {
      title: `Free YouTube Thumbnail Downloader — ${siteConfig.siteTitle}`,
      description: 'Download YouTube video thumbnails in HD, SD, and full resolution instantly. Paste a video URL and save the thumbnail image.',
      keywords: 'YouTube thumbnail downloader, download YouTube thumbnail, YouTube thumbnail HD, video thumbnail downloader',
    },
  });
});

app.get('/subtitle', (req, res) => {
  renderPage(req, res, 'subtitle', {
    meta: {
      title: `Free Video Subtitle Downloader — ${siteConfig.siteTitle}`,
      description: 'Download subtitles and captions from YouTube and other supported videos. Paste a URL and save subtitles in any language.',
      keywords: 'subtitle downloader, download subtitles, youtube subtitle downloader, caption downloader, video subtitles',
    },
  });
});

app.get('/playlist', (req, res) => {
  renderPage(req, res, 'playlist', {
    meta: {
      title: `Free Playlist Downloader — ${siteConfig.siteTitle}`,
      description: 'Download entire YouTube playlists and channels. Paste a playlist URL, view all videos, and download them one by one.',
      keywords: 'playlist downloader, youtube playlist downloader, download playlist, channel downloader',
    },
  });
});

app.get('/mp3', (req, res) => {
  renderPage(req, res, 'mp3', {
    meta: {
      title: `Video to MP3 Converter — ${siteConfig.siteTitle}`,
      description: 'Convert videos from YouTube, TikTok, Instagram, and 1000+ sites to MP3 audio. Free online video to MP3 converter.',
      keywords: 'video to mp3, youtube to mp3, convert video to mp3, audio downloader, mp3 converter online',
    },
  });
});

const RESERVED_TOOL_SLUGS = new Set([
  '', 'supported-sites', 'tools', 'thumbnail', 'subtitle', 'mp3', 'playlist',
  'how-to-use', 'about', 'contact', 'privacy', 'terms', 'dmca', 'disclaimer', 'cookie-policy', 'blog', 'sitemap.xml',
]);

toolsData.forEach((t) => {
  const slug = t.slug || (t.link && t.link.startsWith('/') ? t.link.slice(1) : '');
  if (!slug || RESERVED_TOOL_SLUGS.has(slug)) return;
  const baseKeyword = t.title.replace(/\s+Downloader$/i, '').toLowerCase();
  app.get(`/${slug}`, (req, res) => {
    renderPage(req, res, 'tool', {
      toolTitle: t.title,
      toolDesc: t.desc,
      toolPlaceholder: t.placeholder || 'Paste video URL here...',
      toolSlug: slug,
      meta: {
        title: `${t.title} — Free Online — ${siteConfig.siteTitle}`,
        description: `Free ${t.title} online. ${t.desc} Paste the URL, solve the captcha, and save videos or audio in MP4/MP3. No signup needed.`,
        keywords: `${t.keywords || ''}, ${baseKeyword} downloader, free ${baseKeyword} downloader, online ${baseKeyword} downloader, download ${baseKeyword} mp4, download ${baseKeyword} mp3`,
        robots: 'noindex, follow',
      },
    });
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
      title: `How to Use — ${siteConfig.siteTitle}`,
      description: 'Learn how to download videos from your favorite platforms in seconds.',
    },
  });
});

app.get('/about', (req, res) => {
  renderPage(req, res, 'about', {
    meta: {
      title: `About — ${siteConfig.siteTitle}`,
      description: `Learn more about ${siteConfig.siteTitle}, a privacy-friendly online video downloader.`,
    },
  });
});

app.get('/contact', (req, res) => {
  renderPage(req, res, 'contact', {
    meta: {
      title: `Contact — ${siteConfig.siteTitle}`,
      description: 'Get in touch with the ClipVault team.',
    },
  });
});

app.get('/privacy', (req, res) => {
  renderPage(req, res, 'privacy', {
    meta: {
      title: `Privacy Policy — ${siteConfig.siteTitle}`,
      description: 'Read how we handle your data and protect your privacy.',
    },
  });
});

app.get('/terms', (req, res) => {
  renderPage(req, res, 'terms', {
    meta: {
      title: `Terms of Service — ${siteConfig.siteTitle}`,
      description: 'Read the terms and conditions for using our video downloader.',
    },
  });
});

app.get('/dmca', (req, res) => {
  renderPage(req, res, 'dmca', {
    meta: {
      title: `DMCA — ${siteConfig.siteTitle}`,
      description: 'Report copyright violations and submit takedown requests.',
    },
  });
});

app.get('/disclaimer', (req, res) => {
  renderPage(req, res, 'disclaimer', {
    meta: {
      title: `Disclaimer — ${siteConfig.siteTitle}`,
      description: 'Important usage and copyright disclaimers.',
    },
  });
});

app.get('/cookie-policy', (req, res) => {
  renderPage(req, res, 'cookie-policy', {
    meta: {
      title: `Cookie Policy — ${siteConfig.siteTitle}`,
      description: 'Read how we use cookies and similar technologies.',
    },
  });
});

app.get('/content-policy', (req, res) => {
  renderPage(req, res, 'content-policy', {
    meta: {
      title: `Content Policy — ${siteConfig.siteTitle}`,
      description: 'Our acceptable use, copyright, and content removal policy.',
    },
  });
});

app.locals.blogPosts = blogPosts;

app.get('/blog', (req, res) => {
  renderPage(req, res, 'blog/index', {
    meta: {
      title: `Video Downloading Guides — ${siteConfig.siteTitle}`,
      description: 'Step-by-step guides for downloading YouTube, TikTok, Instagram, Facebook, Twitter/X, Vimeo, Dailymotion, and 1000+ supported sites.',
      keywords: 'video downloader guides, how to download YouTube videos, TikTok downloader guide, Instagram downloader tutorial, free video downloader tutorials',
    },
  });
});

function hashDate(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 1000000;
  const start = new Date('2023-06-01').getTime();
  const days = (h % 730);
  return new Date(start + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}

app.get('/blog/:slug', (req, res, next) => {
  let post = blogPosts.find((p) => p.slug === req.params.slug);
  let isAutoGenerated = false;
  if (!post) {
    const tool = toolsData.find((t) => t.slug === req.params.slug);
    if (!tool || !tool.slug) return next();
    const site = tool.title.replace(/\s+Downloader$/i, '');
    isAutoGenerated = true;
    post = {
      slug: tool.slug,
      site,
      title: `${site} Downloader — Free Online Guide`,
      summary: `Free ${tool.title} online. ${tool.desc} Use ${siteConfig.siteTitle} to paste the URL, solve the captcha, and download videos or audio in MP4/MP3.`,
      description: `Free ${tool.title} online. ${tool.desc} Download videos or audio with ${siteConfig.siteTitle}.`,
      formats: 'MP4, MP3, HD, and 4K when available',
      keywords: `${tool.keywords || ''}, ${site.toLowerCase()} downloader, download ${site.toLowerCase()} videos, ${site.toLowerCase()} to mp4, ${site.toLowerCase()} to mp3`,
    };
  }
  post.author = post.author || res.locals.authorName;
  post.date = post.date || hashDate(post.slug);
  post.dateModified = post.dateModified || new Date().toISOString().split('T')[0];
  const viewPath = path.join(__dirname, 'views', 'blog', `${post.slug}.ejs`);
  const baseKeyword = (post.site || post.title).toLowerCase();
  const meta = {
    title: `${post.title} — ${siteConfig.siteTitle}`,
    description: post.description || `Read our guide on ${post.title.toLowerCase()} at ${siteConfig.siteTitle}.`,
    keywords: `${post.keywords || ''}, ${baseKeyword} downloader, download ${baseKeyword} videos, ${baseKeyword} to mp4, ${baseKeyword} to mp3, free ${baseKeyword} downloader, ${baseKeyword} downloader guide`,
    robots: isAutoGenerated ? 'noindex, follow' : undefined,
  };
  if (fs.existsSync(viewPath)) {
    return renderPage(req, res, `blog/${post.slug}`, { meta, post });
  }
  renderPage(req, res, 'blog/post', { meta, post });
});

app.get('/editorial-standards', (req, res) => {
  renderPage(req, res, 'editorial-standards', {
    meta: {
      title: `Editorial Standards & Content Policy — ${siteConfig.siteTitle}`,
      description: 'How ClipVault creates, reviews, and maintains accurate, independent, and responsible video download guides.',
    },
  });
});

const CONTACT_MESSAGES_FILE = path.join(__dirname, 'data', 'contact-messages.json');
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
  }
  const entry = { name, email, subject: subject || 'General question', message, createdAt: new Date().toISOString() };
  try {
    let messages = [];
    if (fs.existsSync(CONTACT_MESSAGES_FILE)) {
      messages = JSON.parse(fs.readFileSync(CONTACT_MESSAGES_FILE, 'utf8'));
    }
    messages.push(entry);
    fs.writeFileSync(CONTACT_MESSAGES_FILE, JSON.stringify(messages, null, 2));
  } catch (err) {
    console.error('Contact save error:', err.message);
  }
  res.json({ success: true, message: 'Thanks for your message. We will respond within 2-3 business days.' });
});

app.get('/ads.txt', (req, res) => {
  if (!siteConfig.adsenseClientId || siteConfig.adsenseClientId === 'ca-pub-0000000000000000') {
    return res.type('text/plain').send('# Set ADSENSE_CLIENT_ID in your .env file to enable ads.txt');
  }
  const pubId = siteConfig.adsenseClientId.replace('ca-pub-', '');
  res.type('text/plain').send(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0`);
});

app.get('/robots.txt', (req, res) => {
  const host = `${req.protocol}://${req.get('host')}`;
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /downloads/\nSitemap: ${host}/sitemap.xml`);
});

app.get('/sitemap.xml', (req, res) => {
  const host = `${req.protocol}://${req.get('host')}`;
  const pages = ['', 'supported-sites', 'thumbnail', 'subtitle', 'mp3', 'playlist', 'how-to-use', 'about', 'contact', 'privacy', 'terms', 'dmca', 'disclaimer', 'cookie-policy', 'content-policy', 'editorial-standards', 'blog'];
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
      url: f.url || null,
      direct: isMuxedFormat(f) && isHttpFormat(f),
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

app.post('/api/thumbnail', async (req, res) => {
  const { url, captchaToken, captchaAnswer } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const captcha = await verifyCaptcha(captchaToken, captchaAnswer);
  if (!captcha.success) {
    return res.status(403).json({ error: `Captcha verification failed: ${captcha.error}` });
  }

  try {
    const base = {
      ...getBaseOptions(url, null),
      dumpJson: true,
      skipDownload: true,
    };

    const info = await callWithFallbacks(url, buildOptionSets(base, url, '', ''));
    const thumbnails = (info.thumbnails || [])
      .filter((t) => t.url)
      .sort((a, b) => (b.width || 0) - (a.width || 0));

    res.json({
      success: true,
      title: info.title || 'Unknown',
      thumbnail: info.thumbnail || (thumbnails[0] && thumbnails[0].url),
      thumbnails,
    });
  } catch (err) {
    console.error('Thumbnail fetch failed:', err);
    res.status(500).json({ error: cleanError(err) || 'Failed to fetch thumbnail' });
  }
});

app.post('/api/subtitles', async (req, res) => {
  const { url, captchaToken, captchaAnswer } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const captcha = await verifyCaptcha(captchaToken, captchaAnswer);
  if (!captcha.success) {
    return res.status(403).json({ error: `Captcha verification failed: ${captcha.error}` });
  }

  try {
    const base = {
      ...getBaseOptions(url, null),
      dumpJson: true,
      skipDownload: true,
    };

    const info = await callWithFallbacks(url, buildOptionSets(base, url, '', ''));
    const safeTitle = sanitizeFilename(info.title || 'subtitle');

    const subs = info.subtitles || {};
    const auto = info.automatic_captions || {};

    const map = (obj, autoFlag) => Object.entries(obj).map(([lang, list]) => {
      const entries = (list || []).map((s) => ({
        ext: s.ext || 'txt',
        name: s.name || lang,
        url: s.url,
        downloadToken: createDownloadToken(s.url, `${safeTitle}_${lang}_${autoFlag ? 'auto' : 'sub'}.${s.ext || 'txt'}`),
      }));
      return { lang, auto: autoFlag, entries };
    });

    res.json({
      success: true,
      title: info.title || 'Unknown',
      thumbnail: info.thumbnail || '',
      subtitles: [...map(subs, false), ...map(auto, true)],
    });
  } catch (err) {
    console.error('Subtitle fetch failed:', err);
    res.status(500).json({ error: cleanError(err) || 'Failed to fetch subtitles' });
  }
});

app.post('/api/playlist', async (req, res) => {
  const { url, captchaToken, captchaAnswer } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const captcha = await verifyCaptcha(captchaToken, captchaAnswer);
  if (!captcha.success) {
    return res.status(403).json({ error: `Captcha verification failed: ${captcha.error}` });
  }

  try {
    const base = {
      ...getBaseOptions(url, null),
      dumpSingleJson: true,
      flatPlaylist: true,
      skipDownload: true,
    };

    const info = await callWithFallbacks(url, buildOptionSets(base, url, '', ''));
    const entries = (info.entries || []).map((e) => ({
      id: e.id,
      title: e.title,
      duration: e.duration,
      thumbnail: e.thumbnail,
      url: e.webpage_url || e.url || e.original_url || url,
    }));

    res.json({
      success: true,
      title: info.title || 'Playlist',
      uploader: info.uploader,
      entries,
    });
  } catch (err) {
    console.error('Playlist fetch failed:', err);
    res.status(500).json({ error: cleanError(err) || 'Failed to fetch playlist' });
  }
});

app.get('/api/subtitle-file', async (req, res) => {
  const token = req.query.token;
  const payload = verifyDownloadToken(token);
  if (!payload) {
    return res.status(403).send('Invalid or expired download token');
  }

  try {
    const response = await fetch(payload.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!response.ok) {
      return res.status(502).send(`Failed to fetch subtitle: ${response.status}`);
    }

    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(payload.filename)}`);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'text/plain');
    await pipeline(Readable.fromWeb(response.body), res);
  } catch (err) {
    console.error('Subtitle file error:', err);
    if (!res.headersSent) res.status(500).send('Subtitle download failed');
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
    if (isTikTok(url)) {
      const tw = await fetchTikWM(url);
      const isAudio = formatId === 'tiktok-audio' || formatId === 'audio' || formatId === 'best-audio';
      const directUrl = isAudio ? tw.music : (tw.hdplay || tw.play);
      if (directUrl) {
        const ext = isAudio ? 'mp3' : 'mp4';
        const filename = `${safeTitle}_${id}.${ext}`;
        cleanupCookiePath(cookiePath);
        return res.json({
          success: true,
          filename,
          directUrl,
          downloadToken: createDownloadToken(directUrl, filename),
        });
      }
    }

    const directInfo = await getDirectDownloadInfo(url, formatId, cookiePath, poToken, visitorData);
    if (directInfo) {
      const filename = `${safeTitle}_${id}.${directInfo.ext}`;
      cleanupCookiePath(cookiePath);
      return res.json({
        success: true,
        filename,
        directUrl: directInfo.url,
        downloadToken: createDownloadToken(directInfo.url, filename),
      });
    }

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
        const isAudio = formatId === 'tiktok-audio' || formatId === 'audio' || formatId === 'best-audio';
        const ext = isAudio ? 'mp3' : 'mp4';
        const safeTikTitle = String(tw.title || `tiktok-${tw.id}`).replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').substring(0, 60) || 'tiktok';
        const file = `${id}_${safeTikTitle}.${ext}`;
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

app.get('/api/download-proxy', async (req, res) => {
  const token = req.query.token;
  const payload = verifyDownloadToken(token);
  if (!payload) {
    return res.status(403).send('Invalid or expired download token');
  }

  try {
    const response = await fetch(payload.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      return res.status(502).send(`Failed to fetch media: ${response.status}`);
    }

    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(payload.filename)}`);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    const length = response.headers.get('content-length');
    if (length) res.setHeader('Content-Length', length);

    await pipeline(Readable.fromWeb(response.body), res);
  } catch (err) {
    console.error('Download proxy error:', err);
    if (!res.headersSent) {
      res.status(500).send('Download proxy failed');
    }
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  renderPage(req, res, '404', {
    meta: {
      title: `404 — ${siteConfig.siteTitle}`,
      description: 'The page you are looking for was not found.',
      robots: 'noindex, follow',
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

  await adminDb.initDb();
  await ensureAdminUser();
  await applySettings();
  app.listen(PORT, () => {
    console.log(`${siteConfig.siteTitle} server running at http://localhost:${PORT}`);
  });
}

startApp().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

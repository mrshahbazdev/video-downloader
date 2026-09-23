#!/usr/bin/env node
process.env.CLIPVAULT_QUIET_STDOUT = '1';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const z = require('zod/v4');

const adminDb = require('../lib/adminDb');
const { siteConfig, applySettings } = require('../lib/siteConfig');
const contentManager = require('../lib/contentManager');
const seoManager = require('../lib/seoManager');
const { createYtdl, findPython } = require('../lib/ytdlp');

const BASE_DIR = path.join(__dirname, '..');
const DOWNLOADS_DIR = path.join(BASE_DIR, 'downloads');
const SYSTEM_YTDLP = '/home/ubuntu/.local/bin/yt-dlp';
const DEFAULT_YTDLP = path.join(BASE_DIR, 'bin', 'yt-dlp');

const SETTING_MAP = {
  siteTitle: 'site_title',
  siteDescription: 'site_description',
  siteKeywords: 'site_keywords',
  adsenseClientId: 'adsense_client_id',
  analyticsId: 'analytics_id',
  contactEmail: 'contact_email',
  contactAddress: 'contact_address',
  gscVerification: 'gsc_verification',
  bingVerification: 'bing_verification',
};

let dbReady = false;

function jsonResult(data) {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}

function errorResult(message, extra = {}) {
  return jsonResult({ success: false, error: message, ...extra });
}

async function ensureDb() {
  if (dbReady) return;
  await adminDb.initDb();
  await applySettings();
  dbReady = true;
}

async function getEffectiveSettings() {
  await ensureDb();
  const stored = await adminDb.getSettings();
  return {
    siteTitle: stored.site_title || siteConfig.siteTitle,
    siteDescription: stored.site_description || siteConfig.siteDescription,
    siteKeywords: stored.site_keywords || siteConfig.siteKeywords,
    adsenseClientId: stored.adsense_client_id || siteConfig.adsenseClientId,
    analyticsId: stored.analytics_id || siteConfig.analyticsId,
    contactEmail: stored.contact_email || siteConfig.contactEmail,
    contactAddress: stored.contact_address || siteConfig.contactAddress,
    gscVerification: stored.gsc_verification || siteConfig.gscVerification,
    bingVerification: stored.bing_verification || siteConfig.bingVerification,
    storage: adminDb.isJson() ? 'json' : 'mysql',
  };
}

function safeEnvironment() {
  return {
    node: process.version,
    python: findPython(),
    ytdlpBinary: getYtdlpBinary(),
    dbConfigured: Boolean(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME),
    captchaMode: process.env.CAPTCHA_MODE || 'math',
    proxyConfigured: Boolean(process.env.PROXY_URL),
    cookiesPathConfigured: Boolean(process.env.YOUTUBE_COOKIES_PATH),
    siteUrl: process.env.CLIPVAULT_SITE_URL || 'https://clipvaultz.online',
  };
}

function getYtdlpBinary() {
  const requested = process.env.YOUTUBE_DL_BINARY;
  if (requested && fs.existsSync(requested)) return requested;
  if (fs.existsSync(SYSTEM_YTDLP)) return SYSTEM_YTDLP;
  if (fs.existsSync(DEFAULT_YTDLP)) return DEFAULT_YTDLP;
  return null;
}

function getYtdlp() {
  const binary = getYtdlpBinary();
  if (!binary) {
    throw new Error('yt-dlp binary is not configured. Run npm start once or set YOUTUBE_DL_BINARY.');
  }
  return createYtdl(binary);
}

function ensurePolicyAcknowledged(acknowledgePolicy) {
  if (!acknowledgePolicy) {
    throw new Error('Set acknowledgePolicy=true to confirm you own the content or have permission to process it.');
  }
}

function trimmedFormats(formats, limit) {
  return (formats || []).slice(0, limit).map((format) => ({
    format_id: format.format_id,
    ext: format.ext,
    resolution: format.resolution,
    quality: format.quality,
    filesize: format.filesize,
    filesize_approx: format.filesize_approx,
    vcodec: format.vcodec,
    acodec: format.acodec,
    fps: format.fps,
  }));
}

async function getVideoInfo(args) {
  ensurePolicyAcknowledged(args.acknowledgePolicy);
  const ytdlp = getYtdlp();
  const flags = {
    dumpJson: true,
    skipDownload: true,
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
  };
  if (args.formatId) flags.format = args.formatId;
  if (args.cookiesPath) flags.cookies = args.cookiesPath;
  if (process.env.PROXY_URL) flags.proxy = process.env.PROXY_URL;
  const info = await ytdlp(args.url, flags, { cwd: BASE_DIR, timeout: Math.min(args.timeoutSeconds || 120, 300) * 1000 });
  return {
    id: info.id,
    title: info.title,
    description: info.description,
    duration: info.duration,
    webpage_url: info.webpage_url,
    uploader: info.uploader,
    thumbnail: info.thumbnail,
    extractor: info.extractor,
    format_id: info.format_id,
    ext: info.ext,
    formats: trimmedFormats(info.formats, args.formatLimit || 25),
  };
}

async function downloadVideo(args) {
  ensurePolicyAcknowledged(args.acknowledgePolicy);
  const ytdlp = getYtdlp();
  const outputDir = args.outputDirectory ? path.resolve(BASE_DIR, args.outputDirectory) : DOWNLOADS_DIR;
  const relativeOutput = path.relative(BASE_DIR, outputDir);
  if (relativeOutput.startsWith('..') || path.isAbsolute(relativeOutput)) {
    throw new Error('outputDirectory must stay inside the ClipVault project.');
  }
  fs.mkdirSync(outputDir, { recursive: true });
  const prefix = contentManager.normalizeSlug(args.filenamePrefix || 'clipvault-download') || 'clipvault-download';
  const outputTemplate = path.join(outputDir, `${prefix}-%(id)s.%(ext)s`);
  const before = new Set(fs.readdirSync(outputDir));
  const flags = {
    output: outputTemplate,
    format: args.formatId || 'best',
    noPlaylist: true,
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
  };
  if (args.cookiesPath) flags.cookies = args.cookiesPath;
  if (process.env.PROXY_URL) flags.proxy = process.env.PROXY_URL;
  await ytdlp(args.url, flags, { cwd: BASE_DIR, timeout: Math.min(args.timeoutSeconds || 300, 900) * 1000 });
  const files = fs.readdirSync(outputDir)
    .filter((file) => file.startsWith(`${prefix}-`) && !before.has(file))
    .map((file) => ({
      file,
      path: path.join(outputDir, file),
      size: fs.statSync(path.join(outputDir, file)).size,
    }))
    .sort((a, b) => b.size - a.size);
  return { success: true, outputDirectory: outputDir, files };
}

function nodeCheck(commandArgs) {
  const result = spawnSync(process.execPath, commandArgs, { cwd: BASE_DIR, encoding: 'utf8', timeout: 30000 });
  return {
    command: [process.execPath, ...commandArgs].join(' '),
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    ok: result.status === 0,
  };
}

function jsonDataCheck(name, reader) {
  try {
    return { name, ok: Array.isArray(reader()) };
  } catch (err) {
    return { name, ok: false, detail: err.message };
  }
}

function registerOverviewTools(server) {
  server.registerTool('clipvault_overview', {
    title: 'ClipVault Overview',
    description: 'Get a complete read-only overview of ClipVault settings, content totals, SEO assets, and runtime environment.',
    inputSchema: {},
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async () => {
    const settings = await getEffectiveSettings();
    const tools = contentManager.readTools();
    const blogPosts = contentManager.readBlogPosts();
    return jsonResult({
      success: true,
      name: settings.siteTitle,
      repository: 'mrshahbazdev/video-downloader',
      siteUrl: process.env.CLIPVAULT_SITE_URL || 'https://clipvaultz.online',
      totals: {
        tools: tools.length,
        blogPosts: blogPosts.length,
        corePages: seoManager.CORE_PAGES.length,
      },
      settings,
      environment: safeEnvironment(),
      mcpCapabilities: [
        'settings',
        'seo-audit',
        'seo-assets',
        'tool-pages',
        'blog-guides',
        'contact-inbox',
        'health-checks',
        'video-info',
        'single-video-download',
      ],
    });
  });

  server.registerTool('clipvault_health_check', {
    title: 'ClipVault Health Check',
    description: 'Check project files, Node/Python/yt-dlp availability, content JSON validity, and optional server URLs.',
    inputSchema: {
      serverUrl: z.string().url().optional().describe('Optional running ClipVault base URL to check, for example http://localhost:3000'),
      includeNodeChecks: z.boolean().default(true).describe('Run lightweight Node syntax/import checks.'),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  }, async ({ serverUrl, includeNodeChecks }) => {
    const checks = [
      { name: 'package.json', ok: fs.existsSync(path.join(BASE_DIR, 'package.json')) },
      { name: 'server.js', ok: fs.existsSync(path.join(BASE_DIR, 'server.js')) },
      jsonDataCheck('tools.json', contentManager.readTools),
      jsonDataCheck('blogPosts.json', contentManager.readBlogPosts),
      { name: 'python', ok: Boolean(findPython()), detail: findPython() },
      { name: 'yt-dlp', ok: Boolean(getYtdlpBinary()), detail: getYtdlpBinary() },
    ];
    const nodeChecks = includeNodeChecks ? [
      nodeCheck(['--check', 'mcp/server.js']),
      nodeCheck(['--check', 'lib/contentManager.js']),
      nodeCheck(['--check', 'lib/seoManager.js']),
    ] : [];

    let serverCheck = null;
    if (serverUrl) {
      try {
        const response = await fetch(`${serverUrl.replace(/\/+$/, '')}/health`);
        serverCheck = { ok: response.ok, status: response.status, body: await response.text() };
      } catch (err) {
        serverCheck = { ok: false, error: err.message };
      }
    }

    return jsonResult({
      success: checks.every((check) => check.ok) && nodeChecks.every((check) => check.ok) && (!serverCheck || serverCheck.ok),
      checks,
      nodeChecks,
      serverCheck,
      environment: safeEnvironment(),
    });
  });
}

function registerSettingsTools(server) {
  server.registerTool('clipvault_get_settings', {
    title: 'Get ClipVault Settings',
    description: 'Read effective site settings used for SEO, AdSense, analytics, contact details, and webmaster verification.',
    inputSchema: {},
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async () => jsonResult({ success: true, settings: await getEffectiveSettings() }));

  server.registerTool('clipvault_update_settings', {
    title: 'Update ClipVault Settings',
    description: 'Update admin/site settings for SEO, AdSense, analytics, contact details, and search-console verification.',
    inputSchema: {
      siteTitle: z.string().min(1).optional(),
      siteDescription: z.string().optional(),
      siteKeywords: z.string().optional(),
      adsenseClientId: z.string().optional(),
      analyticsId: z.string().optional(),
      contactEmail: z.string().email().optional(),
      contactAddress: z.string().optional(),
      gscVerification: z.string().optional(),
      bingVerification: z.string().optional(),
      dryRun: z.boolean().default(false).describe('Preview changes without writing them.'),
    },
    annotations: { readOnlyHint: false, openWorldHint: false },
  }, async (args) => {
    const before = await getEffectiveSettings();
    const changes = {};
    Object.entries(SETTING_MAP).forEach(([externalKey, dbKey]) => {
      if (args[externalKey] !== undefined) changes[dbKey] = args[externalKey];
    });
    if (!Object.keys(changes).length) return errorResult('No settings were provided.');
    if (!args.dryRun) {
      await ensureDb();
      for (const [key, value] of Object.entries(changes)) {
        await adminDb.setSetting(key, value);
      }
      await applySettings();
    }
    const previewAfter = { ...before };
    Object.entries(SETTING_MAP).forEach(([externalKey]) => {
      if (args[externalKey] !== undefined) previewAfter[externalKey] = args[externalKey];
    });
    return jsonResult({
      success: true,
      dryRun: args.dryRun,
      changedKeys: Object.keys(changes),
      before,
      after: args.dryRun ? previewAfter : await getEffectiveSettings(),
      restartRequired: false,
    });
  });
}

function registerSeoTools(server) {
  server.registerTool('clipvault_seo_audit', {
    title: 'ClipVault SEO Audit',
    description: 'Run a repository-backed SEO audit over global settings, sitemap coverage, tool pages, and blog guide metadata.',
    inputSchema: {
      host: z.string().url().optional().describe('Public site URL to use in generated URLs. Defaults to CLIPVAULT_SITE_URL or clipvaultz.online.'),
      includeSamples: z.boolean().default(false).describe('Include sample meta previews for key pages.'),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async ({ host, includeSamples }) => {
    const settings = await getEffectiveSettings();
    const audit = seoManager.auditSeo({
      host,
      config: {
        siteTitle: settings.siteTitle,
        siteDescription: settings.siteDescription,
        siteKeywords: settings.siteKeywords,
        adsenseClientId: settings.adsenseClientId,
        contactEmail: settings.contactEmail,
      },
    });
    if (includeSamples) {
      audit.samples = [
        seoManager.metaPreview('/', host, settings),
        seoManager.metaPreview('/tools', host, settings),
        seoManager.metaPreview('/blog', host, settings),
      ];
    }
    return jsonResult({ success: true, audit });
  });

  server.registerTool('clipvault_generate_seo_assets', {
    title: 'Generate SEO Assets',
    description: 'Generate robots.txt, sitemap.xml, ads.txt, and llms.txt content from current ClipVault settings/content.',
    inputSchema: {
      host: z.string().url().optional().describe('Public site URL, for example https://clipvaultz.online.'),
      includeSitemap: z.boolean().default(true),
      includeRobots: z.boolean().default(true),
      includeAds: z.boolean().default(true),
      includeLlms: z.boolean().default(true),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async (args) => {
    const settings = await getEffectiveSettings();
    const assets = {};
    const config = {
      siteTitle: settings.siteTitle,
      siteDescription: settings.siteDescription,
      siteKeywords: settings.siteKeywords,
      adsenseClientId: settings.adsenseClientId,
      contactEmail: settings.contactEmail,
    };
    if (args.includeRobots) assets.robotsTxt = seoManager.getRobotsTxt(args.host);
    if (args.includeSitemap) assets.sitemapXml = seoManager.getSitemapXml(args.host);
    if (args.includeAds) assets.adsTxt = seoManager.getAdsTxt(config);
    if (args.includeLlms) assets.llmsTxt = seoManager.getLlmsTxt(args.host, config);
    return jsonResult({ success: true, host: seoManager.normalizeHost(args.host), assets });
  });

  server.registerTool('clipvault_meta_preview', {
    title: 'Preview Page Meta',
    description: 'Preview SEO title, description, keywords, and canonical URL for a ClipVault page, tool page, or blog guide.',
    inputSchema: {
      path: z.string().default('/').describe('Route path such as /, /tools, /youtube, or /blog/youtube-video-downloader.'),
      host: z.string().url().optional(),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async (args) => {
    const settings = await getEffectiveSettings();
    return jsonResult({ success: true, meta: seoManager.metaPreview(args.path, args.host, settings) });
  });
}

function registerContentTools(server) {
  server.registerTool('clipvault_search_tools', {
    title: 'Search Downloader Tools',
    description: 'Search and paginate ClipVault downloader tool pages by title, description, keywords, slug, or link.',
    inputSchema: {
      query: z.string().optional(),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(200).default(25),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async (args) => jsonResult({ success: true, result: contentManager.listTools(args) }));

  server.registerTool('clipvault_get_tool', {
    title: 'Get Downloader Tool',
    description: 'Read one downloader tool definition by slug, title slug, or link path.',
    inputSchema: {
      slug: z.string().min(1),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async ({ slug }) => {
    const tool = contentManager.getTool(slug);
    return tool ? jsonResult({ success: true, tool }) : errorResult(`Tool not found: ${slug}`);
  });

  server.registerTool('clipvault_upsert_tool', {
    title: 'Create or Update Downloader Tool',
    description: 'Create or update a downloader tool page definition in data/tools.json.',
    inputSchema: {
      slug: z.string().optional().describe('SEO URL slug. Required for standalone tool pages.'),
      link: z.string().optional().describe('Existing route link such as /mp3 when the tool should point to a shared page.'),
      icon: z.string().optional(),
      title: z.string().min(1),
      desc: z.string().min(20),
      placeholder: z.string().optional(),
      keywords: z.string().optional(),
      dryRun: z.boolean().default(false),
    },
    annotations: { readOnlyHint: false, openWorldHint: false },
  }, async (args) => {
    const preview = {
      slug: args.slug ? contentManager.normalizeSlug(args.slug) : undefined,
      link: args.link,
      icon: args.icon || '🛠️',
      title: args.title,
      desc: args.desc,
      placeholder: args.placeholder,
      keywords: args.keywords,
    };
    if (args.dryRun) return jsonResult({ success: true, dryRun: true, preview });
    return jsonResult({ success: true, ...contentManager.upsertTool(preview) });
  });

  server.registerTool('clipvault_delete_tool', {
    title: 'Delete Downloader Tool',
    description: 'Delete a downloader tool definition from data/tools.json. Requires confirm=true.',
    inputSchema: {
      slug: z.string().min(1),
      confirm: z.boolean().describe('Must be true to delete.'),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  }, async ({ slug, confirm }) => {
    if (!confirm) return errorResult('Deletion requires confirm=true.');
    return jsonResult({ success: true, ...contentManager.deleteTool(slug) });
  });

  server.registerTool('clipvault_list_blog_posts', {
    title: 'List Blog Guides',
    description: 'Search and paginate ClipVault blog guide metadata.',
    inputSchema: {
      query: z.string().optional(),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(200).default(25),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async (args) => jsonResult({ success: true, result: contentManager.listBlogPosts(args) }));

  server.registerTool('clipvault_get_blog_post', {
    title: 'Get Blog Guide',
    description: 'Read one blog guide metadata record by slug.',
    inputSchema: {
      slug: z.string().min(1),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async ({ slug }) => {
    const post = contentManager.getBlogPost(slug);
    return post ? jsonResult({ success: true, post }) : errorResult(`Blog post not found: ${slug}`);
  });

  server.registerTool('clipvault_upsert_blog_post', {
    title: 'Create or Update Blog Guide',
    description: 'Create or update a ClipVault blog guide metadata record. Generic post rendering is automatic.',
    inputSchema: {
      slug: z.string().optional(),
      title: z.string().min(10),
      site: z.string().min(1),
      formats: z.string().min(1),
      summary: z.string().min(30),
      description: z.string().min(50),
      keywords: z.string().optional(),
      author: z.string().optional(),
      date: z.string().optional(),
      dateModified: z.string().optional(),
      dryRun: z.boolean().default(false),
    },
    annotations: { readOnlyHint: false, openWorldHint: false },
  }, async (args) => {
    const preview = { ...args, slug: contentManager.normalizeSlug(args.slug || args.title) };
    delete preview.dryRun;
    if (args.dryRun) return jsonResult({ success: true, dryRun: true, preview });
    return jsonResult({ success: true, ...contentManager.upsertBlogPost(preview) });
  });

  server.registerTool('clipvault_delete_blog_post', {
    title: 'Delete Blog Guide',
    description: 'Delete a blog guide metadata record, optionally deleting a matching custom EJS view. Requires confirm=true.',
    inputSchema: {
      slug: z.string().min(1),
      removeView: z.boolean().default(false),
      confirm: z.boolean().describe('Must be true to delete.'),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  }, async ({ slug, removeView, confirm }) => {
    if (!confirm) return errorResult('Deletion requires confirm=true.');
    return jsonResult({ success: true, ...contentManager.deleteBlogPost(slug, { removeView }) });
  });

  server.registerTool('clipvault_list_contact_messages', {
    title: 'List Contact Messages',
    description: 'Read submitted contact-form messages. Results contain personal data and must be handled privately.',
    inputSchema: {
      query: z.string().optional(),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(25),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async (args) => jsonResult({ success: true, result: contentManager.listContactMessages(args) }));

  server.registerTool('clipvault_delete_contact_message', {
    title: 'Delete Contact Message',
    description: 'Delete one contact-form message by its id or createdAt value. Requires confirm=true.',
    inputSchema: {
      identifier: z.string().min(1),
      confirm: z.boolean().describe('Must be true to delete.'),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  }, async ({ identifier, confirm }) => {
    if (!confirm) return errorResult('Deletion requires confirm=true.');
    return jsonResult({ success: true, ...contentManager.deleteContactMessage(identifier) });
  });
}

function registerDownloaderTools(server) {
  server.registerTool('clipvault_video_info', {
    title: 'Get Video Metadata',
    description: 'Use yt-dlp to fetch metadata and available formats for one video URL. Only use for content you own or have permission to process.',
    inputSchema: {
      url: z.string().url(),
      formatId: z.string().optional(),
      cookiesPath: z.string().optional().describe('Optional path to a local cookies.txt file. Do not pass raw cookies.'),
      formatLimit: z.number().int().min(1).max(100).default(25),
      timeoutSeconds: z.number().int().min(10).max(300).default(120),
      acknowledgePolicy: z.boolean().describe('Must be true to confirm permitted use.'),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  }, async (args) => {
    try {
      return jsonResult({ success: true, info: await getVideoInfo(args) });
    } catch (err) {
      return errorResult(err.message);
    }
  });

  server.registerTool('clipvault_download_video', {
    title: 'Download One Video',
    description: 'Download one permitted video/audio file with yt-dlp into the ClipVault project downloads folder.',
    inputSchema: {
      url: z.string().url(),
      formatId: z.string().optional(),
      cookiesPath: z.string().optional().describe('Optional path to a local cookies.txt file. Do not pass raw cookies.'),
      filenamePrefix: z.string().optional(),
      outputDirectory: z.string().optional().describe('Project-relative directory. Defaults to downloads/.'),
      timeoutSeconds: z.number().int().min(30).max(900).default(300),
      acknowledgePolicy: z.boolean().describe('Must be true to confirm permitted use.'),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  }, async (args) => {
    try {
      return jsonResult(await downloadVideo(args));
    } catch (err) {
      return errorResult(err.message);
    }
  });
}

function registerResources(server) {
  server.registerResource('clipvault-settings', 'clipvault://settings', {
    title: 'ClipVault Settings',
    description: 'Effective settings for site branding, SEO, ads, analytics, and webmaster verification.',
    mimeType: 'application/json',
  }, async (uri) => ({
    contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(await getEffectiveSettings(), null, 2) }],
  }));

  server.registerResource('clipvault-tools', 'clipvault://tools', {
    title: 'ClipVault Tools',
    description: 'Downloader tool page definitions.',
    mimeType: 'application/json',
  }, async (uri) => ({
    contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(contentManager.readTools(), null, 2) }],
  }));

  server.registerResource('clipvault-blog', 'clipvault://blog', {
    title: 'ClipVault Blog',
    description: 'Blog guide metadata.',
    mimeType: 'application/json',
  }, async (uri) => ({
    contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(contentManager.readBlogPosts(), null, 2) }],
  }));

  server.registerResource('clipvault-seo-audit', 'clipvault://seo/audit', {
    title: 'ClipVault SEO Audit',
    description: 'Current SEO audit report.',
    mimeType: 'application/json',
  }, async (uri) => ({
    contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(seoManager.auditSeo(), null, 2) }],
  }));
}

function registerPrompts(server) {
  server.registerPrompt('clipvault_seo_growth_plan', {
    title: 'ClipVault SEO Growth Plan',
    description: 'Create an SEO improvement plan from the current ClipVault audit.',
    argsSchema: {
      focus: z.string().optional().describe('Optional focus area, e.g. AdSense, tools, blog, technical SEO.'),
    },
  }, async ({ focus }) => {
    const audit = seoManager.auditSeo();
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Use the ClipVault MCP tools to improve SEO${focus ? ` for ${focus}` : ''}. Start from this audit JSON:\n${JSON.stringify(audit, null, 2)}`,
        },
      }],
    };
  });

  server.registerPrompt('clipvault_blog_brief', {
    title: 'ClipVault Blog Brief',
    description: 'Draft a responsible, AdSense-safe video downloader guide brief.',
    argsSchema: {
      site: z.string().describe('Platform or content source, e.g. Vimeo or Reddit.'),
      keyword: z.string().optional().describe('Primary SEO keyword.'),
    },
  }, async ({ site, keyword }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Draft a ClipVault blog brief for ${site}. Primary keyword: ${keyword || `${site} video downloader`}. Include title, slug, meta description, summary, formats, FAQ ideas, and a copyright-safe usage reminder.`,
      },
    }],
  }));

  server.registerPrompt('clipvault_tool_page_optimization', {
    title: 'Optimize Downloader Tool Page',
    description: 'Generate a focused optimization brief for an existing ClipVault tool page.',
    argsSchema: {
      slug: z.string().describe('Existing downloader tool slug.'),
      targetCountry: z.string().optional().describe('Optional target country or audience.'),
    },
  }, async ({ slug, targetCountry }) => {
    const tool = contentManager.getTool(slug);
    const settings = await getEffectiveSettings();
    const context = tool
      ? JSON.stringify({ tool, meta: seoManager.metaPreview(`/${contentManager.toolSlug(tool)}`, undefined, settings) }, null, 2)
      : `No existing tool was found for slug "${slug}".`;
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Create an SEO and conversion optimization brief for ClipVault tool "${slug}"${targetCountry ? ` targeting ${targetCountry}` : ''}. Include keyword intent, title/meta improvements, FAQ ideas, internal links, trust/legal language, and MCP updates to apply.\n\nCurrent context:\n${context}`,
        },
      }],
    };
  });
}

function createServer() {
  const server = new McpServer({
    name: 'clipvault-mcp',
    version: '1.0.0',
    websiteUrl: process.env.CLIPVAULT_SITE_URL || 'https://clipvaultz.online',
  }, {
    capabilities: { logging: {} },
  });

  registerOverviewTools(server);
  registerSettingsTools(server);
  registerSeoTools(server);
  registerContentTools(server);
  registerDownloaderTools(server);
  registerResources(server);
  registerPrompts(server);
  return server;
}

async function runStdio() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ClipVault MCP server running on stdio.');
}

function requireBearerToken(req, res, next) {
  const expected = process.env.CLIPVAULT_MCP_TOKEN;
  const header = req.get('authorization') || '';
  const provided = header.startsWith('Bearer ') ? header.slice(7) : '';
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (providedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized MCP request.' });
}

async function runHttp() {
  const express = require('express');
  if (!process.env.CLIPVAULT_MCP_TOKEN) {
    throw new Error('CLIPVAULT_MCP_TOKEN is required for Streamable HTTP mode.');
  }
  const app = express();
  const port = parseInt(process.env.PORT || process.env.CLIPVAULT_MCP_PORT || '3030', 10);
  app.use(express.json({ limit: '4mb' }));
  app.use(requireBearerToken);

  app.post('/mcp', async (req, res) => {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => {
      void Promise.allSettled([transport.close(), server.close()]);
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error('MCP HTTP error:', err);
      if (!res.headersSent) {
        res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null });
      }
    }
  });

  app.get('/mcp', (req, res) => res.status(405).json({ error: 'Use POST /mcp for Streamable HTTP.' }));
  app.delete('/mcp', (req, res) => res.status(405).json({ error: 'Stateless MCP sessions do not require DELETE.' }));
  app.listen(port, () => console.error(`ClipVault MCP HTTP server running at http://localhost:${port}/mcp`));
}

if (require.main === module) {
  const mode = process.argv.includes('--http') ? 'http' : 'stdio';
  const runner = mode === 'http' ? runHttp : runStdio;
  runner().catch((err) => {
    console.error('ClipVault MCP failed:', err);
    process.exit(1);
  });
}

module.exports = { createServer };

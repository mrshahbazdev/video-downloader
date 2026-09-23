const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const adminDb = require('../lib/adminDb');
const { siteConfig, applySettings } = require('../lib/siteConfig');
const contentManager = require('../lib/contentManager');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

function requireLogin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.redirect('/admin/login');
}

router.use(express.urlencoded({ extended: true }));

async function ensureAdminUser() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await adminDb.saveAdmin(ADMIN_USERNAME, hash);
  console.log(`Admin user '${ADMIN_USERNAME}' synced from environment.`);
}

router.get('/login', (req, res) => {
  if (req.session && req.session.admin) return res.redirect('/admin');
  res.render('admin/login', {
    layout: 'admin/layout',
    admin: false,
    title: 'Login',
    siteTitle: siteConfig.siteTitle,
    error: req.query.error || '',
    username: req.query.username || '',
  });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  let valid = false;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    valid = true;
  } else {
    const user = await adminDb.findAdmin(username);
    if (user && user.password_hash) {
      valid = await bcrypt.compare(password, user.password_hash);
    }
  }
  if (valid) {
    req.session.admin = { username };
    return res.redirect('/admin');
  }
  res.redirect(`/admin/login?error=${encodeURIComponent('Invalid username or password')}&username=${encodeURIComponent(username || '')}`);
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

router.get('/', requireLogin, async (req, res) => {
  const settings = await adminDb.getSettings();
  res.render('admin/dashboard', {
    layout: 'admin/layout',
    admin: true,
    title: 'Dashboard',
    siteTitle: siteConfig.siteTitle,
    settings,
    stats: {
      tools: contentManager.readTools().length,
      blog: contentManager.readBlogPosts().length,
      dbType: adminDb.isJson() ? 'JSON' : 'MySQL',
    },
  });
});

router.get('/settings', requireLogin, async (req, res) => {
  const settings = await adminDb.getSettings();
  res.render('admin/settings', {
    layout: 'admin/layout',
    admin: true,
    title: 'Settings',
    siteTitle: siteConfig.siteTitle,
    settings,
    success: req.query.success || '',
  });
});

router.post('/settings', requireLogin, async (req, res) => {
  const keys = [
    'site_title', 'site_description', 'site_keywords',
    'adsense_client_id', 'analytics_id',
    'contact_email', 'contact_address',
    'gsc_verification', 'bing_verification',
  ];
  for (const key of keys) {
    await adminDb.setSetting(key, req.body[key] || '');
  }
  await applySettings();
  res.redirect('/admin/settings?success=Settings saved');
});

function pageParams(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const q = (req.query.q || '').trim().toLowerCase();
  return { page, q };
}

router.get('/tools', requireLogin, (req, res) => {
  const { page, q } = pageParams(req);
  const perPage = 50;
  const result = contentManager.listTools({ query: q, page, limit: perPage });
  res.render('admin/tools', {
    layout: 'admin/layout',
    admin: true,
    title: 'Tools',
    siteTitle: siteConfig.siteTitle,
    tools: result.items,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    q: req.query.q || '',
  });
});

router.post('/tools/:slug', requireLogin, async (req, res) => {
  const slug = decodeURIComponent(req.params.slug);
  const tool = contentManager.getTool(slug);
  if (!tool) return res.status(404).send('Tool not found');
  contentManager.upsertTool({
    ...(tool.link ? { link: tool.link } : { slug: tool.slug || slug }),
    title: req.body.title || tool.title,
    desc: req.body.desc || tool.desc,
    placeholder: req.body.placeholder || tool.placeholder,
    icon: tool.icon,
    keywords: tool.keywords,
  });
  res.redirect('/admin/tools?success=Tool updated');
});

router.get('/blog', requireLogin, (req, res) => {
  const { page, q } = pageParams(req);
  const perPage = 25;
  const result = contentManager.listBlogPosts({ query: q, page, limit: perPage });
  res.render('admin/blog', {
    layout: 'admin/layout',
    admin: true,
    title: 'Blog Posts',
    siteTitle: siteConfig.siteTitle,
    posts: result.items,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    q: req.query.q || '',
  });
});

router.post('/blog/:slug/delete', requireLogin, (req, res) => {
  const slug = decodeURIComponent(req.params.slug);
  if (!contentManager.getBlogPost(slug)) return res.status(404).send('Post not found');
  contentManager.deleteBlogPost(slug, { removeView: true });
  res.redirect('/admin/blog?success=Post deleted');
});

module.exports = { router, ensureAdminUser };

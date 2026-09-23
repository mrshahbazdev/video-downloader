const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE_DIR = path.join(__dirname, '..');
const TOOLS_FILE = path.join(BASE_DIR, 'data', 'tools.json');
const BLOG_FILE = path.join(BASE_DIR, 'data', 'blogPosts.json');
const CONTACT_MESSAGES_FILE = path.join(BASE_DIR, 'data', 'contact-messages.json');
const BLOG_VIEWS_DIR = path.join(BASE_DIR, 'views', 'blog');

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    throw new Error(`Invalid JSON in ${path.relative(BASE_DIR, filePath)}: ${err.message}`);
  }
}

function writeJson(filePath, data) {
  const tmpPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(data, null, 2)}\n`);
  fs.renameSync(tmpPath, filePath);
}

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toolSlug(tool) {
  if (tool.slug) return normalizeSlug(tool.slug);
  if (tool.link && tool.link.startsWith('/') && tool.link !== '/') return normalizeSlug(tool.link);
  return '';
}

function searchText(item) {
  return [
    item.title,
    item.desc,
    item.description,
    item.summary,
    item.site,
    item.keywords,
    item.slug,
    item.link,
    item.name,
    item.email,
    item.subject,
    item.message,
    item.createdAt,
  ].filter(Boolean).join(' ').toLowerCase();
}

function paginate(items, page = 1, limit = 25) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 200);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const start = (safePage - 1) * safeLimit;
  return {
    page: safePage,
    limit: safeLimit,
    total: items.length,
    totalPages: Math.max(Math.ceil(items.length / safeLimit), 1),
    items: items.slice(start, start + safeLimit),
  };
}

function readTools() {
  return readJson(TOOLS_FILE, []);
}

function writeTools(tools) {
  writeJson(TOOLS_FILE, tools);
}

function listTools(options = {}) {
  const q = String(options.query || '').trim().toLowerCase();
  const tools = readTools();
  const filtered = q ? tools.filter((tool) => searchText(tool).includes(q)) : tools;
  return paginate(filtered, options.page, options.limit);
}

function getTool(slug) {
  const raw = String(slug || '').trim();
  if (raw === '/') return readTools().find((tool) => tool.link === '/') || null;
  const wanted = normalizeSlug(slug);
  return readTools().find((tool) => toolSlug(tool) === wanted || normalizeSlug(tool.title) === wanted) || null;
}

function upsertTool(input) {
  const tools = readTools();
  const slug = normalizeSlug(input.slug || input.link || input.title);
  if (!slug && input.link !== '/') {
    throw new Error('Tool slug, link, or title is required.');
  }

  const idx = input.link === '/'
    ? tools.findIndex((tool) => tool.link === '/')
    : tools.findIndex((tool) => toolSlug(tool) === slug || normalizeSlug(tool.title) === slug);
  const existing = idx >= 0 ? tools[idx] : {};
  const next = {
    ...existing,
    icon: input.icon !== undefined ? input.icon : (existing.icon || '🛠️'),
    title: input.title !== undefined ? input.title : existing.title,
    desc: input.desc !== undefined ? input.desc : existing.desc,
    placeholder: input.placeholder !== undefined ? input.placeholder : existing.placeholder,
    keywords: input.keywords !== undefined ? input.keywords : existing.keywords,
  };

  if (input.link) {
    next.link = input.link.startsWith('/') ? input.link : `/${normalizeSlug(input.link)}`;
    delete next.slug;
  } else if (slug) {
    next.slug = slug;
    if (next.link) delete next.link;
  }

  if (!next.title) throw new Error('Tool title is required.');
  if (!next.desc) throw new Error('Tool description is required.');

  if (idx >= 0) {
    tools[idx] = next;
  } else {
    tools.push(next);
  }
  writeTools(tools);
  return { action: idx >= 0 ? 'updated' : 'created', tool: next, restartRequired: true };
}

function deleteTool(slug) {
  const tools = readTools();
  const raw = String(slug || '').trim();
  const wanted = normalizeSlug(slug);
  const nextTools = tools.filter((tool) => {
    if (raw === '/' && tool.link === '/') return false;
    return toolSlug(tool) !== wanted && normalizeSlug(tool.title) !== wanted;
  });
  if (nextTools.length === tools.length) {
    throw new Error(`Tool not found: ${slug}`);
  }
  writeTools(nextTools);
  return { action: 'deleted', slug: wanted, restartRequired: true };
}

function readBlogPosts() {
  return readJson(BLOG_FILE, []);
}

function writeBlogPosts(posts) {
  writeJson(BLOG_FILE, posts);
}

function listBlogPosts(options = {}) {
  const q = String(options.query || '').trim().toLowerCase();
  const posts = readBlogPosts();
  const filtered = q ? posts.filter((post) => searchText(post).includes(q)) : posts;
  return paginate(filtered, options.page, options.limit);
}

function getBlogPost(slug) {
  const wanted = normalizeSlug(slug);
  return readBlogPosts().find((post) => normalizeSlug(post.slug) === wanted) || null;
}

function upsertBlogPost(input) {
  const posts = readBlogPosts();
  const slug = normalizeSlug(input.slug || input.title);
  if (!slug) throw new Error('Blog post slug or title is required.');

  const idx = posts.findIndex((post) => normalizeSlug(post.slug) === slug);
  const existing = idx >= 0 ? posts[idx] : {};
  const now = new Date().toISOString().split('T')[0];
  const next = {
    ...existing,
    slug,
    title: input.title !== undefined ? input.title : existing.title,
    site: input.site !== undefined ? input.site : existing.site,
    formats: input.formats !== undefined ? input.formats : existing.formats,
    summary: input.summary !== undefined ? input.summary : existing.summary,
    description: input.description !== undefined ? input.description : existing.description,
    keywords: input.keywords !== undefined ? input.keywords : existing.keywords,
    author: input.author !== undefined ? input.author : (existing.author || 'ClipVault Editorial Team'),
    date: input.date !== undefined ? input.date : (existing.date || now),
    dateModified: input.dateModified !== undefined ? input.dateModified : now,
  };

  if (!next.title) throw new Error('Blog post title is required.');
  if (!next.site) throw new Error('Blog post site is required.');
  if (!next.formats) throw new Error('Blog post formats are required.');
  if (!next.summary) throw new Error('Blog post summary is required.');
  if (!next.description) throw new Error('Blog post description is required.');

  if (idx >= 0) {
    posts[idx] = next;
  } else {
    posts.push(next);
  }
  writeBlogPosts(posts);
  return { action: idx >= 0 ? 'updated' : 'created', post: next, view: `blog/${slug}`, restartRequired: true };
}

function deleteBlogPost(slug, options = {}) {
  const posts = readBlogPosts();
  const wanted = normalizeSlug(slug);
  const nextPosts = posts.filter((post) => normalizeSlug(post.slug) !== wanted);
  if (nextPosts.length === posts.length) {
    throw new Error(`Blog post not found: ${slug}`);
  }
  writeBlogPosts(nextPosts);

  const viewFile = path.join(BLOG_VIEWS_DIR, `${wanted}.ejs`);
  let removedView = false;
  if (options.removeView && fs.existsSync(viewFile)) {
    fs.unlinkSync(viewFile);
    removedView = true;
  }
  return { action: 'deleted', slug: wanted, removedView, restartRequired: true };
}

function readContactMessages() {
  return readJson(CONTACT_MESSAGES_FILE, []);
}

function addContactMessage(input) {
  const messages = readContactMessages();
  const message = {
    id: input.id || crypto.randomUUID(),
    name: input.name,
    email: input.email,
    subject: input.subject || 'General question',
    message: input.message,
    createdAt: input.createdAt || new Date().toISOString(),
  };
  messages.push(message);
  writeJson(CONTACT_MESSAGES_FILE, messages);
  return message;
}

function listContactMessages(options = {}) {
  const q = String(options.query || '').trim().toLowerCase();
  const messages = readContactMessages().slice().reverse();
  const filtered = q ? messages.filter((message) => searchText(message).includes(q)) : messages;
  return paginate(filtered, options.page, options.limit);
}

function deleteContactMessage(identifier) {
  const messages = readContactMessages();
  const wanted = String(identifier || '').trim();
  const nextMessages = messages.filter((message) => message.id !== wanted && message.createdAt !== wanted);
  if (nextMessages.length === messages.length) {
    throw new Error(`Contact message not found: ${identifier}`);
  }
  writeJson(CONTACT_MESSAGES_FILE, nextMessages);
  return { action: 'deleted', identifier: wanted };
}

module.exports = {
  BASE_DIR,
  TOOLS_FILE,
  BLOG_FILE,
  BLOG_VIEWS_DIR,
  CONTACT_MESSAGES_FILE,
  normalizeSlug,
  toolSlug,
  readTools,
  writeTools,
  listTools,
  getTool,
  upsertTool,
  deleteTool,
  readBlogPosts,
  writeBlogPosts,
  listBlogPosts,
  getBlogPost,
  upsertBlogPost,
  deleteBlogPost,
  readContactMessages,
  addContactMessage,
  listContactMessages,
  deleteContactMessage,
};

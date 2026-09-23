#!/usr/bin/env node
const path = require('path');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

const baseDir = path.join(__dirname, '..');

async function main() {
  const client = new Client({ name: 'clipvault-mcp-smoke', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(baseDir, 'mcp', 'server.js')],
    cwd: baseDir,
  });

  await client.connect(transport);
  try {
    const tools = await client.listTools();
    const toolNames = tools.tools.map((tool) => tool.name);
    const requiredTools = [
      'clipvault_overview',
      'clipvault_get_settings',
      'clipvault_update_settings',
      'clipvault_seo_audit',
      'clipvault_generate_seo_assets',
      'clipvault_meta_preview',
      'clipvault_search_tools',
      'clipvault_get_tool',
      'clipvault_upsert_tool',
      'clipvault_delete_tool',
      'clipvault_list_blog_posts',
      'clipvault_get_blog_post',
      'clipvault_upsert_blog_post',
      'clipvault_delete_blog_post',
      'clipvault_list_contact_messages',
      'clipvault_delete_contact_message',
      'clipvault_health_check',
      'clipvault_video_info',
      'clipvault_download_video',
    ];
    const missing = requiredTools.filter((name) => !toolNames.includes(name));
    if (missing.length) {
      throw new Error(`Missing MCP tools: ${missing.join(', ')}`);
    }

    const resources = await client.listResources();
    const resourceUris = resources.resources.map((resource) => resource.uri);
    ['clipvault://settings', 'clipvault://tools', 'clipvault://blog', 'clipvault://seo/audit'].forEach((uri) => {
      if (!resourceUris.includes(uri)) throw new Error(`Missing MCP resource: ${uri}`);
    });

    const prompts = await client.listPrompts();
    const promptNames = prompts.prompts.map((prompt) => prompt.name);
    ['clipvault_seo_growth_plan', 'clipvault_blog_brief', 'clipvault_tool_page_optimization'].forEach((name) => {
      if (!promptNames.includes(name)) throw new Error(`Missing MCP prompt: ${name}`);
    });

    const overview = await client.callTool({ name: 'clipvault_overview', arguments: {} });
    const audit = await client.callTool({ name: 'clipvault_seo_audit', arguments: { includeSamples: true } });
    const meta = await client.callTool({ name: 'clipvault_meta_preview', arguments: { path: '/tools' } });
    const search = await client.callTool({ name: 'clipvault_search_tools', arguments: { query: 'youtube', limit: 3 } });
    const health = await client.callTool({ name: 'clipvault_health_check', arguments: { includeNodeChecks: true } });
    const settingsDryRun = await client.callTool({
      name: 'clipvault_update_settings',
      arguments: { siteDescription: 'ClipVault MCP dry-run verification description.', dryRun: true },
    });
    const toolDryRun = await client.callTool({
      name: 'clipvault_upsert_tool',
      arguments: {
        slug: 'mcp-smoke-tool',
        title: 'MCP Smoke Tool',
        desc: 'Dry-run downloader tool used to validate the MCP schema safely.',
        dryRun: true,
      },
    });
    const blogDryRun = await client.callTool({
      name: 'clipvault_upsert_blog_post',
      arguments: {
        slug: 'mcp-smoke-blog',
        title: 'ClipVault MCP Smoke Blog Guide',
        site: 'Example',
        formats: 'MP4',
        summary: 'Dry-run blog summary used to validate MCP content schemas safely.',
        description: 'Dry-run blog description used to validate MCP content schemas without changing repository content.',
        dryRun: true,
      },
    });
    const contacts = await client.callTool({ name: 'clipvault_list_contact_messages', arguments: { limit: 1 } });

    [overview, audit, meta, search, health, settingsDryRun, toolDryRun, blogDryRun, contacts].forEach((result, idx) => {
      if (!result.content || !result.content[0] || result.content[0].type !== 'text') {
        throw new Error(`MCP call ${idx + 1} did not return text content.`);
      }
      const payload = JSON.parse(result.content[0].text);
      if (idx !== 4 && !payload.success) {
        throw new Error(`MCP call ${idx + 1} failed: ${payload.error || result.content[0].text}`);
      }
    });

    console.log(JSON.stringify({
      ok: true,
      tools: toolNames.length,
      resources: resourceUris.length,
      prompts: promptNames.length,
    }, null, 2));
  } finally {
    await transport.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

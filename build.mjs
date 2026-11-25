#!/usr/bin/env node
// Starvira Impact Foundation static site builder.
// Zero external dependencies: Markdown (marked) and YAML (js-yaml) are vendored in lib/vendor.
// Usage: node build.mjs            -> builds the site into ./dist
//        PREVIEW_DRAFTS=1 node build.mjs  -> also includes drafts and future-dated posts
import { readFile, writeFile, mkdir, readdir, rm, cp, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from './lib/vendor/marked.esm.js';
import { layout, esc, slugify } from './lib/layout.mjs';
import * as P from './lib/pages.mjs';

const require = createRequire(import.meta.url);
const yaml = require('./lib/vendor/js-yaml.cjs');
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const PREVIEW = process.env.PREVIEW_DRAFTS === '1';
const POSTS_PER_PAGE = 9;

marked.setOptions({ gfm: true, breaks: false });

async function readJSON(p) { return JSON.parse(await readFile(path.join(ROOT, p), 'utf8')); }

function parseFrontMatter(src, file) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`Missing front matter in ${file}`);
  return { data: yaml.load(m[1]) || {}, body: m[2] };
}

async function loadCollection(dir) {
  const full = path.join(ROOT, dir);
  const files = (await readdir(full)).filter((f) => f.endsWith('.md')).sort();
  return Promise.all(files.map(async (f) => {
    const { data, body } = parseFrontMatter(await readFile(path.join(full, f), 'utf8'), f);
    return { ...data, file: f, body, html: marked.parse(body) };
  }));
}

function require_(obj, keys, label) {
  for (const k of keys) if (obj[k] === undefined || obj[k] === null || obj[k] === '') throw new Error(`${label}: missing required field "${k}"`);
}

async function writePage(ctx, page) {
  const html = layout(ctx, page);
  const out = page.path.endsWith('.html') ? path.join(DIST, page.path) : path.join(DIST, page.path, 'index.html');
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, html);
  return page.path;
}

function themableLogo(svg) {
  return svg
    .replace(/<title>.*?<\/title>/, '')
    .replace(/ width="\d+" height="\d+"/, '')
    .replace(/role="img" aria-label="[^"]*"/, 'aria-hidden="true" focusable="false"')
    .replace(/fill="#194D3E"/g, 'fill="var(--logo-ink)"')
    .replace(/fill="#C69A52"/g, 'fill="var(--logo-gold)"')
    .replace(/fill="#9A7232"/g, 'fill="var(--logo-sub)"');
}

async function main() {
  const t0 = Date.now();
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });
  await cp(path.join(ROOT, 'public'), DIST, { recursive: true });
  await mkdir(path.join(DIST, 'css'), { recursive: true });
  await mkdir(path.join(DIST, 'js'), { recursive: true });
  const css = await readFile(path.join(ROOT, 'src/css/site.css'), 'utf8');
  const js = await readFile(path.join(ROOT, 'src/js/site.js'), 'utf8');
  const themeJs = await readFile(path.join(ROOT, 'src/js/theme-init.js'), 'utf8');
  await writeFile(path.join(DIST, 'css/site.css'), css);
  await writeFile(path.join(DIST, 'js/site.js'), js);
  await writeFile(path.join(DIST, 'js/theme-init.js'), themeJs);
  const assetVersion = createHash('sha1').update(css + js + themeJs).digest('hex').slice(0, 10);

  // ---------- Content ----------
  const site = await readJSON('content/site.json');
  const { authors } = await readJSON('content/authors.json');
  const { categories } = await readJSON('content/categories.json');
  const founderSrc = parseFrontMatter(await readFile(path.join(ROOT, 'content/pages/founder.md'), 'utf8'), 'founder.md');
  const founder = { ...founderSrc.data, messageHtml: marked.parse(founderSrc.body) };

  const programmes = (await loadCollection('content/programmes')).map((p) => {
    require_(p, ['title', 'slug', 'pillar', 'summary', 'image'], `Programme ${p.file}`);
    const out = { status: 'Planned', beneficiaries: [], activities: [], outcomes: [], indicators: [], partners: [], volunteerRoles: [], ...p };
    out.sdgs = (p.sdgs || []).map(Number).filter((n) => [1, 3, 4, 5].includes(n));
    return out;
  }).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const now = new Date();
  const allPosts = (await loadCollection('content/posts')).map((p) => {
    require_(p, ['title', 'date', 'summary'], `Post ${p.file}`);
    const date = p.date instanceof Date ? p.date : new Date(p.date);
    const slug = p.slug || slugify(p.file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''));
    const words = p.body.split(/\s+/).filter(Boolean).length;
    return { ...p, slug, date, dateISO: date.toISOString().slice(0, 10), readingTime: Math.max(1, Math.round(words / 200)) };
  });
  const posts = allPosts
    .filter((p) => PREVIEW || (!p.draft && p.date <= now))
    .sort((a, b) => b.date - a.date);
  const skipped = allPosts.length - posts.length;

  const baseUrl = (process.env.SITE_URL || site.url || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:4321')).replace(/\/$/, '');
  const logoSvg = themableLogo(await readFile(path.join(ROOT, 'public/images/brand/logo-horizontal.svg'), 'utf8'));
  const logoSvgFooter = (await readFile(path.join(ROOT, 'public/images/brand/logo-horizontal-on-dark.svg'), 'utf8'))
    .replace(/<title>.*?<\/title>/, '').replace(/ width="\d+" height="\d+"/, '').replace(/role="img" aria-label="[^"]*"/, `role="img" aria-label="${esc(site.name)}"`);

  const ctx = {
    site, programmes, posts, founder, categories, assetVersion, baseUrl, logoSvg, logoSvgFooter,
    categoryMap: Object.fromEntries(categories.map((c) => [c.slug, c])),
    authorMap: Object.fromEntries(authors.map((a) => [a.slug, a])),
  };

  // ---------- Pages ----------
  const pages = [
    P.home(ctx), P.about(ctx), P.founderPage(ctx), P.programmesIndex(ctx), P.impact(ctx),
    P.getInvolved(ctx), P.donate(ctx), P.contact(ctx), P.privacyPage(ctx), P.safeguardingPage(ctx), P.accessibilityPage(ctx), P.notFound(ctx),
    ...programmes.map((p) => P.programmeDetail(ctx, p)),
    ...posts.map((p) => P.storyPage(ctx, p)),
  ];
  const paginate = (list, base, category) => {
    const n = Math.max(1, Math.ceil(list.length / POSTS_PER_PAGE));
    for (let i = 1; i <= n; i++) pages.push(P.storiesIndex(ctx, { posts: list.slice((i - 1) * POSTS_PER_PAGE, i * POSTS_PER_PAGE), page: i, pages: n, basePath: base, category }));
  };
  paginate(posts, '/stories/', null);
  for (const c of categories) {
    const list = posts.filter((p) => p.category === c.slug);
    if (list.length) paginate(list, `/stories/category/${c.slug}/`, c);
  }
  const written = [];
  for (const pg of pages) written.push(await writePage(ctx, pg));

  // ---------- Sitemap, robots, feed, manifest ----------
  const sitemapUrls = written.filter((p) => !p.endsWith('.html'));
  await writeFile(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((u) => `  <url><loc>${baseUrl}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
  await writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${baseUrl}/sitemap.xml\n`);
  await mkdir(path.join(DIST, 'stories'), { recursive: true });
  await writeFile(path.join(DIST, 'stories/feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${esc(site.name)}</title><link>${baseUrl}/stories/</link><description>${esc(site.description)}</description><language>en-gb</language>\n${posts.slice(0, 20).map((p) => `<item><title>${esc(p.title)}</title><link>${baseUrl}/stories/${p.slug}/</link><guid>${baseUrl}/stories/${p.slug}/</guid><pubDate>${p.date.toUTCString()}</pubDate><description>${esc(p.summary)}</description></item>`).join('\n')}\n</channel></rss>\n`);
  await writeFile(path.join(DIST, 'site.webmanifest'), JSON.stringify({ name: site.name, short_name: site.shortName, start_url: '/', display: 'standalone', background_color: '#FCFAF5', theme_color: '#194D3E', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }] }, null, 2));

  const size = (await stat(path.join(DIST, 'css/site.css'))).size + (await stat(path.join(DIST, 'js/site.js'))).size;
  console.log(`Built ${written.length} pages (${posts.length} stories${skipped ? `, ${skipped} draft or scheduled skipped` : ''}) into dist/ in ${Date.now() - t0} ms. CSS+JS ${(size / 1024).toFixed(1)} KB. Base URL: ${baseUrl}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

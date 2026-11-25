// Checks the built site in ./dist: internal links resolve, no em dashes, key accessibility basics.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const DIST = path.resolve('dist');
async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p))); else out.push(p);
  }
  return out;
}
const files = await walk(DIST);
const html = files.filter((f) => f.endsWith('.html') && !f.includes(`${path.sep}admin${path.sep}`));
const pages = await Promise.all(html.map(async (f) => ({ f, s: await readFile(f, 'utf8') })));

test('every page has one h1, a title, a description and lang', () => {
  for (const { f, s } of pages) {
    assert.equal((s.match(/<h1[\s>]/g) || []).length, 1, `${f} h1 count`);
    assert.match(s, /<title>[^<]+<\/title>/, f);
    assert.match(s, /<meta name="description" content="[^"]+"/, f);
    assert.match(s, /<html lang="en-GB"/, f);
  }
});

test('no em dashes in built pages, content or source', async () => {
  for (const { f, s } of pages) assert.ok(!s.includes('—'), `em dash in ${f}`);
  for (const f of [...(await walk(path.resolve('content'))), ...(await walk(path.resolve('lib'))).filter((x) => !x.includes('vendor'))]) {
    assert.ok(!(await readFile(f, 'utf8')).includes('—'), `em dash in ${f}`);
  }
});

test('all internal links and assets resolve', async () => {
  const missing = new Set();
  for (const { f, s } of pages) {
    for (const m of s.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      let u = decodeURIComponent(m[1]);
      if (u.startsWith('/api/')) continue;
      let target = path.join(DIST, u);
      if (u.endsWith('/')) target = path.join(target, 'index.html');
      const ok = await stat(target).then(() => true, () => false);
      if (!ok) missing.add(`${u} (in ${path.relative(DIST, f)})`);
    }
    for (const m of s.matchAll(/srcset="([^"]+)"/g)) for (const part of m[1].split(',')) {
      const u = part.trim().split(' ')[0];
      if (!(await stat(path.join(DIST, u)).then(() => true, () => false))) missing.add(u);
    }
  }
  assert.deepEqual([...missing], []);
});

test('images have alt attributes and form controls have labels', () => {
  for (const { f, s } of pages) {
    for (const m of s.matchAll(/<img\b[^>]*>/g)) assert.match(m[0], /\balt="/, `${f}: ${m[0].slice(0, 80)}`);
    for (const m of s.matchAll(/<(input|select|textarea)\b[^>]*\bid="([^"]+)"/g)) {
      if (/type="hidden"/.test(m[0])) continue;
      assert.ok(s.includes(`for="${m[2]}"`), `${f}: no label for #${m[2]}`);
    }
  }
});

test('sitemap and robots exist', async () => {
  assert.match(await readFile(path.join(DIST, 'sitemap.xml'), 'utf8'), /<urlset/);
  assert.match(await readFile(path.join(DIST, 'robots.txt'), 'utf8'), /Sitemap:/);
});

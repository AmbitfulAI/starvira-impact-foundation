#!/usr/bin/env node
// Local development server: serves ./dist and runs the /api functions, mirroring Vercel.
// Usage: npm run dev   (builds, then serves on http://localhost:4321 with MAIL_MODE=log)
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT || 4321);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff': 'font/woff', '.ico': 'image/x-icon', '.xml': 'application/xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain', '.yml': 'text/yaml', '.pdf': 'application/pdf' };

function shim(res) {
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (o) => { if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); return res; };
  res.send = (s) => { res.end(s); return res; };
  return res;
}

async function readBody(req) {
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > 100_000) throw new Error('Body too large'); chunks.push(c); }
  const raw = Buffer.concat(chunks).toString('utf8');
  if ((req.headers['content-type'] || '').includes('application/json')) { try { return JSON.parse(raw); } catch { return raw; } }
  return raw;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith('/api/')) {
      const name = url.pathname.replace(/^\/api\//, '').replace(/[^a-z0-9-]/gi, '');
      const mod = await import(pathToFileURL(path.join(ROOT, 'api', `${name}.js`)).href).catch(() => null);
      if (!mod) { res.statusCode = 404; return res.end('Not found'); }
      req.body = req.method === 'POST' ? await readBody(req) : undefined;
      return mod.default(req, shim(res));
    }
    let p = decodeURIComponent(url.pathname);
    if (p.endsWith('/')) p += 'index.html';
    let file = path.join(DIST, path.normalize(p));
    if (!file.startsWith(DIST)) { res.statusCode = 403; return res.end(); }
    let st = await stat(file).catch(() => null);
    if (st && st.isDirectory()) { res.statusCode = 308; res.setHeader('Location', url.pathname + '/'); return res.end(); }
    if (!st) { res.statusCode = 404; file = path.join(DIST, '404.html'); }
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch (e) {
    console.error(e); res.statusCode = 500; res.end('Server error');
  }
});
server.listen(PORT, () => console.log(`Starvira site running at http://localhost:${PORT}  (MAIL_MODE=${process.env.MAIL_MODE || 'not set'})`));

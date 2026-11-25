// Completes GitHub sign-in for Decap CMS and hands the token back to the /admin window.
import { randomBytes } from 'node:crypto';

function readCookie(req, name) {
  const m = String(req.headers.cookie || '').match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

function page(res, status, payload, origin) {
  const nonce = randomBytes(16).toString('base64');
  const msg = `authorization:github:${status}:${JSON.stringify(payload)}`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Security-Policy', `default-src 'none'; script-src 'nonce-${nonce}'`);
  res.setHeader('Set-Cookie', 'cms_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  res.end(`<!doctype html><meta charset="utf-8"><title>Signing in</title><p>Completing sign-in, this window will close automatically.</p>
<script nonce="${nonce}">
(function () {
  var origin = ${JSON.stringify(origin)};
  function receive(e) {
    if (e.origin !== origin) return;
    window.opener.postMessage(${JSON.stringify(msg)}, origin);
    window.removeEventListener('message', receive, false);
  }
  window.addEventListener('message', receive, false);
  window.opener && window.opener.postMessage('authorizing:github', origin);
})();
</script>`);
}

export default async function handler(req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = `${proto}://${host}`;
  const url = new URL(req.url, origin);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state || state !== readCookie(req, 'cms_oauth_state')) {
    return page(res, 'error', { message: 'Sign-in could not be verified. Please try again.' }, origin);
  }
  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: process.env.GITHUB_OAUTH_CLIENT_ID, client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET, code, redirect_uri: `${origin}/api/callback` }),
    });
    const j = await r.json();
    if (!j.access_token) return page(res, 'error', { message: j.error_description || 'GitHub did not return an access token.' }, origin);
    return page(res, 'success', { token: j.access_token, provider: 'github' }, origin);
  } catch (e) {
    return page(res, 'error', { message: 'Sign-in failed. Please try again.' }, origin);
  }
}

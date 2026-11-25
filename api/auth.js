// Starts GitHub sign-in for the content management system (Decap CMS) at /admin.
// Requires GITHUB_OAUTH_CLIENT_ID and GITHUB_OAUTH_CLIENT_SECRET. See docs/CMS-SETUP.md.
import { randomBytes } from 'node:crypto';

export default function handler(req, res) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) return res.status(500).send('CMS sign-in is not configured. Set GITHUB_OAUTH_CLIENT_ID and GITHUB_OAUTH_CLIENT_SECRET.');
  const state = randomBytes(16).toString('hex');
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const redirect = `${proto}://${host}/api/callback`;
  const scope = process.env.GITHUB_OAUTH_SCOPE || 'repo,user';
  res.setHeader('Set-Cookie', `cms_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirect);
  url.searchParams.set('scope', scope);
  url.searchParams.set('state', state);
  res.statusCode = 302; res.setHeader('Location', url.toString()); res.end();
}

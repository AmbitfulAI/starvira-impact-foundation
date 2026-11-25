// Vercel serverless function: receives website form submissions, validates them and emails the Foundation.
// Configure with environment variables (see .env.example). No third-party packages are required.
import { validateSubmission, looksLikeSpam, formatEmail } from '../lib/forms.mjs';
import { appendFile, mkdir } from 'node:fs/promises';

const hits = new Map(); // best-effort, per-instance rate limiting
function rateLimited(ip) {
  const now = Date.now(), windowMs = 60_000, limit = 6;
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(ip, arr);
  return arr.length > limit;
}

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Turnstile not enabled
  if (!token) return false;
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip || '' }),
  });
  const j = await r.json().catch(() => ({}));
  return Boolean(j.success);
}

async function sendEmail({ subject, text, replyTo }) {
  const mode = (process.env.MAIL_MODE || '').toLowerCase();
  if (mode === 'log') {
    // Development only: log submissions to the console and a local file instead of sending email.
    console.log('\n[forms] ' + subject + '\n' + text + '\n');
    await mkdir('.data', { recursive: true });
    await appendFile('.data/submissions.jsonl', JSON.stringify({ subject, text, replyTo, at: new Date().toISOString() }) + '\n');
    return { ok: true };
  }
  const key = process.env.RESEND_API_KEY, to = process.env.FORMS_TO_EMAIL, from = process.env.FORMS_FROM_EMAIL;
  if (!key || !to || !from) return { ok: false, notConfigured: true };
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: to.split(',').map((s) => s.trim()), subject, text, reply_to: replyTo || undefined }),
  });
  if (!r.ok) { console.error('[forms] email provider error', r.status, await r.text().catch(() => '')); return { ok: false }; }
  return { ok: true };
}

const SUCCESS = {
  contact: 'Thank you for contacting Starvira Impact Foundation. We have received your message and will reply as soon as we can.',
  volunteer: 'Thank you for offering your time. We have received your registration and will be in touch about next steps.',
  partner: 'Thank you for your interest in partnering with us. A member of our team will contact you.',
  idea: 'Thank you for sharing your idea. We read every suggestion and will contact you if we would like to explore it further.',
  sponsor: 'Thank you for your interest in sponsoring a programme. We will contact you to discuss the details.',
  newsletter: 'Thank you for subscribing. We will keep you updated on our work.',
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ message: 'Method not allowed.' }); }
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (rateLimited(ip)) return res.status(429).json({ message: 'Too many submissions. Please wait a minute and try again.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return res.status(400).json({ message: 'Invalid submission.' });

  // Quietly accept likely spam without sending anything.
  if (looksLikeSpam(body)) return res.status(200).json({ message: SUCCESS[body.formType] || SUCCESS.contact });

  const result = validateSubmission(body);
  if (!result.ok) return res.status(422).json({ message: 'Please check the highlighted fields and try again.', errors: result.errors });

  const okCaptcha = await verifyTurnstile(body['cf-turnstile-response'], ip).catch(() => false);
  if (!okCaptcha) return res.status(400).json({ message: 'Please complete the security check and try again.' });

  const email = formatEmail(result, { page: body._page });
  const sent = await sendEmail({ ...email, replyTo: result.data.email }).catch((e) => { console.error(e); return { ok: false }; });
  if (sent.notConfigured) {
    const fallback = process.env.PUBLIC_CONTACT_EMAIL;
    return res.status(503).json({ message: `Our online forms are not connected yet, so your message was not sent.${fallback ? ` Please email ${fallback} instead.` : ' Please contact us by email instead.'}` });
  }
  if (!sent.ok) return res.status(502).json({ message: 'We could not send your message right now. Please try again shortly or contact us by email.' });
  return res.status(200).json({ message: SUCCESS[result.formType] });
}

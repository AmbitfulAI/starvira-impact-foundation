// Shared layout: document head, header, footer and rendering helpers.
import { icon } from './icons.mjs';

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Placeholders such as "[Account Number]" are hidden on the public site.
// Set SHOW_PLACEHOLDERS=1 when building to see them highlighted (useful while filling in details).
export const SHOW_PLACEHOLDERS = process.env.SHOW_PLACEHOLDERS === '1';

/** True when a value is real information (not empty and not a [bracketed] placeholder). */
export const known = (s) => Boolean(s) && !/\[[^\]]*\]/.test(String(s));
/** Kept for templates that check the opposite. */
export const isPh = (s) => !known(s);

/** Render a value. Placeholders are highlighted in preview builds and removed from public builds. */
export function ph(s) {
  const str = String(s ?? '');
  if (SHOW_PLACEHOLDERS) return esc(str).replace(/\[([^\]]+)\]/g, (_, t) => `<span class="ph">[${t}]</span>`);
  return esc(str.replace(/\[[^\]]*\]/g, '').replace(/^[\s,;:|·-]+|[\s,;:|·-]+$/g, '').replace(/\s{2,}/g, ' '));
}

export function slugify(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
export function formatDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function founderPicture(base, alt, { sizes = '(max-width: 860px) 90vw, 480px', loading = 'lazy', widths = [480, 800, 1200], fetchpriority } = {}) {
  const srcset = widths.map((w) => `/images/founder/${base}-${w}.webp ${w}w`).join(', ');
  return `<picture><source type="image/webp" srcset="${srcset}" sizes="${sizes}"><img src="/images/founder/${base}-800.jpg" alt="${esc(alt)}" width="800" height="1000" loading="${loading}" decoding="async"${fetchpriority ? ` fetchpriority="${fetchpriority}"` : ''}></picture>`;
}
export function img(src, alt = '', { loading = 'lazy', w = 1600, h = 800 } = {}) {
  return `<img src="${esc(src)}" alt="${esc(alt)}" width="${w}" height="${h}" loading="${loading}" decoding="async">`;
}
export const arrow = icon('arrow', 18);

const NAV = [
  ['/about/', 'About'], ['/founder/', 'Our founder'], ['/programmes/', 'Programmes'], ['/impact/', 'Impact'],
  ['/stories/', 'Stories'], ['/get-involved/', 'Get involved'], ['/contact/', 'Contact'],
];

export function layout(ctx, page) {
  const { site, logoSvg, logoSvgFooter, assetVersion, baseUrl } = ctx;
  const title = page.title === site.name ? `${site.name} | ${site.slogan}` : `${page.title} | ${site.name}`;
  const desc = page.description || site.description;
  const canonical = baseUrl + page.path;
  const ogImage = baseUrl + (page.ogImage || '/images/og/starvira-og-default.png');
  const current = (href) => page.path === href || (href !== '/' && page.path.startsWith(href));
  const turnstile = site.forms?.turnstileSiteKey && page.hasForm ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>' : '';
  const plausible = site.analytics?.plausibleDomain ? `<script defer data-domain="${esc(site.analytics.plausibleDomain)}" src="https://plausible.io/js/script.js"></script>` : '';
  const jsonld = (page.jsonld || []).map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('');
  const social = (site.social || []).filter((s) => s.url);
  const email = known(site.contact.email) ? site.contact.email : '';

  return `<!doctype html>
<html lang="en-GB" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(canonical)}">
<meta name="theme-color" content="#FAF7F0">
<meta name="color-scheme" content="light dark">
<script src="/js/theme-init.js?v=${assetVersion}"></script>
<link rel="preload" href="/fonts/lora-var.woff" as="font" type="font/woff" crossorigin>
<link rel="preload" href="/fonts/dmsans-var.woff" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="/css/site.css?v=${assetVersion}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="alternate" type="application/rss+xml" title="${esc(site.name)} stories" href="/stories/feed.xml">
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:locale" content="${esc(site.locale || 'en_NG')}">
<meta name="twitter:card" content="summary_large_image">
${page.noindex ? '<meta name="robots" content="noindex">' : ''}
${jsonld}${turnstile}${plausible}
<script src="/js/site.js?v=${assetVersion}" defer></script>
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="${esc(site.name)}, home">${logoSvg}</a>
    <nav class="primary-nav" id="primary-nav" aria-label="Main">
      <ul>${NAV.map(([href, label]) => `<li><a href="${href}"${current(href) ? ' aria-current="page"' : ''}>${label}</a></li>`).join('')}<li class="mobile-only"><a class="btn btn-solid" href="/donate/">Donate</a></li></ul>
    </nav>
    <div class="header-actions">
      <button class="icon-btn theme-toggle" type="button" data-theme-toggle aria-pressed="false" aria-label="Switch to dark theme">${icon('moon', 19, ' class="icon-moon"')}${icon('sun', 19, ' class="icon-sun"')}</button>
      <a class="btn btn-solid btn-sm header-donate" href="/donate/">Donate</a>
      <button class="icon-btn nav-toggle" type="button" data-nav-toggle aria-controls="primary-nav" aria-expanded="false" aria-label="Open menu">${icon('menu', 22)}</button>
    </div>
  </div>
</header>
<main id="main" tabindex="-1">
${page.body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div>
        <div class="logo">${logoSvgFooter}</div>
        <p class="footer-slogan">${esc(site.slogan)}</p>
      </div>
      <div>
        <h2>Explore</h2>
        <ul>
          <li><a href="/about/">About</a></li><li><a href="/founder/">Our founder</a></li><li><a href="/programmes/">Programmes</a></li><li><a href="/impact/">Impact</a></li>
          <li><a href="/stories/">Stories</a></li><li><a href="/get-involved/">Get involved</a></li><li><a href="/donate/">Donate</a></li><li><a href="/contact/">Contact</a></li>
        </ul>
      </div>
      <div>
        <h2>Stay in touch</h2>
        <form class="newsletter" data-form action="${esc(site.forms.endpoint)}" method="post" data-fallback-email="${esc(email)}">
          <input type="hidden" name="formType" value="newsletter">
          <div class="hp" aria-hidden="true"><label>Leave this empty<input type="text" name="company_url" tabindex="-1" autocomplete="off"></label></div>
          <label class="visually-hidden" for="nl-email">Email address</label>
          <input id="nl-email" type="email" name="email" placeholder="Your email address" autocomplete="email" required aria-describedby="nl-email-error">
          <button type="submit"><span class="spinner" aria-hidden="true"></span>Subscribe ${icon('arrow', 16)}</button>
          <span id="nl-email-error" class="visually-hidden"></span>
          <div class="form-status" aria-live="polite"></div>
        </form>
        <p style="margin-top:1.2rem;font-size:.9rem;opacity:.8">Occasional news from our programmes. Never shared.</p>
        ${email ? `<p><a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
        ${social.length ? `<ul class="social" aria-label="Social media">${social.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.name)}">${icon(s.name.toLowerCase(), 19)}</a></li>`).join('')}</ul>` : ''}
      </div>
    </div>
    <div class="footer-bottom">
      <p style="margin:0">&copy; <span data-year>${new Date().getFullYear()}</span> ${esc(site.name)} &middot; Akure and Akungba Akoko, Ondo State, Nigeria${known(site.registration.number) ? ` &middot; ${esc(site.registration.number)}` : ''}</p>
      <ul><li><a href="/privacy/">Privacy</a></li><li><a href="/safeguarding/">Safeguarding</a></li><li><a href="/accessibility/">Accessibility</a></li></ul>
    </div>
  </div>
</footer>
</body>
</html>`;
}

export function intro({ label, title, lead, crumbs = [] }) {
  const bc = crumbs.length ? `<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a>${crumbs.map(([href, t], i) => `<span>/</span>${i === crumbs.length - 1 ? `<span aria-current="page" style="opacity:1;margin:0">${esc(t)}</span>` : `<a href="${href}">${esc(t)}</a>`}`).join('')}</nav>` : '';
  return `<section class="intro"><div class="wrap">${bc}${label ? `<span class="label">${esc(label)}</span>` : ''}<h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div></section>`;
}

export const SDG = {
  1: { name: 'No Poverty', color: '#E5243B' },
  3: { name: 'Good Health and Well-being', color: '#4C9F38' },
  4: { name: 'Quality Education', color: '#C5192D' },
  5: { name: 'Gender Equality', color: '#FF3A21' },
};

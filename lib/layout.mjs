// Shared layout: document head, header, footer and small rendering helpers.
import { icon } from './icons.mjs';

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** True when a value is a bracketed placeholder such as "[Account Number]" or empty. */
export const isPh = (s) => !s || /^\s*\[.*\]\s*$/.test(String(s)) || /\[[^\]]+\]/.test(String(s));

/** Render a value, marking any [bracketed] parts as placeholders awaiting real information. */
export function ph(s) {
  const str = String(s ?? '');
  if (!str) return '';
  return esc(str).replace(/\[([^\]]+)\]/g, (_, inner) => `<span class="ph" title="Placeholder: replace before launch">[${inner}]</span>`);
}

export function slugify(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

export function formatDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** Responsive founder image using the pre-generated webp sizes. */
export function founderPicture(base, alt, { sizes = '(max-width: 900px) 90vw, 460px', loading = 'lazy', widths = [480, 800, 1200], fetchpriority } = {}) {
  const srcset = widths.map((w) => `/images/founder/${base}-${w}.webp ${w}w`).join(', ');
  return `<picture><source type="image/webp" srcset="${srcset}" sizes="${sizes}"><img src="/images/founder/${base}-800.jpg" alt="${esc(alt)}" width="800" height="1000" loading="${loading}" decoding="async"${fetchpriority ? ` fetchpriority="${fetchpriority}"` : ''}></picture>`;
}

export function illustration(src, alt, { loading = 'lazy', w = 800, h = 600 } = {}) {
  return `<img src="${esc(src)}" alt="${esc(alt)}" width="${w}" height="${h}" loading="${loading}" decoding="async">`;
}

const NAV = [
  ['/about/', 'About'],
  ['/founder/', 'Our Founder'],
  ['/programmes/', 'Programmes'],
  ['/impact/', 'Impact'],
  ['/stories/', 'Stories'],
  ['/get-involved/', 'Get Involved'],
  ['/contact/', 'Contact'],
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

  const navLinks = NAV.map(([href, label]) => `<li><a href="${href}"${current(href) ? ' aria-current="page"' : ''}>${label}</a></li>`).join('');

  const social = (site.social || []).map((s) => {
    const key = s.name.toLowerCase();
    return s.url
      ? `<li><a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.name)} (opens in a new tab)">${icon(key, 18)}</a></li>`
      : `<li><span title="${esc(s.name)}: coming soon" aria-label="${esc(s.name)}: coming soon" role="img">${icon(key, 18)}</span></li>`;
  }).join('');
  const anySocial = (site.social || []).some((s) => s.url);

  return `<!doctype html>
<html lang="en-GB" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(canonical)}">
<meta name="theme-color" content="#FCFAF5">
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
${jsonld}
${turnstile}
${plausible}
<script src="/js/site.js?v=${assetVersion}" defer></script>
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="${esc(site.name)}, home">${logoSvg}</a>
    <nav class="primary-nav" id="primary-nav" aria-label="Main">
      <ul>${navLinks}<li class="mobile-donate"><a class="btn btn-primary" href="/donate/">${icon('heart', 18)} Donate</a></li></ul>
    </nav>
    <div class="header-actions">
      <button class="icon-btn theme-toggle" type="button" data-theme-toggle aria-pressed="false" aria-label="Switch to dark theme">${icon('moon', 20, ' class="icon-moon"')}${icon('sun', 20, ' class="icon-sun"')}</button>
      <a class="btn btn-primary btn-sm header-donate" href="/donate/">Donate</a>
      <button class="icon-btn nav-toggle" type="button" data-nav-toggle aria-controls="primary-nav" aria-expanded="false" aria-label="Open menu">${icon('menu', 22)}</button>
    </div>
  </div>
</header>
<main id="main" tabindex="-1">
${page.body}
</main>
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        ${logoSvgFooter}
        <p>${esc(site.positioning)}</p>
        <p class="footer-slogan">${esc(site.slogan)}</p>
      </div>
      <div>
        <h2>Explore</h2>
        <ul>
          <li><a href="/about/">About us</a></li>
          <li><a href="/founder/">Our founder</a></li>
          <li><a href="/impact/">Impact and accountability</a></li>
          <li><a href="/stories/">Stories</a></li>
          <li><a href="/get-involved/">Get involved</a></li>
          <li><a href="/donate/">Donate</a></li>
          <li><a href="/contact/">Contact</a></li>
        </ul>
      </div>
      <div>
        <h2>Programmes</h2>
        <ul>${ctx.programmes.map((p) => `<li><a href="/programmes/${p.slug}/">${esc(p.title)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h2>Stay in touch</h2>
        <p>News from our programmes, occasionally and never shared with third parties.</p>
        <form class="newsletter" data-form action="${esc(site.forms.endpoint)}" method="post" data-fallback-email="${esc(isPh(site.contact.email) ? '' : site.contact.email)}">
          <input type="hidden" name="formType" value="newsletter">
          <div class="hp" aria-hidden="true"><label>Leave this empty<input type="text" name="company_url" tabindex="-1" autocomplete="off"></label></div>
          <label class="visually-hidden" for="nl-email">Email address</label>
          <input id="nl-email" type="email" name="email" placeholder="Your email address" autocomplete="email" required aria-describedby="nl-email-error">
          <button class="btn btn-gold btn-sm" type="submit"><span class="spinner" aria-hidden="true"></span>Subscribe</button>
          <span id="nl-email-error" class="visually-hidden"></span>
          <div class="form-status" aria-live="polite"></div>
        </form>
        <p style="margin-top:1.4rem">${icon('mail', 16, ' style="display:inline;vertical-align:-3px;margin-right:.4rem"')}${isPh(site.contact.email) ? ph(site.contact.email) : `<a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a>`}</p>
        <ul class="social" aria-label="Social media">${social}</ul>
        ${anySocial ? '' : '<p style="font-size:.85rem;margin-top:.7rem;opacity:.75">Our social channels are launching soon.</p>'}
      </div>
    </div>
    <div class="footer-bottom">
      <p class="mb-0">&copy; <span data-year>${new Date().getFullYear()}</span> ${esc(site.name)}. Akure and Akungba Akoko, Ondo State, Nigeria.<br>${ph(site.registration.number)}</p>
      <ul>
        <li><a href="/privacy/">Privacy</a></li>
        <li><a href="/safeguarding/">Safeguarding</a></li>
        <li><a href="/accessibility/">Accessibility</a></li>
      </ul>
    </div>
  </div>
</footer>
</body>
</html>`;
}

export function pageHero({ eyebrow, title, lead, crumbs = [], art = true }) {
  const bc = crumbs.length ? `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li>${crumbs.map(([href, label], i) => i === crumbs.length - 1 ? `<li aria-current="page">${esc(label)}</li>` : `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ol></nav>` : '';
  return `<section class="page-hero">
  ${art ? '<img class="page-hero-star" src="/images/brand/hero-orbit.svg" alt="" aria-hidden="true" width="360" height="360">' : ''}
  <div class="container">
    ${bc}
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <h1>${title}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
  </div>
</section>`;
}

export const SDG = {
  1: { name: 'No Poverty', color: '#E5243B' },
  3: { name: 'Good Health and Well-being', color: '#4C9F38' },
  4: { name: 'Quality Education', color: '#C5192D' },
  5: { name: 'Gender Equality', color: '#FF3A21' },
};
export const sdgChip = (n) => `<span class="sdg-chip"><span class="num" style="background:${SDG[n].color}">${n}</span>SDG ${n}: ${SDG[n].name}</span>`;

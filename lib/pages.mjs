// Page templates (editorial edition). Each returns { path, title, description, body, ... }.
import { icon } from './icons.mjs';
import { esc, ph, known, intro, SDG, founderPicture, img, formatDate, arrow, SHOW_PLACEHOLDERS } from './layout.mjs';
import { CONTACT_CATEGORIES, VOLUNTEER_LOCATIONS, VOLUNTEER_AVAILABILITY, PARTNERSHIP_TYPES, SUPPORT_TYPES, PROGRAMME_NAMES } from './forms.mjs';

export const PILLARS = [
  { key: 'education', title: 'Education and youth', sdg: 4, text: 'Helping children stay in school and young people build the skills and confidence to lead.' },
  { key: 'health', title: 'Health and well-being', sdg: 3, text: 'Practical health education and links to qualified care, close to home.' },
  { key: 'livelihoods', title: 'Livelihoods', sdg: 1, text: 'Skills, enterprise and financial know-how for stable, independent incomes.' },
  { key: 'equality', title: 'Equality and inclusion', sdg: 5, text: 'Safe spaces and equal opportunity for girls and women, with communities alongside.' },
];
const VALUES = [
  ['Compassion', 'We listen and respond with dignity, kindness and empathy.'],
  ['Integrity', 'We are honest and accountable in how we work and use resources.'],
  ['Empowerment', 'We build knowledge, confidence and futures people own.'],
  ['Equality', 'Dignity never depends on gender, disability, income or background.'],
  ['Excellence', 'We pursue thoughtful solutions and measure whether they work.'],
  ['Community', 'Local knowledge, participation and ownership come first.'],
];
const hp = '<div class="hp" aria-hidden="true"><label>Leave this empty<input type="text" name="company_url" tabindex="-1" autocomplete="off"></label></div>';
const reveal = (html, cls = '') => `<div class="reveal ${cls}">${html}</div>`;

// ---------- Forms ----------
function field(id, name, label, { type = 'text', required = false, optional = false, hint = '', autocomplete = '', min = 0, max = 0, rows = 0, options = null } = {}) {
  const desc = [hint ? `${id}-hint` : '', `${id}-error`].filter(Boolean).join(' ');
  const req = required ? ' required' : '';
  let control;
  if (options) control = `<select id="${id}" name="${name}"${req} aria-describedby="${desc}"><option value="">Please choose</option>${options.map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
  else if (rows) control = `<textarea id="${id}" name="${name}" rows="${rows}"${req}${min ? ` minlength="${min}"` : ''}${max ? ` maxlength="${max}"` : ''} aria-describedby="${desc}"></textarea>`;
  else control = `<input id="${id}" name="${name}" type="${type}"${req}${autocomplete ? ` autocomplete="${autocomplete}"` : ''}${max ? ` maxlength="${max}"` : ''} aria-describedby="${desc}">`;
  return `<div class="field"><label for="${id}">${esc(label)}${optional ? ' <span class="optional">(optional)</span>' : ''}</label>${hint ? `<span class="hint" id="${id}-hint">${hint}</span>` : ''}${control}<span class="error" id="${id}-error"></span></div>`;
}
const checkbox = (id, name, html, { required = false, msg = '' } = {}) => `<div class="field"><label class="check" for="${id}"><input type="checkbox" id="${id}" name="${name}" value="yes"${required ? ' required' : ''}${msg ? ` data-msg="${esc(msg)}"` : ''} aria-describedby="${id}-error"><span>${html}</span></label><span class="error" id="${id}-error"></span></div>`;
const checkGroup = (p, name, legend, opts) => `<fieldset class="field"><legend>${esc(legend)} <span class="optional">(optional)</span></legend><div class="checks">${opts.map((o, i) => `<label class="check" for="${p}-${i}"><input type="checkbox" id="${p}-${i}" name="${name}" value="${esc(o)}"><span>${esc(o)}</span></label>`).join('')}</div></fieldset>`;
const consent = (id) => checkbox(id, 'consent', 'I agree that Starvira Impact Foundation may use these details to respond to me, as described in the <a href="/privacy/">privacy notice</a>.', { required: true, msg: 'Please confirm so we can respond.' });
function form(ctx, type, inner, submit) {
  const { site } = ctx;
  const ts = site.forms?.turnstileSiteKey ? `<div class="cf-turnstile" data-sitekey="${esc(site.forms.turnstileSiteKey)}"></div>` : '';
  return `<form class="form" data-form action="${esc(site.forms.endpoint)}" method="post" data-fallback-email="${esc(known(site.contact.email) ? site.contact.email : '')}">
<input type="hidden" name="formType" value="${type}">${hp}${inner}${ts}
<div class="form-status" aria-live="polite"></div>
<div><button class="btn btn-solid" type="submit"><span class="spinner" aria-hidden="true"></span>${esc(submit)} ${arrow}</button></div>
</form>`;
}

// ---------- Fragments ----------
const programmeRow = (p) => `<li><a href="/programmes/${p.slug}/"><span class="name">${esc(p.title)}</span><span class="desc">${esc(p.summary)}</span><span class="go">${arrow}</span></a></li>`;
export function storyCard(post, ctx) {
  const cat = ctx.categoryMap[post.category];
  return `<a class="story reveal" href="/stories/${post.slug}/"><div class="media">${post.image ? img(post.image, post.imageAlt || '') : ''}</div><p class="meta">${cat ? esc(cat.name) + ' &middot; ' : ''}<time datetime="${post.dateISO}">${formatDate(post.date)}</time></p><h3>${esc(post.title)}</h3><p>${esc(post.summary)}</p></a>`;
}
function band(title, text, { primary = ['/donate/', 'Donate'], secondary = ['/get-involved/', 'Get involved'], art = '/images/art/hero.svg' } = {}) {
  return `<section class="deep band"><div class="bg">${img(art, '')}</div><div class="wrap reveal"><h2>${title}</h2><p class="lead">${text}</p><div class="actions"><a class="btn btn-gold" href="${primary[0]}">${primary[1]} ${arrow}</a>${secondary ? `<a class="btn btn-ghost" href="${secondary[0]}">${secondary[1]}</a>` : ''}</div></div></section>`;
}
const ngoJsonLd = (ctx) => ({
  '@context': 'https://schema.org', '@type': 'NGO', name: ctx.site.name, alternateName: ctx.site.abbreviation, url: ctx.baseUrl + '/', logo: ctx.baseUrl + '/icon-512.png', slogan: ctx.site.slogan, description: ctx.site.description,
  areaServed: ['Akure', 'Akungba Akoko', 'Ondo State, Nigeria'], founder: { '@type': 'Person', name: ctx.site.founder.name },
  ...(known(ctx.site.contact.email) ? { email: ctx.site.contact.email } : {}), sameAs: ctx.site.social.filter((s) => s.url).map((s) => s.url),
});
const noTop = ' style="padding-top:0"';

// =====================================================================
export function home(ctx) {
  const { site, programmes, posts, founder } = ctx;
  const body = `
<section class="hero"><div class="wrap">
  <div class="reveal">
    <span class="label">Starvira Impact Foundation &middot; Ondo State, Nigeria</span>
    <h1>Every life deserves the chance to <em>shine.</em></h1>
    <p class="lead">We work alongside children, young people, women and families in Akure and Akungba Akoko to open paths to education, health, equality and lasting opportunity.</p>
    <div class="actions"><a class="btn btn-solid" href="/donate/">Support our mission</a><a class="btn btn-line" href="/programmes/">Discover our work</a></div>
  </div>
  <figure class="hero-art reveal">${img('/images/art/hero.svg', '', { loading: 'eager', w: 1600, h: 760 })}<figcaption>Lighting paths. Lifting lives. Creating impact.</figcaption></figure>
</div></section>

<section class="section"><div class="wrap grid-aside">
  ${reveal('<span class="label">Our purpose</span>')}
  ${reveal(`<p class="statement">Lasting progress begins when people have opportunity, resources, dignity and support to shape their own futures. That is what we exist to provide.</p><a class="more" href="/about/">Our story ${arrow}</a>`)}
</div></section>

<section class="section tint"><div class="wrap">
  <div class="head-row reveal"><h2>Where we work</h2><a class="more" href="/programmes/">All programmes ${arrow}</a></div>
  <div class="cols">${PILLARS.map((p) => reveal(`<span class="meta">SDG ${p.sdg} &middot; ${SDG[p.sdg].name}</span><h3>${p.title}</h3><p>${p.text}</p>`, 'col')).join('')}</div>
</div></section>

<section class="section"><div class="wrap">
  <div class="head-row reveal"><div><span class="label">Programmes</span><h2>Seven programmes, designed with communities</h2></div></div>
  <ul class="index reveal">${programmes.map(programmeRow).join('')}</ul>
</div></section>

<section class="section tint"><div class="wrap founder">
  <figure class="portrait reveal"><div class="frame">${founderPicture('jumoke-kolade-portrait', `Portrait of ${founder.name}`)}</div><figcaption>${esc(site.founder.photoCredit)}</figcaption></figure>
  ${reveal(`<span class="label">Our founder</span>
    <p class="quote">“Where a person starts in life should not decide how far they can go.”</p>
    <p class="byline"><strong>${esc(founder.name)}</strong><br>${esc(founder.role)}</p>
    <a class="more" href="/founder/">Read her message ${arrow}</a>`)}
</div></section>

<section class="section"><div class="wrap">
  <div class="head-row reveal"><h2>Take part</h2></div>
  <div class="cols cols-3">
    ${reveal(`<h3>Volunteer</h3><p>Give a few hours to mentor, teach, organise or help tell our story.</p><a class="more" href="/get-involved/#volunteer">Become a volunteer ${arrow}</a>`, 'col')}
    ${reveal(`<h3>Partner</h3><p>Companies, schools and institutions can sponsor programmes or co-design new ones.</p><a class="more" href="/get-involved/#partner">Explore partnerships ${arrow}</a>`, 'col')}
    ${reveal(`<h3>Give</h3><p>Every gift is acknowledged, recorded and used for its intended purpose.</p><a class="more" href="/donate/">Ways to give ${arrow}</a>`, 'col')}
  </div>
</div></section>

${posts.length ? `<section class="section tint"><div class="wrap">
  <div class="head-row reveal"><h2>Stories</h2><a class="more" href="/stories/">All stories ${arrow}</a></div>
  <div class="stories">${posts.slice(0, 3).map((p) => storyCard(p, ctx)).join('')}</div>
</div></section>` : ''}

${band('Every contribution lights a path.', 'Help a child start the school year, a woman build a business, a family stay healthy.')}`;
  return { path: '/', title: site.name, description: site.description, body, jsonld: [ngoJsonLd(ctx), { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: ctx.baseUrl + '/' }] };
}

// =====================================================================
export function about(ctx) {
  const { site } = ctx;
  const body = `
${intro({ label: 'About us', title: 'A community-led foundation creating pathways to dignity and opportunity.', lead: 'We begin in Akure and Akungba Akoko, Ondo State, with the ambition of building models of community impact that can serve families across Nigeria.', crumbs: [['/about/', 'About']] })}
<section class="section"${noTop}><div class="wrap"><div class="banner reveal">${img('/images/art/community.svg', '', { loading: 'eager' })}</div></div></section>

<section class="section"${noTop}><div class="wrap grid-aside">
  ${reveal('<span class="label">Our story</span>')}
  ${reveal(`<p class="statement">Hardship is rarely caused by one thing. A missed school term, a preventable illness and an unstable income are often connected, so our response is connected too.</p>
  <p class="lead">Starting close to home lets us listen carefully, build trust and learn what works before we grow. We combine practical support today with skills and confidence that last.</p>`)}
</div></section>

<section class="section tint"><div class="wrap grid-aside">
  ${reveal('<span class="label">The name</span>')}
  <div class="cols cols-2 reveal">
    <div class="col"><h3><em>Star</em></h3><p>Light, hope, guidance and the potential within every human being.</p></div>
    <div class="col"><h3><em>Vira</em></h3><p>For us: faith, truth, courage and the determination to overcome adversity.</p></div>
  </div>
</div></section>

<section class="section"><div class="wrap grid-2">
  ${reveal('<span class="label">Vision</span><p class="statement">A world where every person, regardless of circumstance, can thrive and fulfil their potential.</p>')}
  ${reveal('<span class="label">Mission</span><p class="statement">To light paths and lift lives through compassionate, community-led programmes that create lasting, measurable impact.</p>')}
</div></section>

<section class="section tint"><div class="wrap">
  <div class="head-row reveal"><h2>Our values</h2></div>
  <div class="cols cols-3">${VALUES.map(([t, d]) => reveal(`<h3>${t}</h3><p>${d}</p>`, 'col')).join('')}</div>
</div></section>

<section class="section"><div class="wrap grid-aside">
  ${reveal('<span class="label">Accountability</span>')}
  ${reveal(`<p class="statement">Trust is earned through clear systems, not promises.</p>
    <ul class="list">
      <li>Funds held only in the Foundation's registered name, with two signatories for significant payments</li>
      <li>Restricted gifts tracked and spent on their stated purpose</li>
      <li>Written safeguarding, privacy and conflict of interest policies</li>
      <li>Only verified results published, in an annual report with a financial summary</li>
    </ul>
    ${known(site.registration.number) ? `<p class="soft">Registration ${esc(site.registration.number)}.</p>` : ''}
    <a class="more" href="/impact/">How we measure impact ${arrow}</a>`)}
</div></section>
${band('Help us build something that lasts.', 'Join as a volunteer, partner or supporter at the very beginning of our story.')}`;
  return { path: '/about/', title: 'About us', description: 'Our story, the meaning behind Starvira, our vision, mission, values and commitment to accountability.', body };
}

// =====================================================================
export function founderPage(ctx) {
  const { site, founder } = ctx;
  const li = founder.linkedin || site.founder.linkedin;
  const showBio = SHOW_PLACEHOLDERS || known(founder.biography) || known(founder.story);
  const body = `
<section class="intro"><div class="wrap founder">
  ${reveal(`<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span aria-current="page" style="opacity:1;margin:0">Our founder</span></nav>
    <span class="label">Founder and Chief Executive Officer</span>
    <h1>${esc(founder.name)}</h1>
    <p class="lead">${esc(founder.intro)}</p>
    <div class="actions" style="margin-top:2rem"><a class="btn btn-solid" href="#message">Read her message</a>${li ? `<a class="btn btn-line" href="${esc(li)}" target="_blank" rel="noopener">LinkedIn</a>` : ''}</div>`)}
  <figure class="portrait reveal" style="justify-self:end;width:100%;max-width:460px"><div class="frame">${founderPicture('jumoke-kolade-founder', `${founder.name} outdoors in a cream cardigan`, { loading: 'eager', fetchpriority: 'high', widths: [480, 800] })}</div></figure>
</div></section>

${showBio ? `<section class="section" style="padding-top:2rem"><div class="wrap grid-aside">${reveal('<span class="label">Biography</span>')}${reveal(`<p class="lead">${ph(founder.biography)}</p><p class="lead">${ph(founder.story)}</p>`)}</div></section>` : ''}

<section class="section tint" id="message"><div class="narrow">
  ${reveal('<span class="label">A message from our founder</span>')}
  <div class="prose reveal">${founder.messageHtml}</div>
  ${reveal(`<p class="quote" style="font-size:1.6rem;margin:2.5rem 0 .3rem">${esc(founder.signature)}</p><p class="soft">${esc(founder.role)}</p>`)}
</div></section>

<section class="section"><div class="wrap grid-aside">
  ${reveal('<span class="label">Her commitments</span>')}
  <ul class="list reveal">${founder.commitments.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
</div></section>

<section class="section"${noTop}><div class="wrap gallery reveal">
  <div class="frame">${founderPicture('jumoke-kolade-portrait', `Studio portrait of ${founder.name}`, { widths: [480, 800] })}</div>
  <div class="frame">${founderPicture('jumoke-kolade-gallery-1', `${founder.name} in a grey knitted vest and white shirt`, { widths: [480, 800] })}</div>
  <div class="frame">${founderPicture('jumoke-kolade-gallery-2', `Black and white photograph of ${founder.name}`, { widths: [480, 800] })}</div>
</div></section>
${band('Walk with us.', 'Volunteer, partner or give, and help build a foundation that serves communities with care and integrity.')}`;
  return { path: '/founder/', title: `Our founder, ${founder.name}`, description: `${founder.name} founded Starvira Impact Foundation. Read her message.`, body, ogImage: '/images/og/starvira-og-founder.png',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'Person', name: founder.name, jobTitle: founder.role, worksFor: { '@type': 'NGO', name: site.name }, image: ctx.baseUrl + '/images/founder/jumoke-kolade-founder-800.jpg' }] };
}

// =====================================================================
export function programmesIndex(ctx) {
  const { programmes } = ctx;
  const body = `
${intro({ label: 'Programmes', title: 'Practical programmes, designed with communities.', lead: 'Each programme removes a real barrier and has clear outcomes we can measure. All seven are in development, beginning in Akure and Akungba Akoko.', crumbs: [['/programmes/', 'Programmes']] })}
${PILLARS.map((pl, i) => `<section class="section${i % 2 ? '' : ' tint'}" id="${pl.key}"><div class="wrap grid-aside">
  ${reveal(`<span class="label">SDG ${pl.sdg} &middot; ${SDG[pl.sdg].name}</span><h2 style="font-size:clamp(1.7rem,2.6vw,2.3rem)">${pl.title}</h2><p class="soft">${pl.text}</p>`)}
  <ul class="index reveal">${programmes.filter((p) => p.pillar === pl.key).map(programmeRow).join('')}</ul>
</div></section>`).join('')}
${band('Sponsor a programme.', 'Fund a programme cycle with agreed goals and a final report on verified results.', { primary: ['/get-involved/#sponsor', 'Sponsor a programme'], secondary: ['/contact/', 'Talk to us'] })}`;
  return { path: '/programmes/', title: 'Programmes', description: 'Starvira programmes in education, health, livelihoods and equality, aligned with SDGs 1, 3, 4 and 5.', body };
}

export function programmeDetail(ctx, p) {
  const pillar = PILLARS.find((x) => x.key === p.pillar);
  const others = ctx.programmes.filter((x) => x.slug !== p.slug).slice(0, 4);
  const related = ctx.posts.filter((post) => (post.programmes || []).includes(p.slug)).slice(0, 3);
  const list = (arr) => `<ul class="list">${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const body = `
${intro({ label: pillar.title, title: esc(p.title), lead: esc(p.summary), crumbs: [['/programmes/', 'Programmes'], [`/programmes/${p.slug}/`, p.title]] })}
<section class="section"${noTop}><div class="wrap"><div class="banner reveal">${img(p.image, p.imageAlt || '', { loading: 'eager' })}</div></div></section>
<section class="section"${noTop}><div class="wrap detail">
  <div class="reveal">
    <h2>The challenge</h2><p class="lead">${esc(p.problem)}</p>
    <div class="prose">${p.html}</div>
    <h2>Who it serves</h2>${list(p.beneficiaries)}
    <h2>What we will do</h2>${list(p.activities)}
    <h2>Expected outcomes</h2>${list(p.outcomes)}
    <h2>How we will measure progress</h2>
    <div class="scroll"><table class="table"><caption class="visually-hidden">Indicators for ${esc(p.title)}</caption><thead><tr><th scope="col">Indicator</th><th scope="col">Measured by</th></tr></thead><tbody>${p.indicators.map((x) => `<tr><td>${esc(x.indicator)}</td><td>${esc(x.measure)}</td></tr>`).join('')}</tbody></table></div>
  </div>
  <aside class="aside reveal">
    <dl class="facts">
      <div><dt>Status</dt><dd>${esc(p.status)}</dd></div>
      <div><dt>Where</dt><dd>Akure and Akungba Akoko</dd></div>
      <div><dt>Global goals</dt><dd>${p.sdgs.map((n) => `SDG ${n}`).join(', ')}</dd></div>
      <div><dt>Partners we seek</dt><dd>${p.partners.slice(0, 3).map(esc).join('<br>')}</dd></div>
    </dl>
    <div class="actions"><a class="btn btn-solid btn-sm" href="/get-involved/#sponsor">Support this programme</a><a class="btn btn-line btn-sm" href="/get-involved/#volunteer">Volunteer</a></div>
  </aside>
</div></section>
${related.length ? `<section class="section tint"><div class="wrap"><div class="head-row reveal"><h2>Stories from this programme</h2></div><div class="stories">${related.map((x) => storyCard(x, ctx)).join('')}</div></div></section>` : ''}
<section class="section${related.length ? '' : ' tint'}"><div class="wrap"><div class="head-row reveal"><h2>More programmes</h2><a class="more" href="/programmes/">All programmes ${arrow}</a></div><ul class="index reveal">${others.map(programmeRow).join('')}</ul></div></section>`;
  return { path: `/programmes/${p.slug}/`, title: p.title, description: p.summary, body };
}

// =====================================================================
export function impact(ctx) {
  const { site, programmes } = ctx;
  const flow = [['Inputs', 'Funding, volunteers, partners and local knowledge'], ['Activities', 'Training, school support, health education and safe spaces'], ['Outputs', 'Children supported, sessions held, people trained'], ['Outcomes', 'Attendance, skills, healthier habits, confidence and income'], ['Impact', 'Families and communities with lasting opportunity and dignity']];
  const verified = site.impact.filter((m) => m.value);
  const body = `
${intro({ label: 'Impact and accountability', title: 'Measuring what matters, and reporting it honestly.', lead: 'We are building our monitoring and reporting from the very first day, so that every figure we publish can be trusted.', crumbs: [['/impact/', 'Impact']] })}

<section class="section" style="padding-top:2rem"><div class="wrap grid-aside">
  ${reveal('<span class="label">Theory of change</span>')}
  ${reveal(`<p class="statement">When people have access to education, health knowledge, skills and safe spaces, delivered with dignity and community ownership, families move from hardship towards stability and opportunity.</p>
  <ul class="index" style="margin-top:2.5rem">${flow.map(([t, d]) => `<li><div class="row"><span class="name">${t}</span><span class="desc">${d}</span><span></span></div></li>`).join('')}</ul>`)}
</div></section>

<section class="section tint"><div class="wrap grid-aside">
  ${reveal('<span class="label">Results</span>')}
  ${reveal(`${verified.length ? `<div class="cols cols-3">${verified.map((m) => `<div class="col"><p class="statement" style="margin:0 0 .4rem">${esc(m.value)}</p><p>${esc(m.label)}</p></div>`).join('')}</div>` : '<p class="statement">Our first verified results will be published here once programmes are underway. We would rather show nothing than show an estimate.</p>'}
    <p class="soft">We will report on ${site.impact.map((m) => esc(m.label.toLowerCase())).join(', ').replace(/, ([^,]*)$/, ' and $1')}.</p>`)}
</div></section>

<section class="section"><div class="wrap grid-aside">
  ${reveal('<span class="label">How we measure</span>')}
  <div class="cols cols-2 reveal">
    <div class="col"><h3>Baseline</h3><p>We record where participants start before each programme begins.</p></div>
    <div class="col"><h3>Monitoring</h3><p>Attendance, distribution and session records for every activity.</p></div>
    <div class="col"><h3>Follow-up</h3><p>Short surveys and partner records at three, six and twelve months.</p></div>
    <div class="col"><h3>Verification</h3><p>Figures are checked against source records and approved before publication.</p></div>
  </div>
</div></section>

<section class="section tint" id="indicators"><div class="wrap grid-aside">
  ${reveal('<span class="label">Indicators by programme</span>')}
  <div class="faq reveal">${programmes.map((p) => `<details><summary>${esc(p.title)}</summary><ul class="list" style="margin-top:1rem">${p.indicators.map((x) => `<li>${esc(x.indicator)}: ${esc(x.measure.charAt(0).toLowerCase() + x.measure.slice(1))}</li>`).join('')}</ul></details>`).join('')}</div>
</div></section>

<section class="section" id="accountability"><div class="wrap grid-aside">
  ${reveal('<span class="label">Financial transparency</span>')}
  ${reveal(`<ul class="list">
      <li>Funds held only in an account in the Foundation's registered name</li>
      <li>At least two authorised signatories for significant payments</li>
      <li>Restricted gifts recorded and spent on their agreed purpose</li>
      <li>Every donation acknowledged; receipts issued on request</li>
      <li>Annual accounts reviewed in line with Nigerian requirements, summarised in our annual report</li>
    </ul>`)}
</div></section>

<section class="section tint" id="reports"><div class="wrap grid-aside">
  ${reveal('<span class="label">Reports</span>')}
  ${reveal(site.reports && site.reports.length ? `<ul class="index">${site.reports.map((r) => `<li><a href="${esc(r.file)}"><span class="name">${esc(r.title)}</span><span class="desc">${esc(r.year || '')}</span><span class="go">${arrow}</span></a></li>`).join('')}</ul>` : '<p class="statement">Our first annual report will be published after our first full year of operation.</p>')}
</div></section>
${band('Partner with us on measurable change.', 'We agree indicators with every partner and report on verified results.', { primary: ['/get-involved/#partner', 'Become a partner'], secondary: ['/donate/', 'Donate'] })}`;
  return { path: '/impact/', title: 'Impact and accountability', description: 'Our theory of change, how we measure impact, and our commitments to financial transparency.', body };
}

// =====================================================================
export function storiesIndex(ctx, { posts, category = null, page = 1, pages = 1, basePath = '/stories/' }) {
  const { categories } = ctx;
  const title = category ? category.name : 'Stories';
  const chips = `<nav class="filters reveal" aria-label="Filter by category"><a href="/stories/"${!category ? ' aria-current="page"' : ''}>All</a>${categories.filter((c) => ctx.posts.some((p) => p.category === c.slug)).map((c) => `<a href="/stories/category/${c.slug}/"${category && category.slug === c.slug ? ' aria-current="page"' : ''}>${esc(c.name)}</a>`).join('')}</nav>`;
  const pager = pages > 1 ? `<nav class="pager" aria-label="Pagination">${page > 1 ? `<a class="more" href="${page === 2 ? basePath : `${basePath}page/${page - 1}/`}">Newer</a>` : ''}<span>Page ${page} of ${pages}</span>${page < pages ? `<a class="more" href="${basePath}page/${page + 1}/">Older</a>` : ''}</nav>` : '';
  const body = `
${intro({ label: 'Stories', title: esc(category ? category.name : 'News, stories and perspectives.'), lead: category ? '' : 'From our programmes, our partners and the communities we serve.', crumbs: category ? [['/stories/', 'Stories'], [basePath, category.name]] : [['/stories/', 'Stories']] })}
<section class="section"${noTop}><div class="wrap">${chips}${posts.length ? `<div class="stories">${posts.map((p) => storyCard(p, ctx)).join('')}</div>` : '<p class="soft">No stories in this category yet.</p>'}${pager}</div></section>`;
  return { path: page > 1 ? `${basePath}page/${page}/` : basePath, title: page > 1 ? `${title}, page ${page}` : title, description: 'News, stories and insights from Starvira Impact Foundation.', body };
}

export function storyPage(ctx, post) {
  const { site, categoryMap, authorMap, baseUrl } = ctx;
  const cat = categoryMap[post.category];
  const author = authorMap[post.author] || { name: post.author || site.name };
  const url = baseUrl + `/stories/${post.slug}/`;
  const enc = encodeURIComponent;
  const related = ctx.posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const body = `
<article>
  <header class="article-head"><div class="narrow">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/stories/">Stories</a>${cat ? `<span>/</span><a href="/stories/category/${cat.slug}/">${esc(cat.name)}</a>` : ''}</nav>
    <h1>${esc(post.title)}</h1>
    <p class="lead">${esc(post.summary)}</p>
    <p class="article-meta"><span>${esc(author.name)}</span><span><time datetime="${post.dateISO}">${formatDate(post.date)}</time></span><span>${post.readingTime} min read</span></p>
  </div></header>
  ${post.image ? `<div class="wrap" style="max-width:1000px;margin-bottom:3.5rem"><div class="banner">${img(post.image, post.imageAlt || '', { loading: 'eager' })}</div></div>` : ''}
  <div class="narrow">
    ${post.sample ? '<p class="note">This is a sample article that shows how stories will look. It describes intentions, not past events, and should be reviewed before launch.</p>' : ''}
    <div class="prose">${post.html}</div>
    ${post.gallery && post.gallery.length ? `<div class="gallery" style="margin-top:2rem">${post.gallery.map((g) => `<div class="frame"><img src="${esc(g)}" alt="" loading="lazy"></div>`).join('')}</div>` : ''}
    <div class="share"><span class="soft">Share</span>
      <a href="https://wa.me/?text=${enc(post.title + ' ' + url)}" target="_blank" rel="noopener">WhatsApp</a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${enc(url)}" target="_blank" rel="noopener">Facebook</a>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}" target="_blank" rel="noopener">LinkedIn</a>
      <a href="https://x.com/intent/post?text=${enc(post.title)}&amp;url=${enc(url)}" target="_blank" rel="noopener">X</a>
      <button type="button" data-share-copy>Copy link</button>
    </div>
  </div>
</article>
${related.length ? `<section class="section tint" style="margin-top:5rem"><div class="wrap"><div class="head-row reveal"><h2>More stories</h2><a class="more" href="/stories/">All stories ${arrow}</a></div><div class="stories">${related.map((p) => storyCard(p, ctx)).join('')}</div></div></section>` : ''}`;
  return { path: `/stories/${post.slug}/`, title: post.seoTitle || post.title, description: post.seoDescription || post.summary, body, ogType: 'article', ogImage: post.ogImage,
    jsonld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: post.title, datePublished: post.dateISO, author: { '@type': author.slug === 'starvira-team' ? 'Organization' : 'Person', name: author.name }, publisher: { '@type': 'Organization', name: site.name, logo: { '@type': 'ImageObject', url: baseUrl + '/icon-512.png' } }, mainEntityOfPage: url, description: post.summary }] };
}

// =====================================================================
export function getInvolved(ctx) {
  const sec = (id, label, title, text, formHtml, tint) => `<section class="section pathway${tint ? ' tint' : ''}" id="${id}"><div class="wrap grid-2">
  ${reveal(`<span class="label">${label}</span><h2 style="font-size:clamp(1.8rem,2.8vw,2.5rem)">${title}</h2><p class="lead">${text}</p>`)}
  ${reveal(formHtml)}</div></section>`;
  const body = `
${intro({ label: 'Get involved', title: 'Lend your light to the work.', lead: 'Give time, skills, resources or ideas. Choose the way that suits you.', crumbs: [['/get-involved/', 'Get involved']] })}
<div class="wrap" style="margin-top:-1.5rem;margin-bottom:3rem"><nav class="pathways" aria-label="Ways to get involved"><a href="#volunteer">Volunteer</a><a href="#partner">Partner</a><a href="#sponsor">Sponsor a programme</a><a href="#ideas">Share an idea</a><a href="/donate/">Donate</a></nav></div>
${sec('volunteer', 'Volunteer', 'Give your time and skills.', 'Every volunteer receives an induction and safeguarding briefing, with roles matched to your availability. Young people aged 16 and 17 are welcome with a parent or guardian\'s permission.', form(ctx, 'volunteer', `
  ${field('v-name', 'fullName', 'Full name', { required: true, autocomplete: 'name', max: 120 })}
  <div class="form-row">${field('v-email', 'email', 'Email', { type: 'email', required: true, autocomplete: 'email' })}${field('v-phone', 'phone', 'Telephone', { type: 'tel', required: true, autocomplete: 'tel', max: 30 })}</div>
  <div class="form-row">${field('v-loc', 'location', 'Where are you based?', { required: true, options: VOLUNTEER_LOCATIONS })}${field('v-avail', 'availability', 'Availability', { required: true, options: VOLUNTEER_AVAILABILITY })}</div>
  ${checkGroup('v-int', 'interests', 'Programmes that interest you', PROGRAMME_NAMES)}
  ${field('v-skills', 'skills', 'Skills and experience', { optional: true, rows: 3, max: 2000 })}
  ${checkbox('v-age', 'ageConfirm', 'I am 18 or older, or 16 or 17 with permission from a parent or guardian.', { required: true, msg: 'Please confirm your age or guardian permission.' })}
  ${consent('v-consent')}`, 'Register interest'), true)}
${sec('partner', 'Partner', 'Build impact together.', 'Programme sponsorship, CSR partnerships, grants, in-kind support and employee volunteering, all with agreed goals and transparent reporting.', form(ctx, 'partner', `
  <div class="form-row">${field('p-name', 'fullName', 'Full name', { required: true, autocomplete: 'name', max: 120 })}${field('p-org', 'organisation', 'Organisation', { required: true, autocomplete: 'organization', max: 150 })}</div>
  <div class="form-row">${field('p-email', 'email', 'Email', { type: 'email', required: true, autocomplete: 'email' })}${field('p-phone', 'phone', 'Telephone', { type: 'tel', optional: true, autocomplete: 'tel', max: 30 })}</div>
  ${field('p-type', 'partnershipType', 'Type of partnership', { required: true, options: PARTNERSHIP_TYPES })}
  ${field('p-msg', 'message', 'What would you like to achieve?', { required: true, rows: 4, min: 20, max: 5000 })}
  ${consent('p-consent')}`, 'Send enquiry'))}
${sec('sponsor', 'Sponsor a programme', 'Make a programme possible.', 'Fund a Back to School distribution, a Women Rise cohort or another programme. We agree goals and budget first, and report on verified results.', form(ctx, 'sponsor', `
  <div class="form-row">${field('s-name', 'fullName', 'Full name', { required: true, autocomplete: 'name', max: 120 })}${field('s-email', 'email', 'Email', { type: 'email', required: true, autocomplete: 'email' })}</div>
  <div class="form-row">${field('s-prog', 'programme', 'Programme', { required: true, options: PROGRAMME_NAMES })}${field('s-type', 'supportType', 'Type of support', { required: true, options: SUPPORT_TYPES })}</div>
  ${field('s-msg', 'message', 'Message', { optional: true, rows: 3, max: 5000 })}
  ${consent('s-consent')}`, 'Send interest'), true)}
${sec('ideas', 'Share an idea', 'Communities often see the answers first.', 'Tell us about a need, a project or a collaboration you think we should explore.', form(ctx, 'idea', `
  <div class="form-row">${field('i-name', 'fullName', 'Full name', { required: true, autocomplete: 'name', max: 120 })}${field('i-email', 'email', 'Email', { type: 'email', required: true, autocomplete: 'email' })}</div>
  ${field('i-title', 'ideaTitle', 'Your idea in a few words', { required: true, max: 160 })}
  ${field('i-msg', 'message', 'Tell us more', { required: true, rows: 4, min: 20, max: 5000 })}
  ${consent('i-consent')}`, 'Share idea'))}`;
  return { path: '/get-involved/', title: 'Get involved', description: 'Volunteer, partner, sponsor a programme or share an idea with Starvira Impact Foundation.', body, hasForm: true };
}

// =====================================================================
export function donate(ctx) {
  const { site } = ctx;
  const b = site.bank;
  const hasBank = known(b.accountNumber) && known(b.accountName) && known(b.bankName);
  const row = (k, v) => `<div><div><dt>${k}</dt><dd>${esc(v)}</dd></div><button class="copy-btn" type="button" data-copy="${esc(v)}" data-copy-label="${esc(k)}" aria-label="Copy ${esc(k)}">${icon('copy', 14)}<span>Copy</span></button></div>`;
  const online = site.donations.onlineGivingUrl;
  const giveEmail = known(site.contact.donationsEmail) ? site.contact.donationsEmail : (known(site.contact.email) ? site.contact.email : '');
  const body = `
${intro({ label: 'Donate', title: 'Your generosity becomes someone\'s opportunity.', lead: 'A school bag before term begins. A course that turns a skill into income. A health session that prevents illness. Every gift is acknowledged and used for its stated purpose.', crumbs: [['/donate/', 'Donate']] })}
<section class="section" style="padding-top:1rem"><div class="wrap grid-2">
  <div class="reveal">
    <div class="giving"><div class="bg">${img('/images/art/hero.svg', '')}</div>
      <h3>Give by bank transfer</h3>
      ${hasBank ? `<dl class="bank">${row('Bank', b.bankName)}${row('Account name', b.accountName)}${row('Account number', b.accountNumber)}${known(b.swift) ? row('Swift code', b.swift) : ''}</dl><p style="font-size:.92rem;margin:0">Please use your name as the reference${giveEmail ? ` and email ${esc(giveEmail)}` : ''} so we can thank you.</p>`
        : '<p style="margin:1rem 0 0">Our bank details will be published here once the Foundation\'s account is confirmed. To give in the meantime, please <a href="/contact/" style="color:#F7F1E6">contact us</a>. Never send money to an account that is not listed on this page.</p>'}
    </div>
    <div class="actions" style="margin-top:1.5rem">${online ? `<a class="btn btn-solid" href="${esc(online)}" target="_blank" rel="noopener">Give securely online</a>` : '<span class="btn btn-line" aria-disabled="true">Online giving coming soon</span>'}</div>
  </div>
  <div class="reveal">
    <span class="label">Ways to give</span>
    <ul class="index">
      <li><div class="row"><span class="name">One-time gift</span><span class="desc">By bank transfer, or online once enabled</span><span></span></div></li>
      <li><div class="row"><span class="name">Monthly giving</span><span class="desc">Steady support that lets us plan ahead</span><span></span></div></li>
      <li><a href="/get-involved/#sponsor"><span class="name">Sponsor a programme</span><span class="desc">Direct your gift to one programme</span><span class="go">${arrow}</span></a></li>
      <li><a href="/get-involved/#partner"><span class="name">Corporate giving</span><span class="desc">CSR partnerships and staff volunteering</span><span class="go">${arrow}</span></a></li>
      <li><a href="/contact/"><span class="name">In-kind support</span><span class="desc">Materials, venues or professional services</span><span class="go">${arrow}</span></a></li>
    </ul>
  </div>
</div></section>
<section class="section tint"><div class="narrow">
  <div class="head-row reveal"><h2>Questions</h2></div>
  <div class="faq reveal">
    <details><summary>How will my gift be used?</summary><p>Unrestricted gifts go where the need is greatest, including the essential costs of running programmes well. Restricted gifts are used only for the programme you choose. Our annual report summarises how funds were used.</p></details>
    <details><summary>Will I receive a receipt?</summary><p>Yes. We acknowledge every gift. ${giveEmail ? `Email ${esc(giveEmail)}` : 'Contact us'} with your name, amount, date and reference for a receipt.</p></details>
    <details><summary>Will my details be shared?</summary><p>No. We use your details only to process and acknowledge your gift and, if you agree, to update you. We name donors publicly only with permission.</p></details>
    <details><summary>Are donations tax deductible?</summary><p>We make no claim about tax deductibility. Please seek independent advice about your own tax position.</p></details>
    <details><summary>How do I know an account is genuine?</summary><p>Only the account on this page, held in the Foundation's registered name, belongs to us. If anyone asks you to pay into another or a personal account, please do not pay and contact us.</p></details>
  </div>
</div></section>`;
  return { path: '/donate/', title: 'Donate', description: 'Support Starvira Impact Foundation by bank transfer, programme sponsorship, corporate giving or in-kind donation.', body };
}

// =====================================================================
export function contact(ctx) {
  const { site } = ctx;
  const c = site.contact;
  const items = [];
  if (known(c.email)) items.push(['Email', `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`]);
  if (known(c.phone)) items.push(['Telephone', `<a href="tel:${esc(c.phone.replace(/\s/g, ''))}">${esc(c.phone)}</a>`]);
  c.offices.forEach((o) => { const a = ph(o.address); if (a) items.push([o.name, a + (o.mapUrl ? `<br><a href="${esc(o.mapUrl)}" target="_blank" rel="noopener">View map</a>` : '')]); });
  if (known(c.officeHours)) items.push(['Office hours', esc(c.officeHours)]);
  const body = `
${intro({ label: 'Contact', title: 'We would love to hear from you.', lead: 'Questions, partnerships, volunteering, media or ideas. Send a message and the right person will reply.', crumbs: [['/contact/', 'Contact']] })}
<section class="section" style="padding-top:1rem"><div class="wrap grid-2">
  ${reveal(form(ctx, 'contact', `
    <div class="form-row">${field('c-name', 'fullName', 'Full name', { required: true, autocomplete: 'name', max: 120 })}${field('c-email', 'email', 'Email', { type: 'email', required: true, autocomplete: 'email' })}</div>
    <div class="form-row">${field('c-phone', 'phone', 'Telephone', { type: 'tel', optional: true, autocomplete: 'tel', max: 30 })}${field('c-org', 'organisation', 'Organisation', { optional: true, autocomplete: 'organization', max: 150 })}</div>
    <div class="form-row">${field('c-cat', 'category', 'Reason for contacting us', { required: true, options: CONTACT_CATEGORIES })}${field('c-subject', 'subject', 'Subject', { required: true, max: 160 })}</div>
    ${field('c-msg', 'message', 'Message', { required: true, rows: 6, min: 20, max: 5000 })}
    ${consent('c-consent')}`, 'Send message'))}
  ${reveal(`<ul class="contact-list">${items.map(([k, v]) => `<li><span class="k">${esc(k)}</span>${v}</li>`).join('')}</ul>
    <p class="soft" style="margin-top:1.5rem">We aim to reply within five working days. If anyone is in immediate danger, please contact the police or emergency services first.</p>`)}
</div></section>`;
  return { path: '/contact/', title: 'Contact', description: 'Contact Starvira Impact Foundation in Akure and Akungba Akoko, Ondo State, Nigeria.', body, hasForm: true };
}

// =====================================================================
function policy(ctx, { path, title, lead, html }) {
  const body = `${intro({ label: 'Policies', title: esc(title), lead, crumbs: [[path, title]] })}<section class="section"${noTop}><div class="narrow prose">${html}<p class="soft" style="font-size:.92rem;margin-top:3rem">Last updated November 2026.</p></div></section>`;
  return { path, title, description: lead, body };
}
const contactLine = (ctx) => (known(ctx.site.contact.email) ? `at <a href="mailto:${esc(ctx.site.contact.email)}">${esc(ctx.site.contact.email)}</a>` : 'through our <a href="/contact/">contact page</a>');
export function privacyPage(ctx) {
  return policy(ctx, { path: '/privacy/', title: 'Privacy notice', lead: 'How we collect, use and protect personal information.', html: `
<p>${esc(ctx.site.name)} is committed to protecting personal data in line with the Nigeria Data Protection Act 2023.</p>
<h2>What we collect and why</h2><p>Details you send through our forms (such as your name, email, telephone and message), and information you share as a volunteer, partner, donor or participant. We use it to respond to you, manage volunteering, partnerships and donations, deliver and report on programmes using anonymised data, and meet legal and safeguarding duties.</p>
<h2>Cookies</h2><p>We use no advertising or tracking cookies. Your light or dark theme choice is stored only in your own browser.</p>
<h2>Sharing</h2><p>We never sell personal data. We share it only with trusted providers that help us operate, such as email delivery and hosting, or where the law requires.</p>
<h2>Children</h2><p>We collect children's information only when necessary and with a parent or guardian's consent. We never publish a child's image without written consent.</p>
<h2>Your rights</h2><p>You may ask to access, correct or delete your data, or withdraw consent, by contacting us ${contactLine(ctx)}. You may also complain to the Nigeria Data Protection Commission.</p>` });
}
export function safeguardingPage(ctx) {
  return policy(ctx, { path: '/safeguarding/', title: 'Safeguarding', lead: 'Our commitment to protecting children and vulnerable adults.', html: `
<p>We have a zero-tolerance approach to abuse, exploitation and harm. Everyone who works or volunteers with us shares responsibility for keeping people safe.</p>
<h2>Our commitments</h2><ul><li>Safer recruitment and vetting for roles involving children or vulnerable adults</li><li>Safeguarding induction and a signed code of conduct for all staff and volunteers</li><li>No unsupervised one-to-one contact with children</li><li>Written, informed consent before sharing any participant's image or story</li><li>Clear procedures for reporting concerns and referral to qualified services</li></ul>
<h2>Raising a concern</h2><p>If you are worried about anyone connected with our work, please contact us ${contactLine(ctx)} and mark your message "Safeguarding". If someone is in immediate danger, contact the police or emergency services first. Every concern is taken seriously and handled confidentially.</p>` });
}
export function accessibilityPage(ctx) {
  return policy(ctx, { path: '/accessibility/', title: 'Accessibility', lead: 'We want everyone to be able to use this website.', html: `
<p>We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA: clear headings and landmarks, keyboard access, labelled forms, tested colour contrast in light and dark themes, and respect for reduced-motion settings.</p>
<p>If anything is difficult to use, please tell us ${contactLine(ctx)} and we will do our best to help.</p>` });
}
export function notFound() {
  return { path: '/404.html', title: 'Page not found', noindex: true, body: `<section class="section error-page"><div class="narrow"><span class="label">Page not found</span><h1>This path has not been lit yet.</h1><p class="lead" style="margin-inline:auto">The page may have moved or no longer exists.</p><div class="actions" style="justify-content:center"><a class="btn btn-solid" href="/">Return home</a></div></div></section>` };
}

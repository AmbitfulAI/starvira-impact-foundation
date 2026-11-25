// Page templates. Each function returns a page object: { path, title, description, body, ... }.
import { icon } from './icons.mjs';
import { esc, ph, isPh, pageHero, sdgChip, SDG, founderPicture, illustration, formatDate } from './layout.mjs';
import { CONTACT_CATEGORIES, VOLUNTEER_LOCATIONS, VOLUNTEER_AVAILABILITY, PARTNERSHIP_TYPES, SUPPORT_TYPES, PROGRAMME_NAMES } from './forms.mjs';

export const PILLARS = [
  { key: 'education', title: 'Education and Youth Development', sdg: 4, image: '/images/illustrations/pillar-education.svg', alt: 'Illustration of an open book with a path of light rising to a star',
    text: 'Reducing barriers to learning and helping young people build the confidence and skills to succeed.',
    items: ['Back to School Project', 'Reading clubs and community learning', 'Mentorship and tutoring', 'Digital literacy and technology access', 'Support for out-of-school children', 'Youth leadership and career development'] },
  { key: 'health', title: 'Health and Well-being', sdg: 3, image: '/images/illustrations/pillar-health.svg', alt: 'Illustration of a heart with leaves between two people',
    text: 'Community health education, prevention and wellbeing awareness, with links to qualified care.',
    items: ['Healthy Living Outreach', 'Community health awareness', 'Nutrition and preventive health education', 'Mental health and emotional wellbeing awareness', 'Maternal and child health education', 'Referrals to appropriate healthcare providers'] },
  { key: 'livelihoods', title: 'Economic Empowerment and Livelihoods', sdg: 1, image: '/images/illustrations/pillar-livelihoods.svg', alt: 'Illustration of rising steps with a seedling and a figure',
    text: 'Practical pathways to income, financial independence and resilience for women, youth and families.',
    items: ['Skills and Livelihood Training', 'Entrepreneurship support', 'Financial literacy workshops', 'Vocational development', 'Women Rise economic empowerment', 'Community Empowerment Drives'] },
  { key: 'equality', title: 'Equality, Protection and Community Inclusion', sdg: 5, image: '/images/illustrations/pillar-equality.svg', alt: 'Illustration of a circle of people around a gold star',
    text: 'Dignity, equal opportunity and safety for girls and women, with communities as active partners.',
    items: ['Girls and Women Safe Space', 'Leadership and confidence development', 'Gender equality education', 'Community sensitisation', 'Protection awareness and referral pathways', 'Volunteer and Youth Engagement'] },
];

const VALUES = [
  ['heart', 'Compassion', 'We listen, understand and respond with dignity, kindness and empathy. People are never reduced to their circumstances.'],
  ['shield', 'Integrity', 'We are honest, transparent and accountable in how we work, how we use resources and how we report results.'],
  ['sprout', 'Empowerment', 'We equip people with the knowledge, confidence and resources to build futures they own.'],
  ['scale', 'Equality', 'Opportunity and dignity should never depend on gender, disability, income or social background.'],
  ['star', 'Excellence', 'We pursue thoughtful, effective and measurable solutions, and we keep learning how to do better.'],
  ['users', 'Community', 'We work alongside communities, valuing local knowledge, participation and ownership as the foundation of lasting change.'],
];

const arrow = icon('arrow', 18, ' class="arrow"');
const hp = '<div class="hp" aria-hidden="true"><label>Leave this empty<input type="text" name="company_url" tabindex="-1" autocomplete="off"></label></div>';

// ---------- Form helpers ----------
function field(id, name, label, { type = 'text', required = false, optional = false, hint = '', autocomplete = '', min = 0, max = 0, rows = 0, options = null, placeholder = '' } = {}) {
  const desc = [hint ? `${id}-hint` : '', `${id}-error`].filter(Boolean).join(' ');
  const req = required ? ' required' : '';
  const lab = `<label for="${id}">${esc(label)}${optional ? ' <span class="optional">(optional)</span>' : ''}</label>`;
  let control;
  if (options) {
    control = `<select id="${id}" name="${name}"${req} aria-describedby="${desc}"><option value="">Please choose</option>${options.map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
  } else if (rows) {
    control = `<textarea id="${id}" name="${name}" rows="${rows}"${req}${min ? ` minlength="${min}"` : ''}${max ? ` maxlength="${max}"` : ''} aria-describedby="${desc}"${placeholder ? ` placeholder="${esc(placeholder)}"` : ''}></textarea>`;
  } else {
    control = `<input id="${id}" name="${name}" type="${type}"${req}${autocomplete ? ` autocomplete="${autocomplete}"` : ''}${max ? ` maxlength="${max}"` : ''} aria-describedby="${desc}"${placeholder ? ` placeholder="${esc(placeholder)}"` : ''}>`;
  }
  return `<div class="field">${lab}${hint ? `<span class="hint" id="${id}-hint">${hint}</span>` : ''}${control}<span class="error" id="${id}-error"></span></div>`;
}
function checkbox(id, name, labelHtml, { required = false, msg = '' } = {}) {
  return `<div class="field"><label class="check" for="${id}"><input type="checkbox" id="${id}" name="${name}" value="yes"${required ? ' required' : ''}${msg ? ` data-msg="${esc(msg)}"` : ''} aria-describedby="${id}-error"><span>${labelHtml}</span></label><span class="error" id="${id}-error"></span></div>`;
}
function checkGroup(prefix, name, legend, options) {
  return `<fieldset class="field"><legend>${esc(legend)} <span class="optional">(optional)</span></legend><div class="checks checks-grid">${options.map((o, i) => `<label class="check" for="${prefix}-${i}"><input type="checkbox" id="${prefix}-${i}" name="${name}" value="${esc(o)}"><span>${esc(o)}</span></label>`).join('')}</div></fieldset>`;
}
const consent = (id) => checkbox(id, 'consent', 'I agree that Starvira Impact Foundation may use the information I have provided to respond to my submission, as described in the <a href="/privacy/">privacy notice</a>.', { required: true, msg: 'Please confirm you agree so we can respond.' });
function formShell(ctx, type, inner, submitLabel) {
  const { site } = ctx;
  const ts = site.forms?.turnstileSiteKey ? `<div class="cf-turnstile" data-sitekey="${esc(site.forms.turnstileSiteKey)}"></div>` : '';
  const fallback = isPh(site.contact.email) ? '' : site.contact.email;
  return `<form class="form" data-form action="${esc(site.forms.endpoint)}" method="post" data-fallback-email="${esc(fallback)}">
<input type="hidden" name="formType" value="${type}">${hp}
${inner}
${ts}
<div class="form-status" aria-live="polite"></div>
<div><button class="btn btn-primary" type="submit"><span class="spinner" aria-hidden="true"></span>${esc(submitLabel)} ${arrow}</button></div>
<p class="muted" style="font-size:.86rem;margin:0">Fields without an "optional" label are required. We never sell or share your information.</p>
</form>`;
}

// ---------- Shared fragments ----------
export function programmeCard(p, { headingLevel = 3 } = {}) {
  const h = `h${headingLevel}`;
  return `<a class="card pillar-card programme-card reveal" href="/programmes/${p.slug}/">
  <div class="media">${illustration(p.image, p.imageAlt)}</div>
  <div class="body">
    <div class="meta"><span class="tag tag-status">${esc(p.status)}</span>${p.sdgs.map((n) => `<span class="tag">SDG ${n}</span>`).join('')}</div>
    <${h}>${esc(p.title)}</${h}>
    <p>${esc(p.summary)}</p>
    <span class="text-link">Explore programme ${arrow}</span>
  </div>
</a>`;
}

export function storyCard(post, ctx) {
  const cat = ctx.categoryMap[post.category];
  return `<a class="card story-card reveal" href="/stories/${post.slug}/">
  <div class="media">${post.image ? illustration(post.image, post.imageAlt || '') : ''}</div>
  <div class="body">
    <div class="meta" style="margin:0;padding:0">${cat ? `<span class="tag">${esc(cat.name)}</span>` : ''}${post.sample ? '<span class="tag tag-sample">Sample</span>' : ''}</div>
    <h3>${esc(post.title)}</h3>
    <p class="excerpt">${esc(post.summary)}</p>
    <div class="meta"><time datetime="${post.dateISO}">${formatDate(post.date)}</time><span>${post.readingTime} min read</span></div>
  </div>
</a>`;
}

function impactCards(ctx, limit) {
  const items = ctx.site.impact.slice(0, limit || ctx.site.impact.length);
  return items.map((m, i) => `<div class="card impact-card reveal" data-delay="${i % 3}">
  ${m.value ? `<div class="value-num">${esc(m.value)}</div>` : `<div class="value-pending">${icon('clock', 14)} Data pending</div>`}
  <p class="label">${esc(m.label)}</p>
  <p class="note">${esc(m.note)}</p>
</div>`).join('');
}

function donateBand(title = 'Every contribution lights a path.', text = 'Your support helps children return to school, equips women with skills and income, and brings health knowledge to families who need it. Every gift is acknowledged, and we report openly on how support is used.') {
  return `<section class="section-tight"><div class="container"><div class="band reveal">
  <img class="band-art" src="/images/brand/symbol-on-dark.svg" alt="" aria-hidden="true">
  <div class="band-grid">
    <div><p class="eyebrow">Support our mission</p><h2>${title}</h2><p class="lead mb-0">${text}</p></div>
    <div class="btn-row" style="justify-content:flex-end"><a class="btn btn-gold" href="/donate/">Donate now ${arrow}</a><a class="btn btn-ghost-light" href="/get-involved/#partner">Partner with us</a></div>
  </div>
</div></div></section>`;
}

const ngoJsonLd = (ctx) => ({
  '@context': 'https://schema.org', '@type': 'NGO', name: ctx.site.name, alternateName: ctx.site.abbreviation, url: ctx.baseUrl + '/',
  logo: ctx.baseUrl + '/icon-512.png', slogan: ctx.site.slogan, description: ctx.site.description,
  areaServed: [{ '@type': 'City', name: 'Akure' }, { '@type': 'Place', name: 'Akungba Akoko' }, { '@type': 'State', name: 'Ondo State, Nigeria' }],
  founder: { '@type': 'Person', name: ctx.site.founder.name },
  ...(isPh(ctx.site.contact.email) ? {} : { email: ctx.site.contact.email }),
  sameAs: ctx.site.social.filter((s) => s.url).map((s) => s.url),
});

// =====================================================================
// HOME
// =====================================================================
export function home(ctx) {
  const { site, programmes, posts, founder } = ctx;
  const featured = ['back-to-school', 'women-rise', 'healthy-living'].map((s) => programmes.find((p) => p.slug === s)).filter(Boolean);
  const latest = posts.slice(0, 3);
  const body = `
<section class="hero">
  <div class="container hero-grid">
    <div class="reveal">
      <p class="eyebrow">Starvira Impact Foundation &middot; Ondo State, Nigeria</p>
      <h1>Every life deserves the chance to <em>shine.</em></h1>
      <p class="lead">From classrooms to communities, Starvira Impact Foundation is creating pathways to education, well-being, equality and lasting opportunity for underserved families across Ondo State, Nigeria.</p>
      <div class="btn-row"><a class="btn btn-primary" href="/donate/">Support our mission ${arrow}</a><a class="btn btn-secondary" href="/programmes/">Discover our work</a></div>
      <div class="hero-meta"><span>${icon('pin', 18)} Akure and Akungba Akoko</span><span>${icon('target', 18)} Four impact pillars</span><span>${icon('globe', 18)} Aligned with the UN SDGs</span></div>
    </div>
    <div class="hero-art reveal" data-delay="1">
      <div class="orbit" style="inset:-6% -8% 18% 8%"></div>
      <div class="arch">${illustration('/images/illustrations/hero.svg', 'Illustration of three people beneath a path of light rising towards a gold star', { loading: 'eager', w: 800, h: 1000 })}</div>
      <div class="hero-badge"><strong>Lighting paths.</strong>Lifting lives. Creating impact that reaches the next generation.</div>
    </div>
  </div>
</section>

<section class="section-tight">
  <div class="container split">
    <div class="reveal">
      <p class="eyebrow">Our purpose</p>
      <h2>Opportunity, dignity and the support to shape your own future.</h2>
    </div>
    <div class="reveal" data-delay="1">
      <p class="lead">We work with children, young people, women, vulnerable households and local communities to address connected challenges in education, health, poverty and gender equality.</p>
      <p>Our approach rests on a simple conviction: lasting progress begins when people are given opportunity, resources, dignity and support. We aim to help individuals and families move beyond immediate hardship towards confidence, independence and well-being.</p>
      <a class="text-link" href="/about/">Read our story ${arrow}</a>
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-head center reveal"><p class="eyebrow">Four impact pillars</p><h2>Where we focus our work</h2><p class="lead">Each pillar is aligned with a United Nations Sustainable Development Goal, and each connects to the others. A healthy child learns better. An earning mother keeps children in school.</p></div>
    <div class="grid grid-4">
      ${PILLARS.map((p, i) => `<a class="card pillar-card reveal" data-delay="${i}" href="/programmes/#${p.key}"><div class="media">${illustration(p.image, p.alt)}</div><div class="body"><span class="sdg">SDG ${p.sdg}: ${SDG[p.sdg].name}</span><h3>${p.title}</h3><p>${p.text}</p><span class="text-link">See programmes ${arrow}</span></div></a>`).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="split" style="align-items:end;margin-bottom:3rem">
      <div class="reveal"><p class="eyebrow">Featured programmes</p><h2 class="mb-0">Practical programmes, designed with communities.</h2></div>
      <div class="reveal" data-delay="1"><p class="muted">Our programmes are in development, beginning in Akure and Akungba Akoko. Each one has clear goals and indicators so that progress can be measured honestly.</p><a class="text-link" href="/programmes/">View all seven programmes ${arrow}</a></div>
    </div>
    <div class="grid grid-3">${featured.map((p) => programmeCard(p)).join('')}</div>
  </div>
</section>

<section class="section section-alt">
  <div class="container split top">
    <div class="reveal">
      <p class="eyebrow">Why our work matters</p>
      <h2>Beyond short-term charity, towards lasting change.</h2>
      <p class="lead">Hardship is rarely caused by one thing. A missed school term, a preventable illness and an unstable income are often connected. So our response is connected too.</p>
    </div>
    <div class="steps reveal" data-delay="1">
      <div class="step"><div><h3>We listen first</h3><p>Communities help define priorities. Local knowledge shapes every programme we design.</p></div></div>
      <div class="step"><div><h3>We remove practical barriers</h3><p>From school materials to skills training, we address the obstacles that stand between people and opportunity.</p></div></div>
      <div class="step"><div><h3>We build lasting capability</h3><p>Knowledge, confidence and networks stay with people long after a programme ends.</p></div></div>
      <div class="step"><div><h3>We measure and report honestly</h3><p>Clear indicators, consent-based stories and open reporting keep us accountable to the people we serve and those who support us.</p></div></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container founder-feature">
    <figure class="founder-photo reveal m-0" style="margin:0">
      <span class="ring" aria-hidden="true"></span>
      <div class="arch">${founderPicture('jumoke-kolade-portrait', `Portrait of ${site.founder.name}, founder of Starvira Impact Foundation`)}</div>
      <figcaption>${esc(site.founder.photoCredit)}</figcaption>
    </figure>
    <div class="reveal" data-delay="1">
      <p class="eyebrow">Meet our founder</p>
      <h2>${esc(founder.name)}</h2>
      <p class="muted" style="margin-top:-.6rem;font-weight:500">${esc(founder.role)}</p>
      <p class="lead">${esc(founder.intro)}</p>
      <blockquote class="quote" style="font-size:clamp(1.25rem,1vw + 1rem,1.6rem);margin:2rem 0">Where a person starts in life should not decide how far they can go.</blockquote>
      <a class="btn btn-secondary" href="/founder/">Read the founder's message ${arrow}</a>
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-head center reveal"><p class="eyebrow">Community stories</p><h2>Stories told with dignity and consent.</h2><p class="lead">As our programmes begin, we will share the progress of the people and communities we work with, in their own words wherever possible, and only with their informed permission.</p></div>
    <div class="grid grid-3">
      <div class="card reveal"><div class="icon">${icon('eye', 24)}</div><h3>Aspiration, not pity</h3><p class="muted">We show people as capable and hopeful, never as helpless. Images of hardship are not used to raise funds.</p></div>
      <div class="card reveal" data-delay="1"><div class="icon">${icon('shield', 24)}</div><h3>Consent first</h3><p class="muted">Every story and photograph is shared with informed consent. For children, written consent from a parent or guardian is required.</p></div>
      <div class="card reveal" data-delay="2"><div class="icon">${icon('chart', 24)}</div><h3>Evidence alongside stories</h3><p class="muted">Stories are paired with verified data, so that what we share reflects what is really happening.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="split" style="align-items:end;margin-bottom:3rem">
      <div class="reveal"><p class="eyebrow">Impact indicators</p><h2 class="mb-0">What we will measure.</h2></div>
      <div class="reveal" data-delay="1"><p class="muted">We only publish figures that have been verified. These indicators will be updated as our first programmes are delivered.</p><a class="text-link" href="/impact/">Our impact framework ${arrow}</a></div>
    </div>
    <div class="grid grid-3">${impactCards(ctx, 6)}</div>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">Get involved</p><h2>There is a place for you in this work.</h2></div>
    <div class="grid grid-2">
      <div class="card reveal"><div class="icon">${icon('hand', 24)}</div><h3>Volunteer your time</h3><p class="muted">Help on distribution days, mentor a young person, facilitate a session in your area of expertise, or help us tell our story. Every volunteer receives an induction and safeguarding briefing.</p><a class="btn btn-primary" href="/get-involved/#volunteer">Become a volunteer ${arrow}</a></div>
      <div class="card reveal" data-delay="1"><div class="icon">${icon('handshake', 24)}</div><h3>Partner with us</h3><p class="muted">Companies, schools, institutions and community organisations can sponsor programmes, provide in-kind support, engage staff volunteers or co-design initiatives with us.</p><a class="btn btn-secondary" href="/get-involved/#partner">Explore partnerships ${arrow}</a></div>
    </div>
  </div>
</section>

${latest.length ? `<section class="section">
  <div class="container">
    <div class="split" style="align-items:end;margin-bottom:3rem">
      <div class="reveal"><p class="eyebrow">Latest from our blog</p><h2 class="mb-0">News, insights and perspectives.</h2></div>
      <div class="reveal" data-delay="1"><a class="text-link" href="/stories/">All stories ${arrow}</a></div>
    </div>
    <div class="grid grid-3">${latest.map((p) => storyCard(p, ctx)).join('')}</div>
  </div>
</section>` : ''}

${donateBand()}
`;
  return { path: '/', title: site.name, description: site.description, body, jsonld: [ngoJsonLd(ctx), { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: ctx.baseUrl + '/' }] };
}

// =====================================================================
// ABOUT
// =====================================================================
export function about(ctx) {
  const { site } = ctx;
  const body = `
${pageHero({ eyebrow: 'About us', title: 'A community-led foundation creating pathways to dignity, opportunity and lasting change.', lead: 'Starvira Impact Foundation works with children, young people, women and families in Ondo State, Nigeria, to remove barriers to education, health, equality and sustainable livelihoods.', crumbs: [['/about/', 'About us']] })}

<section class="section">
  <div class="container split top">
    <div class="reveal"><p class="eyebrow">Our story</p><h2>Starting close to home, with an ambition to grow.</h2></div>
    <div class="reveal" data-delay="1">
      <p class="lead">Starvira Impact Foundation was established to expand opportunity and improve the well-being of underserved individuals and families.</p>
      <p>We begin in Akure and Akungba Akoko, two communities in Ondo State with rich potential and real needs. Starting close to home allows us to listen carefully, build trust and learn what works before we expand.</p>
      <p>Our long-term ambition is to develop practical, community-led models that can be adapted for other communities across Nigeria. We intend to earn that growth through careful delivery, honest measurement and strong partnerships.</p>
    </div>
  </div>
</section>

<section class="section section-alt" id="name">
  <div class="container">
    <div class="section-head center reveal"><p class="eyebrow">The meaning behind Starvira</p><h2>Two ideas, one belief.</h2></div>
    <div class="grid grid-2" style="max-width:980px;margin-inline:auto">
      <div class="card reveal"><div class="icon">${icon('star', 24)}</div><h3>Star</h3><p class="muted">Light, hope, guidance and possibility. A star is a reminder of the potential within every human being, and of the light that helps people find their way.</p></div>
      <div class="card reveal" data-delay="1"><div class="icon">${icon('sparkle', 24)}</div><h3>Vira</h3><p class="muted">For us, Vira stands for faith, truth, courage and the determination to overcome adversity. It describes the strength we see in the communities we serve.</p></div>
    </div>
    <p class="lead center reveal" style="margin:3rem auto 0;max-width:60ch">Together, Starvira expresses our belief that every life carries potential worth recognising, protecting and nurturing.</p>
  </div>
</section>

<section class="section">
  <div class="container grid grid-2">
    <div class="card reveal" style="background:var(--band-bg);border-color:transparent;color:var(--band-text)"><p class="eyebrow" style="color:var(--gold-soft)">Our vision</p><p class="quote" style="color:var(--band-text);font-size:clamp(1.35rem,1vw + 1rem,1.8rem)">A world where every person, regardless of circumstance, has the opportunity to thrive and fulfil their potential.</p></div>
    <div class="card reveal" data-delay="1"><p class="eyebrow">Our mission</p><p class="quote" style="font-size:clamp(1.35rem,1vw + 1rem,1.8rem)">To light paths and lift lives by advancing education, health, equality and economic empowerment through compassionate, community-led programmes that create lasting, measurable impact.</p></div>
  </div>
  <div class="container"><p class="center reveal mt-3"><span class="divider-star">${icon('star', 18)}</span></p><p class="center reveal" style="font-family:var(--font-display);font-size:1.4rem;color:var(--heading)">Every life matters. Every opportunity counts. Every community deserves a chance to thrive.</p><p class="center muted reveal">Our brand promise</p></div>
</section>

<section class="section section-alt" id="values">
  <div class="container split top">
    <div class="reveal"><p class="eyebrow">Our values</p><h2>The principles that guide every decision.</h2><p class="lead">Our values are not decoration. They shape how we select beneficiaries, choose partners, spend money and tell stories.</p></div>
    <div class="reveal" data-delay="1">${VALUES.map(([ic, t, d]) => `<div class="value"><h3>${icon(ic, 22)}${t}</h3><p>${d}</p></div>`).join('')}</div>
  </div>
</section>

<section class="section" id="approach">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">Our approach</p><h2>What makes Starvira different.</h2><p class="lead">Many organisations offer short-term relief. Relief matters, but on its own it rarely changes the conditions that cause hardship. We aim to combine immediate support with lasting capability.</p></div>
    <div class="grid grid-3">
      <div class="card reveal"><div class="icon">${icon('users', 24)}</div><h3>Community ownership</h3><p class="muted">Communities help identify needs, shape programmes and judge whether they are working.</p></div>
      <div class="card reveal" data-delay="1"><div class="icon">${icon('sprout', 24)}</div><h3>Long-term empowerment</h3><p class="muted">We invest in skills, confidence and networks that remain with people after a programme ends.</p></div>
      <div class="card reveal" data-delay="2"><div class="icon">${icon('chart', 24)}</div><h3>Measurable outcomes</h3><p class="muted">Every programme has clear indicators, and we report results openly, including lessons learned.</p></div>
      <div class="card reveal"><div class="icon">${icon('link', 24)}</div><h3>Connected solutions</h3><p class="muted">Education, health, income and equality are linked, so our programmes are designed to reinforce one another.</p></div>
      <div class="card reveal" data-delay="1"><div class="icon">${icon('handshake', 24)}</div><h3>Strong partnerships</h3><p class="muted">We work with schools, health providers, businesses and public institutions, rather than duplicating what already works.</p></div>
      <div class="card reveal" data-delay="2"><div class="icon">${icon('shield', 24)}</div><h3>Safeguarding and dignity</h3><p class="muted">Children and vulnerable adults are protected by clear policies, trained volunteers and consent-based communication.</p></div>
    </div>
  </div>
</section>

<section class="section section-alt" id="communities">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">Our communities</p><h2>Rooted in Ondo State.</h2></div>
    <div class="grid grid-2">
      <div class="card reveal"><div class="icon">${icon('pin', 24)}</div><h3>Akure</h3><p class="muted">The state capital and a growing urban centre, where many families face rising costs of education, health care and daily living. Our Akure work will focus on urban and peri-urban neighbourhoods with the greatest need.</p></div>
      <div class="card reveal" data-delay="1"><div class="icon">${icon('pin', 24)}</div><h3>Akungba Akoko</h3><p class="muted">A university town in the Akoko region, with surrounding rural communities. Here our work will connect young people, students and residents to learning, skills and community projects.</p></div>
    </div>
  </div>
</section>

<section class="section" id="sdgs">
  <div class="container split">
    <div class="reveal"><p class="eyebrow">Sustainable Development Goals</p><h2>Local action, aligned with global goals.</h2><p class="lead">Our four pillars align with four of the United Nations Sustainable Development Goals. This helps partners see how our work contributes to shared global priorities.</p></div>
    <div class="sdg-list reveal" data-delay="1" style="flex-direction:column;align-items:flex-start">${[4, 3, 1, 5].map(sdgChip).join('')}</div>
  </div>
</section>

<section class="section section-alt" id="transparency">
  <div class="container split top">
    <div class="reveal"><p class="eyebrow">Transparency and accountability</p><h2>Our commitment to the people who trust us.</h2></div>
    <div class="reveal" data-delay="1">
      <ul class="check-list">
        <li>We will publish annual reports covering activities, results and finances once our first full year of operation is complete.</li>
        <li>Donations are recorded, acknowledged and used for the purposes described. Restricted gifts are tracked separately.</li>
        <li>Financial controls require more than one person to approve significant spending.</li>
        <li>Board members and staff declare conflicts of interest.</li>
        <li>We follow written safeguarding, privacy and code of conduct policies.</li>
        <li>We publish only verified impact figures, and we say clearly when data is not yet available.</li>
      </ul>
      <p class="muted">Registration: ${ph(site.registration.status)} ${ph(site.registration.number)}</p>
      <a class="text-link" href="/impact/#accountability">See our accountability framework ${arrow}</a>
    </div>
  </div>
</section>
${donateBand('Help us build something that lasts.')}
`;
  return { path: '/about/', title: 'About us', description: 'Our story, the meaning behind Starvira, our mission, vision, values and approach to community-led change in Ondo State, Nigeria.', body };
}

// =====================================================================
// FOUNDER
// =====================================================================
export function founderPage(ctx) {
  const { site, founder } = ctx;
  const li = founder.linkedin || site.founder.linkedin;
  const body = `
<section class="page-hero">
  <div class="container founder-feature founder-hero-grid">
    <div>
      <nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">Our founder</li></ol></nav>
      <p class="eyebrow">Meet our founder</p>
      <h1>${esc(founder.name)}</h1>
      <p style="font-weight:600;color:var(--accent-text);margin-top:-.4rem">${esc(founder.role)}, ${esc(site.name)}</p>
      <p class="lead">${esc(founder.intro)}</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="#message">Read her message ${arrow}</a>
        ${li ? `<a class="btn btn-secondary" href="${esc(li)}" target="_blank" rel="noopener">${icon('linkedin', 18)} LinkedIn</a>` : `<span class="btn btn-secondary" aria-disabled="true" title="LinkedIn profile link to be added">${icon('linkedin', 18)} LinkedIn profile coming soon</span>`}
      </div>
    </div>
    <figure class="founder-photo" style="margin:0 auto">
      <span class="ring" aria-hidden="true"></span>
      <div class="arch">${founderPicture('jumoke-kolade-founder', `${founder.name} smiling outdoors in a cream cardigan and tie`, { loading: 'eager', fetchpriority: 'high', widths: [480, 800] })}</div>
    </figure>
  </div>
</section>

<section class="section">
  <div class="container detail-grid">
    <div>
      <div class="reveal"><p class="eyebrow">Biography</p><h2>About ${esc(founder.name.split(' ')[0])}</h2><p class="lead">${ph(founder.biography)}</p></div>
      <div class="reveal mt-3"><p class="eyebrow">Why Starvira</p><h2>The story behind the Foundation</h2><p class="lead">${ph(founder.story)}</p></div>
    </div>
    <aside class="detail-aside">
      <div class="card"><h3 style="font-size:1.2rem">Her commitments</h3><ul class="check-list mb-0">${founder.commitments.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>
    </aside>
  </div>
</section>

<section class="section section-alt" id="message">
  <div class="container-narrow">
    <p class="eyebrow reveal">A message from our founder</p>
    <div class="prose reveal">${founder.messageHtml}</div>
    <p class="signature reveal">${esc(founder.signature)}</p>
    <p class="muted reveal">${esc(founder.role)}</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">Gallery</p><h2>Beyond the title.</h2></div>
    <div class="grid grid-3">
      <figure class="reveal" style="margin:0"><div class="arch" style="aspect-ratio:4/5">${founderPicture('jumoke-kolade-portrait', `Studio portrait of ${founder.name}`, { widths: [480, 800] })}</div><figcaption class="muted center" style="font-size:.82rem;margin-top:.6rem">${esc(site.founder.photoCredit)}</figcaption></figure>
      <figure class="reveal" data-delay="1" style="margin:0"><div class="arch" style="aspect-ratio:4/5">${founderPicture('jumoke-kolade-gallery-1', `${founder.name} standing outside in a grey knitted vest and white shirt`, { widths: [480, 800] })}</div></figure>
      <figure class="reveal" data-delay="2" style="margin:0"><div class="arch" style="aspect-ratio:4/5">${founderPicture('jumoke-kolade-gallery-2', `Black and white photograph of ${founder.name} wearing a beret`, { widths: [480, 800] })}</div></figure>
    </div>
  </div>
</section>
${donateBand('Walk with us.', 'Volunteer, partner or give. However you choose to take part, you will be helping to build a foundation that serves communities with care and integrity.')}
`;
  return { path: '/founder/', title: `Meet our founder, ${founder.name}`, description: `${founder.name} is the founder and chief executive of Starvira Impact Foundation. Read her story and message.`, body, ogImage: '/images/og/starvira-og-founder.png',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'Person', name: founder.name, jobTitle: founder.role, worksFor: { '@type': 'NGO', name: site.name }, image: ctx.baseUrl + '/images/founder/jumoke-kolade-founder-800.jpg' }] };
}

// =====================================================================
// PROGRAMMES
// =====================================================================
export function programmesIndex(ctx) {
  const { programmes } = ctx;
  const byPillar = (k) => programmes.filter((p) => p.pillar === k);
  const body = `
${pageHero({ eyebrow: 'Our programmes', title: 'Seven programmes. Four pillars. One purpose.', lead: 'Every programme addresses a real barrier, involves the community, and has clear outcomes we can measure. Our programmes are currently in development, starting in Akure and Akungba Akoko.', crumbs: [['/programmes/', 'Programmes']] })}
<section class="section-tight">
  <div class="container">
    <div class="notice reveal">${icon('info', 20)}<p><strong>Programme status.</strong> Each programme is labelled with its current status: Planned, Pilot or Active. We update these labels as programmes launch, so you always know what is underway and what is being prepared.</p></div>
  </div>
</section>
${PILLARS.map((pl, i) => `
<section class="section${i % 2 ? '' : ' section-alt'}" id="${pl.key}">
  <div class="container">
    <div class="split" style="margin-bottom:3rem">
      <div class="reveal">
        <p class="eyebrow">Pillar ${i + 1} &middot; SDG ${pl.sdg}: ${SDG[pl.sdg].name}</p>
        <h2>${pl.title}</h2>
        <p class="lead">${pl.text}</p>
      </div>
      <div class="reveal" data-delay="1"><p class="muted" style="font-weight:600;margin-bottom:.6rem">Areas of work</p><ul class="check-list mb-0">${pl.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    </div>
    <div class="grid grid-3">${byPillar(pl.key).map((p) => programmeCard(p)).join('')}</div>
  </div>
</section>`).join('')}
${donateBand('Sponsor a programme.', 'Companies, institutions and individuals can support a specific programme. We will agree clear goals with you and report on progress.')}
`;
  return { path: '/programmes/', title: 'Our programmes', description: 'Starvira programmes in education, health, economic empowerment and equality, aligned with SDGs 1, 3, 4 and 5.', body };
}

export function programmeDetail(ctx, p) {
  const pillar = PILLARS.find((x) => x.key === p.pillar);
  const related = ctx.posts.filter((post) => (post.programmes || []).includes(p.slug)).slice(0, 3);
  const others = ctx.programmes.filter((x) => x.slug !== p.slug).slice(0, 3);
  const body = `
${pageHero({ eyebrow: `${pillar.title}`, title: esc(p.title), lead: esc(p.summary), crumbs: [['/programmes/', 'Programmes'], [`/programmes/${p.slug}/`, p.title]], art: false })}
<section class="section-tight">
  <div class="container">
    <div class="programme-hero-media reveal">${illustration(p.image, p.imageAlt, { loading: 'eager', w: 1600, h: 900 })}</div>
  </div>
</section>
<section class="section-tight">
  <div class="container detail-grid">
    <article>
      <div class="prose reveal">
        <h2>The challenge</h2>
        <p>${esc(p.problem)}</p>
        ${p.html}
      </div>
      <div class="reveal mt-3"><h2>Who the programme serves</h2><ul class="check-list">${p.beneficiaries.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="reveal mt-2"><h2>Planned activities</h2><ul class="check-list">${p.activities.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="reveal mt-2"><h2>Expected outcomes</h2><ul class="check-list">${p.outcomes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="reveal mt-2"><h2>How we will measure progress</h2>
        <div class="table-wrap"><table class="indicator-table"><caption class="visually-hidden">Impact indicators for ${esc(p.title)}</caption><thead><tr><th scope="col">Indicator</th><th scope="col">How it is measured</th></tr></thead><tbody>${p.indicators.map((x) => `<tr><td>${esc(x.indicator)}</td><td>${esc(x.measure)}</td></tr>`).join('')}</tbody></table></div>
        <p class="muted mt-2" style="font-size:.92rem">Results will be published on our <a href="/impact/">impact page</a> once verified.</p>
      </div>
      <div class="reveal mt-2"><h2>Potential partners</h2><ul class="check-list">${p.partners.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    </article>
    <aside class="detail-aside">
      <div class="card">
        <ul class="fact-list">
          <li><span class="k">Status</span><span>${esc(p.status)}</span></li>
          <li><span class="k">Pillar</span><span>${pillar.title}</span></li>
          <li><span class="k">Locations</span><span>Akure and Akungba Akoko, Ondo State</span></li>
          <li><span class="k">Sustainable Development Goals</span><span class="sdg-list" style="gap:.4rem;margin-top:.3rem">${p.sdgs.map((n) => `<span class="tag" style="background:${SDG[n].color};color:#fff;border-color:transparent">SDG ${n}</span>`).join('')}</span></li>
        </ul>
      </div>
      <div class="card">
        <div class="icon">${icon('hand', 24)}</div>
        <h3 style="font-size:1.2rem">Volunteer with this programme</h3>
        <ul class="check-list" style="font-size:.95rem">${p.volunteerRoles.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <a class="btn btn-secondary btn-sm" href="/get-involved/#volunteer">Register interest ${arrow}</a>
      </div>
      <div class="card" style="background:var(--band-bg);color:var(--band-text);border-color:transparent">
        <h3 style="font-size:1.2rem;color:var(--band-text)">Support this programme</h3>
        <p style="font-size:.95rem;opacity:.9">Make a gift or sponsor ${esc(p.title)} as an individual or organisation.</p>
        <div class="btn-row"><a class="btn btn-gold btn-sm" href="/donate/">Donate</a><a class="btn btn-ghost-light btn-sm" href="/get-involved/#sponsor">Sponsor</a></div>
      </div>
    </aside>
  </div>
</section>
<section class="section section-alt">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">Related impact stories</p><h2>Stories from this programme</h2></div>
    ${related.length ? `<div class="grid grid-3">${related.map((x) => storyCard(x, ctx)).join('')}</div>` : `<div class="card reveal" style="max-width:720px"><p class="mb-0 muted">Stories from ${esc(p.title)} will be shared here as the programme gets underway, with the informed consent of everyone featured. <a href="/stories/">Read our latest stories</a>.</p></div>`}
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">More programmes</p><h2>Explore our other work</h2></div>
    <div class="grid grid-3">${others.map((x) => programmeCard(x)).join('')}</div>
  </div>
</section>`;
  return { path: `/programmes/${p.slug}/`, title: p.title, description: p.summary, body };
}

// =====================================================================
// IMPACT
// =====================================================================
export function impact(ctx) {
  const { site, programmes, posts } = ctx;
  const updates = posts.filter((p) => ['community-impact', 'events-and-outreach'].includes(p.category)).slice(0, 3);
  const toc = [['theory', 'Theory of change'], ['framework', 'Measurement framework'], ['indicators', 'Outcome indicators'], ['numbers', 'Impact dashboard'], ['stories', 'Community stories and updates'], ['accountability', 'Financial transparency'], ['reports', 'Reports archive'], ['sdgs', 'SDG alignment'], ['goals', 'Future goals']];
  const flow = [['Inputs', 'Funding, volunteers, partners, materials and local knowledge'], ['Activities', 'Training, school support, health education, safe spaces and community drives'], ['Outputs', 'Children supported, sessions delivered, people trained and referrals made'], ['Outcomes', 'Better attendance, new skills, healthier habits, greater confidence and income'], ['Impact', 'Families and communities with lasting opportunity, dignity and well-being']];
  const body = `
${pageHero({ eyebrow: 'Impact and accountability', title: 'Measuring what matters, and reporting it honestly.', lead: 'We are building our monitoring and reporting systems from the very beginning, so that every figure we publish can be trusted.', crumbs: [['/impact/', 'Impact']] })}
<section class="section-tight"><div class="container"><nav class="filters reveal" aria-label="On this page">${toc.map(([id, t]) => `<a class="chip" href="#${id}">${t}</a>`).join('')}</nav></div></section>

<section class="section-tight" id="theory">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">Theory of change</p><h2>How our work leads to lasting change.</h2><p class="lead">If communities have access to education, health knowledge, skills and safe, inclusive spaces, and if that support is delivered with dignity and community ownership, then individuals and families can move from hardship towards stability, confidence and opportunity.</p></div>
    <ol class="grid" style="grid-template-columns:repeat(auto-fit,minmax(190px,1fr));list-style:none;padding:0">${flow.map(([t, d], i) => `<li class="card reveal" data-delay="${i % 4}" style="margin:0"><span class="tag tag-status" style="margin-bottom:1rem">${String(i + 1).padStart(2, '0')}</span><h3 style="font-size:1.3rem">${t}</h3><p class="muted mb-0" style="font-size:.95rem">${d}</p></li>`).join('')}</ol>
    <p class="muted reveal mt-2" style="font-size:.95rem"><strong>Key assumptions:</strong> communities are willing to participate; partners remain engaged; funding is sustained long enough for outcomes to emerge; and economic conditions do not worsen sharply.</p>
  </div>
</section>

<section class="section section-alt" id="framework">
  <div class="container split top">
    <div class="reveal"><p class="eyebrow">Measurement framework</p><h2>Simple, proportionate and honest.</h2><p class="lead">As a growing grassroots foundation, we use a monitoring approach that is rigorous enough to be trusted and simple enough to sustain.</p></div>
    <div class="steps reveal" data-delay="1">
      <div class="step"><div><h3>Baseline</h3><p>Before each programme begins, we record where participants are starting from.</p></div></div>
      <div class="step"><div><h3>Routine monitoring</h3><p>Attendance registers, distribution records and session reports are kept for every activity.</p></div></div>
      <div class="step"><div><h3>Outcome checks</h3><p>Short surveys, follow-up visits and partner records show whether change is happening at three, six and twelve months.</p></div></div>
      <div class="step"><div><h3>Learning and reporting</h3><p>Results are reviewed quarterly by the team and annually by the board, then published in our annual report.</p></div></div>
      <div class="step"><div><h3>Data protection</h3><p>Personal data is collected with consent, stored securely and reported only in anonymised form.</p></div></div>
    </div>
  </div>
</section>

<section class="section" id="indicators">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">Programme outcome indicators</p><h2>What each programme will measure.</h2></div>
    <div class="grid grid-2">${programmes.map((p, i) => `<div class="card reveal" data-delay="${i % 2}"><h3 style="font-size:1.25rem"><a href="/programmes/${p.slug}/" style="text-decoration:none;color:inherit">${esc(p.title)}</a></h3><ul class="check-list mb-0" style="font-size:.95rem">${p.indicators.map((x) => `<li><span><strong>${esc(x.indicator)}.</strong> ${esc(x.measure)}</span></li>`).join('')}</ul></div>`).join('')}</div>
  </div>
</section>

<section class="section section-alt" id="numbers">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">Impact dashboard</p><h2>Our numbers, when they are real.</h2><p class="lead">These cards will display verified figures as our programmes are delivered. Until then, we would rather show nothing than show an estimate.</p></div>
    <div class="grid grid-3">${impactCards(ctx)}</div>
  </div>
</section>

<section class="section" id="stories">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">Community stories and project updates</p><h2>Progress, in people's own words.</h2></div>
    ${updates.length ? `<div class="grid grid-3">${updates.map((x) => storyCard(x, ctx)).join('')}</div>` : `<div class="card reveal" style="max-width:760px"><p class="muted">Project updates and community stories will appear here as programmes begin. Every story is shared with informed consent. Meanwhile, you can read our <a href="/stories/">latest articles</a>.</p></div>`}
  </div>
</section>

<section class="section section-alt" id="accountability">
  <div class="container split top">
    <div class="reveal"><p class="eyebrow">Financial transparency</p><h2>How we look after every contribution.</h2><p class="lead">Trust is earned through clear systems, not promises. These are the commitments we are building into our governance from the start.</p></div>
    <div class="reveal" data-delay="1">
      <ul class="check-list">
        <li><span><strong>Separate accounts.</strong> Foundation funds are held in an account in the Foundation's registered name, never in personal accounts.</span></li>
        <li><span><strong>Dual authorisation.</strong> Significant payments require approval from at least two authorised signatories.</span></li>
        <li><span><strong>Restricted funds.</strong> Gifts given for a specific programme are recorded and spent on that programme.</span></li>
        <li><span><strong>Receipts and acknowledgement.</strong> Every donation is acknowledged, and receipts are issued on request.</span></li>
        <li><span><strong>Independent review.</strong> Annual accounts will be prepared and reviewed in line with Nigerian requirements for registered nonprofits.</span></li>
        <li><span><strong>Published summaries.</strong> Income and expenditure summaries will be included in each annual report.</span></li>
      </ul>
      <div class="card mt-2"><h3 style="font-size:1.15rem">Governance</h3><p class="muted mb-0">Board of trustees: ${ph('[Names and roles of trustees to be published]')}<br>Registration: ${ph(site.registration.number)}</p></div>
    </div>
  </div>
</section>

<section class="section" id="reports">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">Reports archive</p><h2>Annual and impact reports</h2></div>
    ${site.reports && site.reports.length ? `<div class="grid grid-3">${site.reports.map((r) => `<a class="card reveal" href="${esc(r.file)}"><div class="icon">${icon('file', 24)}</div><h3 style="font-size:1.2rem">${esc(r.title)}</h3><p class="muted mb-0">${esc(r.year || '')}</p></a>`).join('')}</div>` : `<div class="card reveal" style="max-width:760px"><div class="icon">${icon('file', 24)}</div><h3 style="font-size:1.2rem">Our first annual report is forthcoming</h3><p class="muted mb-0">We will publish our first annual report, including a summary of income and expenditure, after our first full year of operation. Reports will be archived here.</p></div>`}
  </div>
</section>

<section class="section section-alt" id="sdgs">
  <div class="container split">
    <div class="reveal"><p class="eyebrow">SDG alignment</p><h2>Contributing to shared global goals.</h2><p class="lead">We report against the Sustainable Development Goals most relevant to our work so that partners can see how local action contributes to global progress.</p></div>
    <div class="sdg-list reveal" data-delay="1" style="flex-direction:column;align-items:flex-start">${[1, 3, 4, 5].map(sdgChip).join('')}</div>
  </div>
</section>

<section class="section" id="goals">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">Future goals</p><h2>Where we are heading.</h2><p class="lead">These are our intentions, not achievements. We will report progress against each one.</p></div>
    <div class="grid grid-3">
      <div class="card reveal"><span class="tag tag-status">First</span><h3 class="mt-2">Launch and learn</h3><p class="muted mb-0">Begin our first programmes in Akure and Akungba Akoko, establish baselines and build the monitoring systems described above.</p></div>
      <div class="card reveal" data-delay="1"><span class="tag tag-status">Next</span><h3 class="mt-2">Strengthen and partner</h3><p class="muted mb-0">Grow partnerships with schools, health providers and businesses, and publish our first annual report.</p></div>
      <div class="card reveal" data-delay="2"><span class="tag tag-status">Later</span><h3 class="mt-2">Scale what works</h3><p class="muted mb-0">Adapt proven programme models for other communities in Ondo State and, in time, across Nigeria.</p></div>
    </div>
  </div>
</section>
${donateBand()}
`;
  return { path: '/impact/', title: 'Impact and accountability', description: 'Our theory of change, impact measurement framework, outcome indicators and commitments to financial transparency.', body };
}

// =====================================================================
// STORIES
// =====================================================================
export function storiesIndex(ctx, { posts, category = null, page = 1, pages = 1, basePath = '/stories/' }) {
  const { categories } = ctx;
  const title = category ? category.name : 'Stories and news';
  const chips = `<nav class="filters" aria-label="Filter stories by category"><a class="chip" href="/stories/"${!category ? ' aria-current="page"' : ''}>All</a>${categories.filter((c) => ctx.posts.some((p) => p.category === c.slug)).map((c) => `<a class="chip" href="/stories/category/${c.slug}/"${category && category.slug === c.slug ? ' aria-current="page"' : ''}>${esc(c.name)}</a>`).join('')}</nav>`;
  const pager = pages > 1 ? `<nav class="pagination" aria-label="Pagination">${page > 1 ? `<a class="btn btn-secondary btn-sm" href="${page === 2 ? basePath : `${basePath}page/${page - 1}/`}">Newer</a>` : ''}<span class="pill-note">Page ${page} of ${pages}</span>${page < pages ? `<a class="btn btn-secondary btn-sm" href="${basePath}page/${page + 1}/">Older</a>` : ''}</nav>` : '';
  const body = `
${pageHero({ eyebrow: 'Stories and blog', title: esc(title), lead: category ? `Articles in ${esc(category.name)}.` : 'Foundation news, community impact, insights and perspectives from Starvira Impact Foundation.', crumbs: category ? [['/stories/', 'Stories'], [basePath, category.name]] : [['/stories/', 'Stories']] })}
<section class="section-tight">
  <div class="container">
    ${chips}
    ${posts.length ? `<div class="grid grid-3">${posts.map((p) => storyCard(p, ctx)).join('')}</div>` : '<p class="muted">No articles have been published in this category yet.</p>'}
    ${pager}
    <p class="muted center mt-3" style="font-size:.9rem">${icon('file', 16, ' style="display:inline;vertical-align:-3px"')} Prefer a feed reader? Subscribe via <a href="/stories/feed.xml">RSS</a>.</p>
  </div>
</section>`;
  const path = page > 1 ? `${basePath}page/${page}/` : basePath;
  return { path, title: page > 1 ? `${title}, page ${page}` : title, description: 'News, stories and insights from Starvira Impact Foundation.', body };
}

export function storyPage(ctx, post) {
  const { site, categoryMap, authorMap, baseUrl } = ctx;
  const cat = categoryMap[post.category];
  const author = authorMap[post.author] || { name: post.author || 'Starvira Impact Foundation' };
  const url = baseUrl + `/stories/${post.slug}/`;
  const enc = encodeURIComponent;
  const related = ctx.posts.filter((p) => p.slug !== post.slug).sort((a, b) => (b.category === post.category) - (a.category === post.category)).slice(0, 3);
  const body = `
<article>
  <header class="article-header">
    <div class="container-narrow">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/stories/">Stories</a></li>${cat ? `<li><a href="/stories/category/${cat.slug}/">${esc(cat.name)}</a></li>` : ''}</ol></nav>
      <div class="programme-card"><div class="meta">${cat ? `<a class="tag" href="/stories/category/${cat.slug}/" style="text-decoration:none">${esc(cat.name)}</a>` : ''}${post.sample ? '<span class="tag tag-sample">Sample article</span>' : ''}</div></div>
      <h1 style="font-size:clamp(2.2rem,3vw + 1rem,3.6rem)">${esc(post.title)}</h1>
      <p class="lead">${esc(post.summary)}</p>
      <div class="article-meta"><span>By <strong>${esc(author.name)}</strong></span><span class="dot"></span><time datetime="${post.dateISO}">${formatDate(post.date)}</time><span class="dot"></span><span>${post.readingTime} min read</span></div>
    </div>
  </header>
  <div class="container" style="max-width:1000px">${post.image ? `<div class="article-cover">${illustration(post.image, post.imageAlt || '', { loading: 'eager', w: 1600, h: 800 })}</div>` : ''}</div>
  <div class="container-narrow">
    ${post.sample ? `<div class="notice" style="margin-bottom:2rem">${icon('info', 20)}<p>This is a sample article created to demonstrate the stories section. It describes the Foundation's intentions and does not report past events. Review, adapt or remove it before launch.</p></div>` : ''}
    <div class="prose">${post.html}</div>
    ${post.gallery && post.gallery.length ? `<div class="gallery">${post.gallery.map((g) => `<img src="${esc(g)}" alt="" loading="lazy">`).join('')}</div>` : ''}
    <div class="share">
      <span class="share-label">Share</span>
      <a class="btn btn-secondary btn-sm" href="https://wa.me/?text=${enc(post.title + ' ' + url)}" target="_blank" rel="noopener">${icon('whatsapp', 16)} WhatsApp</a>
      <a class="btn btn-secondary btn-sm" href="https://www.facebook.com/sharer/sharer.php?u=${enc(url)}" target="_blank" rel="noopener">${icon('facebook', 16)} Facebook</a>
      <a class="btn btn-secondary btn-sm" href="https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}" target="_blank" rel="noopener">${icon('linkedin', 16)} LinkedIn</a>
      <a class="btn btn-secondary btn-sm" href="https://x.com/intent/post?text=${enc(post.title)}&amp;url=${enc(url)}" target="_blank" rel="noopener">${icon('x', 16)} X</a>
      <button class="btn btn-secondary btn-sm" type="button" data-share-copy>${icon('link', 16)} Copy link</button>
      <button class="btn btn-secondary btn-sm" type="button" data-share-native hidden>${icon('share', 16)} More</button>
    </div>
  </div>
</article>
${related.length ? `<section class="section section-alt" style="margin-top:4rem"><div class="container"><div class="section-head reveal"><p class="eyebrow">Keep reading</p><h2>Related stories</h2></div><div class="grid grid-3">${related.map((p) => storyCard(p, ctx)).join('')}</div></div></section>` : ''}
`;
  return { path: `/stories/${post.slug}/`, title: post.seoTitle || post.title, description: post.seoDescription || post.summary, body, ogType: 'article', ogImage: post.ogImage,
    jsonld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: post.title, datePublished: post.dateISO, author: { '@type': author.slug === 'starvira-team' ? 'Organization' : 'Person', name: author.name }, publisher: { '@type': 'Organization', name: site.name, logo: { '@type': 'ImageObject', url: baseUrl + '/icon-512.png' } }, mainEntityOfPage: url, description: post.summary }] };
}

// =====================================================================
// GET INVOLVED
// =====================================================================
export function getInvolved(ctx) {
  const paths = [['volunteer', 'Volunteer', 'hand'], ['partner', 'Partner', 'handshake'], ['donate', 'Donate', 'heart'], ['sponsor', 'Sponsor a programme', 'star'], ['ideas', 'Contribute ideas', 'bulb']];
  const body = `
${pageHero({ eyebrow: 'Get involved', title: 'Lend your light to the work.', lead: 'Whether you give time, skills, resources or ideas, you can help children, women and families in Ondo State build brighter futures. Choose the pathway that suits you.', crumbs: [['/get-involved/', 'Get involved']] })}
<section class="section-tight"><div class="container"><nav class="path-nav" aria-label="Ways to get involved">${paths.map(([id, t, ic]) => `<a class="chip" href="#${id}">${icon(ic, 16, ' style="margin-right:.4rem"')}${t}</a>`).join('')}</nav></div></section>

<section class="section pathway" id="volunteer">
  <div class="container split top">
    <div class="reveal">
      <p class="eyebrow">Volunteer</p><h2>Give your time and skills.</h2>
      <p class="lead">Volunteers will support every programme we run, from school pack days to mentorship and community outreach.</p>
      <ul class="check-list"><li>An induction and safeguarding briefing before you start</li><li>Roles matched to your skills and availability</li><li>Recognition, certificates and references for active volunteers</li><li>Young people aged 16 and above are welcome, with parental consent where under 18</li></ul>
    </div>
    <div class="form-card reveal" data-delay="1">
      <h3>Register your interest</h3>
      ${formShell(ctx, 'volunteer', `
        ${field('v-name', 'fullName', 'Full name', { required: true, autocomplete: 'name', max: 120 })}
        <div class="form-row">${field('v-email', 'email', 'Email', { type: 'email', required: true, autocomplete: 'email' })}${field('v-phone', 'phone', 'Telephone', { type: 'tel', required: true, autocomplete: 'tel', max: 30 })}</div>
        <div class="form-row">${field('v-loc', 'location', 'Where are you based?', { required: true, options: VOLUNTEER_LOCATIONS })}${field('v-avail', 'availability', 'Availability', { required: true, options: VOLUNTEER_AVAILABILITY })}</div>
        ${checkGroup('v-int', 'interests', 'Programmes you are interested in', PROGRAMME_NAMES)}
        ${field('v-skills', 'skills', 'Skills and experience', { optional: true, rows: 3, max: 2000, placeholder: 'For example: teaching, health, accounting, photography, events' })}
        ${field('v-msg', 'message', 'Anything else you would like us to know', { optional: true, rows: 3, max: 3000 })}
        ${checkbox('v-age', 'ageConfirm', 'I am 18 or older, or I am 16 or 17 and have permission from a parent or guardian.', { required: true, msg: 'Please confirm your age or guardian permission.' })}
        ${consent('v-consent')}`, 'Send registration')}
    </div>
  </div>
</section>

<section class="section section-alt pathway" id="partner">
  <div class="container split top">
    <div class="reveal">
      <p class="eyebrow">Partner</p><h2>Build impact together.</h2>
      <p class="lead">We welcome corporate, institutional, educational and community partners who share our commitment to lasting, measurable change.</p>
      <div class="grid" style="gap:1rem">
        <div class="card"><h4>${icon('building', 18, ' style="display:inline;vertical-align:-3px;margin-right:.4rem"')}Corporate and CSR</h4><p class="muted mb-0">Programme sponsorship, employee volunteering and cause partnerships aligned with your CSR priorities.</p></div>
        <div class="card"><h4>${icon('globe', 18, ' style="display:inline;vertical-align:-3px;margin-right:.4rem"')}Institutions and funders</h4><p class="muted mb-0">Grant partnerships with clear outcomes, monitoring and reporting.</p></div>
        <div class="card"><h4>${icon('book', 18, ' style="display:inline;vertical-align:-3px;margin-right:.4rem"')}Schools and universities</h4><p class="muted mb-0">Learning programmes, research collaboration and student volunteering.</p></div>
      </div>
      <p class="mt-2"><a class="text-link" href="/contact/">Prefer to talk first? Contact us ${arrow}</a></p>
    </div>
    <div class="form-card reveal" data-delay="1">
      <h3>Start a partnership conversation</h3>
      ${formShell(ctx, 'partner', `
        <div class="form-row">${field('p-name', 'fullName', 'Full name', { required: true, autocomplete: 'name', max: 120 })}${field('p-role', 'role', 'Role or title', { optional: true, autocomplete: 'organization-title', max: 120 })}</div>
        ${field('p-org', 'organisation', 'Organisation', { required: true, autocomplete: 'organization', max: 150 })}
        <div class="form-row">${field('p-email', 'email', 'Email', { type: 'email', required: true, autocomplete: 'email' })}${field('p-phone', 'phone', 'Telephone', { type: 'tel', optional: true, autocomplete: 'tel', max: 30 })}</div>
        ${field('p-type', 'partnershipType', 'Type of partnership', { required: true, options: PARTNERSHIP_TYPES })}
        ${checkGroup('p-int', 'interests', 'Programmes of interest', PROGRAMME_NAMES)}
        ${field('p-msg', 'message', 'Tell us about your goals', { required: true, rows: 4, min: 20, max: 5000 })}
        ${consent('p-consent')}`, 'Send enquiry')}
    </div>
  </div>
</section>

<section class="section pathway" id="donate">
  <div class="container"><div class="band reveal">
    <img class="band-art" src="/images/brand/symbol-on-dark.svg" alt="" aria-hidden="true">
    <div class="band-grid"><div><p class="eyebrow">Donate</p><h2>Support our programmes.</h2><p class="lead mb-0">One-time, recurring, programme-specific and in-kind gifts all help. Every gift is acknowledged and recorded transparently.</p></div>
    <div class="btn-row" style="justify-content:flex-end"><a class="btn btn-gold" href="/donate/">Ways to give ${arrow}</a></div></div>
  </div></div>
</section>

<section class="section section-alt pathway" id="sponsor">
  <div class="container split top">
    <div class="reveal">
      <p class="eyebrow">Sponsor a programme</p><h2>Make a programme possible.</h2>
      <p class="lead">Sponsors can fund a specific programme or activity, such as a Back to School distribution or a Women Rise training cohort.</p>
      <ul class="check-list"><li>Agreed goals and budget before work begins</li><li>Progress updates and a final report with verified results</li><li>Appropriate recognition, agreed with you in advance</li></ul>
    </div>
    <div class="form-card reveal" data-delay="1">
      <h3>Express sponsorship interest</h3>
      ${formShell(ctx, 'sponsor', `
        <div class="form-row">${field('s-name', 'fullName', 'Full name', { required: true, autocomplete: 'name', max: 120 })}${field('s-org', 'organisation', 'Organisation', { optional: true, autocomplete: 'organization', max: 150 })}</div>
        <div class="form-row">${field('s-email', 'email', 'Email', { type: 'email', required: true, autocomplete: 'email' })}${field('s-phone', 'phone', 'Telephone', { type: 'tel', optional: true, autocomplete: 'tel', max: 30 })}</div>
        <div class="form-row">${field('s-prog', 'programme', 'Programme to support', { required: true, options: PROGRAMME_NAMES })}${field('s-type', 'supportType', 'Type of support', { required: true, options: SUPPORT_TYPES })}</div>
        ${field('s-msg', 'message', 'Message', { optional: true, rows: 3, max: 5000 })}
        ${consent('s-consent')}`, 'Send interest')}
    </div>
  </div>
</section>

<section class="section pathway" id="ideas">
  <div class="container split top">
    <div class="reveal">
      <p class="eyebrow">Contribute ideas</p><h2>Share a proposal or opportunity.</h2>
      <p class="lead">Community members often see needs and solutions first. If you have an idea for a project, a collaboration or an improvement to our work, we want to hear it.</p>
    </div>
    <div class="form-card reveal" data-delay="1">
      <h3>Share your idea</h3>
      ${formShell(ctx, 'idea', `
        <div class="form-row">${field('i-name', 'fullName', 'Full name', { required: true, autocomplete: 'name', max: 120 })}${field('i-email', 'email', 'Email', { type: 'email', required: true, autocomplete: 'email' })}</div>
        ${field('i-title', 'ideaTitle', 'Title of your idea', { required: true, max: 160 })}
        ${field('i-msg', 'message', 'Describe your idea', { required: true, rows: 5, min: 20, max: 5000, hint: 'What need does it address, who would benefit, and how might it work?' })}
        ${consent('i-consent')}`, 'Share idea')}
    </div>
  </div>
</section>`;
  return { path: '/get-involved/', title: 'Get involved', description: 'Volunteer, partner, donate, sponsor a programme or share an idea with Starvira Impact Foundation.', body, hasForm: true };
}

// =====================================================================
// DONATE
// =====================================================================
export function donate(ctx) {
  const { site } = ctx;
  const b = site.bank;
  const row = (k, v, copyable = true) => `<div class="bank-row"><div><dt>${k}</dt><dd>${ph(v)}</dd></div>${copyable ? `<button class="copy-btn" type="button" data-copy="${esc(v)}" data-copy-label="${esc(k)}"${isPh(v) ? ' disabled title="Available once bank details are added"' : ''} aria-label="Copy ${esc(k)}">${icon('copy', 14)}<span>Copy</span></button>` : ''}</div>`;
  const online = site.donations.onlineGivingUrl;
  const recurring = site.donations.recurringGivingUrl;
  const giveEmail = isPh(site.contact.donationsEmail) ? ph(site.contact.donationsEmail) : `<a href="mailto:${esc(site.contact.donationsEmail)}">${esc(site.contact.donationsEmail)}</a>`;
  const ways = [
    ['heart', 'One-time gift', 'A single donation by bank transfer or, once enabled, securely online.'],
    ['repeat', 'Recurring support', 'Monthly giving provides steady funding that lets us plan ahead with confidence.'],
    ['target', 'Programme-specific', 'Direct your gift to a programme such as Back to School or Women Rise. Restricted gifts are tracked separately.'],
    ['building', 'Corporate giving', 'Sponsorship, CSR partnerships, matched giving and employee volunteering.'],
    ['gift', 'In-kind donations', 'School materials, equipment, venues, transport or professional services, agreed with us in advance.'],
    ['briefcase', 'Bank transfer', 'Transfer directly to the Foundation\'s registered bank account using the details on this page.'],
  ];
  const body = `
${pageHero({ eyebrow: 'Donate and support', title: 'Your generosity becomes someone\'s opportunity.', lead: 'Support from individuals, companies and institutions makes our programmes possible. We acknowledge every gift and report openly on how support is used.', crumbs: [['/donate/', 'Donate']] })}

<section class="section">
  <div class="container split top">
    <div class="reveal">
      <p class="eyebrow">Why support matters</p><h2>Practical help, at the moments that count.</h2>
      <p class="lead">A school pack before term begins. A training course that turns a skill into income. A health session that helps a family prevent illness. Your support helps remove the practical barriers that hold people back.</p>
      <p>As a new foundation, early supporters play a special role. You are helping us build programmes, systems and partnerships that can serve communities for years to come.</p>
    </div>
    <div class="reveal" data-delay="1">
      <div class="bank-card" id="bank">
        <h3>Bank transfer ${icon('briefcase', 24)}</h3>
        <dl class="bank-rows">
          ${row('Bank name', b.bankName)}
          ${row('Account name', b.accountName)}
          ${row('Account number', b.accountNumber)}
          ${row('Currency', b.currency)}
          ${row('Swift code', b.swift)}
        </dl>
        <p style="font-size:.88rem;opacity:.85;margin:0">Please use your name as the transfer reference, and email ${isPh(site.contact.donationsEmail) ? 'our donations team' : esc(site.contact.donationsEmail)} so we can acknowledge your gift.</p>
      </div>
      ${isPh(b.accountNumber) ? `<div class="notice mt-2">${icon('info', 20)}<p>Bank details will be published here once the Foundation's account is confirmed. Please do not send money to any account that is not listed on this page or confirmed in writing by the Foundation.</p></div>` : `<div class="notice mt-2">${icon('shield', 20)}<p>For your security, only send donations to the account listed on this page. We will never ask you to pay into a personal account.</p></div>`}
      <div class="btn-row mt-2">
        ${online ? `<a class="btn btn-primary" href="${esc(online)}" target="_blank" rel="noopener">${icon('heart', 18)} Give securely online</a>` : `<span class="btn btn-primary" aria-disabled="true" title="Online giving will be enabled soon">${icon('heart', 18)} Online giving coming soon</span>`}
        ${recurring ? `<a class="btn btn-secondary" href="${esc(recurring)}" target="_blank" rel="noopener">${icon('repeat', 18)} Give monthly</a>` : ''}
      </div>
      ${online ? `<p class="muted" style="font-size:.88rem;margin-top:.8rem">Online payments are processed securely by ${esc(site.donations.onlineGivingProvider)}. We never see or store your card details.</p>` : ''}
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">Ways to contribute</p><h2>Choose how you give.</h2></div>
    <div class="grid grid-3">${ways.map(([ic, t, d], i) => `<div class="card reveal" data-delay="${i % 3}"><div class="icon">${icon(ic, 24)}</div><h3>${t}</h3><p class="muted">${d}</p></div>`).join('')}</div>
  </div>
</section>

<section class="section">
  <div class="container split top">
    <div class="reveal"><p class="eyebrow">Trust and privacy</p><h2>How we look after you and your gift.</h2></div>
    <div class="reveal" data-delay="1">
      <ul class="check-list">
        <li><span><strong>Acknowledgement and receipts.</strong> We acknowledge every donation. Email ${giveEmail} with your name, amount, date and reference to receive a receipt.</span></li>
        <li><span><strong>Donor privacy.</strong> Your details are used only to process and acknowledge your gift and, if you agree, to update you on our work. We never sell or share donor information.</span></li>
        <li><span><strong>Recognition is your choice.</strong> We will only name you publicly with your permission. Anonymous gifts are welcome.</span></li>
        <li><span><strong>Restricted gifts.</strong> If you give for a specific programme, your gift is recorded and used for that programme.</span></li>
        <li><span><strong>Tax status.</strong> We do not currently make any claim about the tax deductibility of donations. Please seek independent advice about your own tax position.</span></li>
      </ul>
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container-narrow">
    <div class="section-head center reveal"><p class="eyebrow">Questions</p><h2>Donation FAQs</h2></div>
    <div class="faq reveal">
      <details><summary>How will my donation be used?</summary><p>Unrestricted gifts support our programmes where the need is greatest, along with the essential costs of running them well. Restricted gifts are used for the programme you choose. Our annual reports will summarise how funds were used.</p></details>
      <details><summary>Can I donate from outside Nigeria?</summary><p>Yes. International donors can use the Swift details above once they are published, or contact us to discuss the best option.</p></details>
      <details><summary>Can my company donate goods or services?</summary><p>Yes. Please contact us before sending items so that we can confirm they meet a current need and arrange delivery. We issue an acknowledgement for in-kind contributions.</p></details>
      <details><summary>How do I get a receipt?</summary><p>Email our donations team with your name, the amount, the date of transfer and the reference used. We will send an acknowledgement and receipt.</p></details>
      <details><summary>How do I know the bank account is genuine?</summary><p>Only the account published on this page belongs to the Foundation. It is held in the Foundation's registered name. If anyone asks you to pay into a different or personal account, please do not pay and contact us immediately.</p></details>
    </div>
    <p class="center mt-3 reveal">Donation enquiries: ${giveEmail} &middot; ${ph(site.contact.phone)}</p>
  </div>
</section>`;
  return { path: '/donate/', title: 'Donate and support', description: 'Support Starvira Impact Foundation by bank transfer, recurring giving, programme sponsorship, corporate partnership or in-kind donation.', body };
}

// =====================================================================
// CONTACT
// =====================================================================
export function contact(ctx) {
  const { site } = ctx;
  const c = site.contact;
  const email = isPh(c.email) ? ph(c.email) : `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`;
  const phone = isPh(c.phone) ? ph(c.phone) : `<a href="tel:${esc(c.phone.replace(/\s/g, ''))}">${esc(c.phone)}</a>`;
  const social = site.social.filter((s) => s.url);
  const body = `
${pageHero({ eyebrow: 'Contact us', title: 'We would love to hear from you.', lead: 'Questions, partnerships, volunteering, media enquiries or ideas: send us a message and the right person will respond.', crumbs: [['/contact/', 'Contact']] })}
<section class="section">
  <div class="container split top" style="grid-template-columns:1.1fr .9fr">
    <div class="form-card reveal">
      <h2 style="font-size:1.8rem">Send a message</h2>
      ${formShell(ctx, 'contact', `
        <div class="form-row">${field('c-name', 'fullName', 'Full name', { required: true, autocomplete: 'name', max: 120 })}${field('c-email', 'email', 'Email', { type: 'email', required: true, autocomplete: 'email' })}</div>
        <div class="form-row">${field('c-phone', 'phone', 'Telephone', { type: 'tel', optional: true, autocomplete: 'tel', max: 30 })}${field('c-org', 'organisation', 'Organisation', { optional: true, autocomplete: 'organization', max: 150 })}</div>
        <div class="form-row">${field('c-cat', 'category', 'Reason for contacting us', { required: true, options: CONTACT_CATEGORIES })}${field('c-subject', 'subject', 'Subject', { required: true, max: 160 })}</div>
        ${field('c-msg', 'message', 'Message', { required: true, rows: 6, min: 20, max: 5000 })}
        ${consent('c-consent')}`, 'Send message')}
    </div>
    <div class="reveal" data-delay="1">
      <ul class="contact-list">
        <li><span class="icon">${icon('mail', 22)}</span><div><div class="k">Email</div>${email}</div></li>
        <li><span class="icon">${icon('phone', 22)}</span><div><div class="k">Telephone</div>${phone}</div></li>
        ${c.offices.map((o) => `<li><span class="icon">${icon('pin', 22)}</span><div><div class="k">${esc(o.name)}</div>${ph(o.address)}${o.mapUrl ? `<br><a href="${esc(o.mapUrl)}" target="_blank" rel="noopener">View on map</a>` : ''}</div></li>`).join('')}
        <li><span class="icon">${icon('clock', 22)}</span><div><div class="k">Office hours</div>${ph(c.officeHours)}</div></li>
      </ul>
      <div class="card mt-2">
        <h3 style="font-size:1.15rem">Follow our work</h3>
        ${social.length ? `<ul class="social" style="color:var(--heading)">${social.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.name)}">${icon(s.name.toLowerCase(), 18)}</a></li>`).join('')}</ul>` : '<p class="muted mb-0">Our social media channels are launching soon. Subscribe to our newsletter in the footer to hear when they go live.</p>'}
      </div>
      <div class="map-frame mt-2">${c.offices.some((o) => o.mapUrl) ? '' : `<div>${icon('pin', 28, ' style="margin:0 auto .6rem;color:var(--accent-text)"')}<p class="muted mb-0" style="font-size:.92rem">An office map will appear here once our address is confirmed.</p></div>`}</div>
    </div>
  </div>
</section>
<section class="section section-alt">
  <div class="container-narrow">
    <div class="section-head center reveal"><p class="eyebrow">Frequently asked questions</p><h2>Before you write</h2></div>
    <div class="faq reveal">
      <details><summary>How quickly will you reply?</summary><p>We aim to reply to all messages within five working days. Urgent safeguarding concerns should be marked clearly in the subject line.</p></details>
      <details><summary>How can I volunteer?</summary><p>Please use the volunteer form on our <a href="/get-involved/#volunteer">Get Involved</a> page so that we have the information needed to match you to a role.</p></details>
      <details><summary>Can you support my family or community?</summary><p>Our programmes select participants through schools, community leaders and open calls. Contact us with details and we will explain current opportunities or refer you to other organisations where we can.</p></details>
      <details><summary>I am a journalist. Who should I contact?</summary><p>Choose "Media enquiry" in the form above and include your deadline. We will respond as quickly as we can.</p></details>
      <details><summary>How do I raise a safeguarding concern?</summary><p>Please read our <a href="/safeguarding/">safeguarding statement</a>. If anyone is in immediate danger, contact the police or emergency services first.</p></details>
    </div>
  </div>
</section>`;
  return { path: '/contact/', title: 'Contact us', description: 'Contact Starvira Impact Foundation in Akure and Akungba Akoko, Ondo State, Nigeria.', body, hasForm: true };
}

// =====================================================================
// POLICY PAGES
// =====================================================================
function policy(ctx, { path, title, lead, html, updated = 'November 2026' }) {
  const body = `${pageHero({ eyebrow: 'Policies', title: esc(title), lead, crumbs: [[path, title]], art: false })}
<section class="section-tight"><div class="container-narrow prose">${html}<p class="muted" style="font-size:.92rem">Last updated: ${updated}. This page is a draft for review by the Foundation's trustees and a qualified Nigerian legal professional before launch.</p></div></section>`;
  return { path, title, description: lead, body };
}

export function privacyPage(ctx) {
  const { site } = ctx;
  return policy(ctx, { path: '/privacy/', title: 'Privacy notice', lead: 'How Starvira Impact Foundation collects, uses and protects personal information.', html: `
<h2>Who we are</h2><p>${esc(site.name)} ("the Foundation", "we") is a nonprofit organisation based in Akure and Akungba Akoko, Ondo State, Nigeria. We are committed to protecting personal data in line with the Nigeria Data Protection Act 2023 and related regulations.</p>
<h2>What we collect</h2><ul><li>Information you submit through our forms, such as your name, email address, telephone number, organisation and message.</li><li>Information you provide as a volunteer, partner, donor or programme participant.</li><li>Limited technical information needed to operate and secure the website, such as server logs.</li></ul>
<h2>How we use it</h2><ul><li>To respond to enquiries and manage volunteering, partnerships and donations.</li><li>To send updates where you have subscribed or agreed to receive them.</li><li>To deliver, monitor and report on programmes, using anonymised data in any public reporting.</li><li>To meet legal, financial and safeguarding obligations.</li></ul>
<h2>Legal basis</h2><p>We process personal data on the basis of your consent, our legitimate interests in running the Foundation, the performance of agreements with you, and compliance with legal obligations.</p>
<h2>Cookies and analytics</h2><p>This website does not use advertising or tracking cookies. Your theme preference (light or dark) is stored in your own browser. If we enable website analytics, we will use a privacy-friendly, cookie-free service and update this notice.</p>
<h2>Sharing</h2><p>We do not sell personal data. We share it only with trusted service providers who help us operate (for example, email delivery and website hosting), under appropriate safeguards, or where the law requires.</p>
<h2>Children's information</h2><p>We collect children's information only where necessary for programme delivery and with the consent of a parent or guardian. Images of children are never published without written consent.</p>
<h2>Retention and security</h2><p>We keep personal data only as long as needed for the purposes above and protect it with appropriate technical and organisational measures.</p>
<h2>Your rights</h2><p>You may ask to access, correct or delete your personal data, withdraw consent, or object to processing. Contact us at ${ph(site.contact.email)}. You may also complain to the Nigeria Data Protection Commission.</p>` });
}

export function safeguardingPage(ctx) {
  const { site } = ctx;
  return policy(ctx, { path: '/safeguarding/', title: 'Safeguarding statement', lead: 'Our commitment to protecting children and vulnerable adults in everything we do.', html: `
<p>${esc(site.name)} has a zero-tolerance approach to abuse, exploitation and harm. Everyone who works or volunteers with us is responsible for keeping children and vulnerable adults safe.</p>
<h2>Our commitments</h2><ul><li>Safer recruitment and vetting for staff and volunteers who work with children and vulnerable adults.</li><li>Safeguarding induction and a signed code of conduct for every staff member and volunteer.</li><li>Supervised activities, with no unsupervised one-to-one contact with children.</li><li>Informed, written consent before photographing or sharing the stories of participants, and parental consent for children.</li><li>Clear procedures for reporting and responding to concerns, and referral to qualified authorities and services.</li><li>Confidential handling of all concerns and records.</li></ul>
<h2>Raising a concern</h2><p>If you are worried about the safety or wellbeing of a child or vulnerable adult connected with our work, please contact our Safeguarding Lead: ${ph('[Name of Safeguarding Lead]')}, ${ph('[safeguarding@yourdomain.org]')}, ${ph('[telephone]')}. If someone is in immediate danger, contact the police or emergency services first.</p>
<p>All concerns are taken seriously, handled confidentially, and acted upon promptly.</p>` });
}

export function accessibilityPage(ctx) {
  const { site } = ctx;
  return policy(ctx, { path: '/accessibility/', title: 'Accessibility statement', lead: 'We want everyone to be able to use this website.', html: `
<p>We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.</p>
<h2>What we have done</h2><ul><li>Clear headings, landmarks and a skip link for keyboard and screen reader users.</li><li>Colour combinations checked for contrast in both light and dark themes.</li><li>Forms with visible labels, helpful error messages and keyboard support.</li><li>Respect for your device's reduced-motion setting.</li><li>Pages designed to work on small screens and slower connections.</li></ul>
<h2>Feedback</h2><p>If you have difficulty using any part of this website, please contact us at ${ph(site.contact.email)} and tell us what happened. We will do our best to help and to fix the problem.</p>` });
}

export function notFound() {
  const body = `<section class="section error-page"><div class="container-narrow"><p class="eyebrow" style="justify-content:center">Page not found</p><h1>This path has not been lit yet.</h1><p class="lead" style="margin-inline:auto">The page you are looking for may have moved or no longer exists.</p><div class="btn-row" style="justify-content:center"><a class="btn btn-primary" href="/">Return home</a><a class="btn btn-secondary" href="/contact/">Contact us</a></div></div></section>`;
  return { path: '/404.html', title: 'Page not found', body, noindex: true };
}

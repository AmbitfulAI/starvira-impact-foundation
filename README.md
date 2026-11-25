# Starvira Impact Foundation website

The official website of **Starvira Impact Foundation**, a community-led nonprofit in Akure and Akungba Akoko, Ondo State, Nigeria.

*Lighting Paths. Lifting Lives. Creating Impact.*

## What is in this repository

| Path | What it is |
| --- | --- |
| `content/` | All editable content: site settings, programmes, stories, founder page, authors, categories |
| `lib/` | Page templates, shared form rules and the icon set |
| `src/css`, `src/js` | Design system stylesheet and small, dependency-free browser scripts |
| `public/` | Static files: fonts, images, logos, favicons and the content manager at `/admin` |
| `api/` | Serverless functions: form handling (`submit.js`) and content manager sign-in (`auth.js`, `callback.js`) |
| `build.mjs` | Builds the whole site into `dist/` |
| `tests/` | Automated checks for forms, links, accessibility basics and the no em dash rule |
| `docs/` | Guides for deployment, the content manager, editing and launch |

## Why this architecture

The brief suggested Next.js. This site instead uses a **zero-dependency static build** (plain Node.js, no npm packages to install), plus two small serverless functions. The reasons:

- **Fast on Nigerian mobile networks.** Every page is plain HTML with about 45 KB of CSS and JavaScript and self-hosted fonts. There is no framework to download.
- **Low maintenance and low cost.** No dependencies means no security updates to chase and no broken builds when packages change. It hosts free on Vercel, Netlify or Cloudflare Pages.
- **Non-technical publishing.** Decap CMS at `/admin` lets staff write stories, edit programmes and update contact, bank and impact details through a web form.

It can be migrated to Next.js later if the Foundation needs logged-in areas or a donor database; the content files are framework-neutral.

## Quick start

Requires Node.js 20 or newer. Nothing to install.

```bash
npm run dev        # build and serve on http://localhost:4321 (forms are logged, not emailed)
npm test           # build, then run all checks
npm run build      # production build into dist/
```

## Features

- Home, About, Our Founder, Programmes (with 7 programme pages), Impact and Accountability, Stories (blog with categories, pagination and RSS), Get Involved (5 pathways), Donate, Contact, Privacy, Safeguarding, Accessibility, 404
- Light and dark themes: follows the device setting on the first visit, remembers the visitor's choice, no flash on load
- Working forms (contact, volunteer, partnership, idea, sponsorship, newsletter) with browser and server validation, honeypot and timing spam checks, rate limiting, optional Cloudflare Turnstile, and email delivery through Resend
- Donation page with copy-to-clipboard bank details, a ready slot for a Paystack or Flutterwave payment page link, donor privacy and receipt process
- SEO: unique titles and descriptions, canonical links, Open Graph images, sitemap, robots.txt, RSS, schema.org NGO, Person and Article data
- Accessibility: skip link, landmarks, labelled fields, visible focus, reduced-motion support, tested colour contrast
- Placeholders such as `[Account Number]` are highlighted on the page until real information replaces them

## Guides

- [Deployment](docs/DEPLOYMENT.md)
- [Content manager setup](docs/CMS-SETUP.md)
- [Editing content and publishing stories](docs/CONTENT-GUIDE.md)
- [Accessibility and SEO checklist](docs/ACCESSIBILITY-SEO-CHECKLIST.md)
- [Launch checklist and remaining placeholders](docs/LAUNCH-CHECKLIST.md)
- [Suggested future improvements](docs/FUTURE-IMPROVEMENTS.md)
- [Licences](docs/LICENCES.md)

## Writing rule

Do not use the em dash character anywhere. `npm test` fails if one appears in content or templates.

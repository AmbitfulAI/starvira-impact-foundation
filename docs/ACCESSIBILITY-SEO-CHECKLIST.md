# Accessibility and SEO checklist

Automated by `npm test`: one H1 per page, title and description on every page, alt attribute on every image, a label for every form field, no broken internal links or assets, sitemap and robots present, no em dashes.

## Accessibility (WCAG 2.2 AA)

- [x] Skip link, header, nav, main and footer landmarks
- [x] Keyboard access to menus, theme toggle, forms and copy buttons; visible focus ring
- [x] Form labels, required and optional marked in text, error messages linked to fields, status announced with live regions
- [x] Colour contrast checked in both themes (body text above 4.5:1)
- [x] Reduced-motion preference respected; no auto-playing media
- [x] Language set (`en-GB`); descriptive link text
- [ ] Before launch: test with a screen reader (NVDA or VoiceOver) and with keyboard only
- [ ] Before launch: add alt text to every real photograph uploaded through the CMS

## SEO

- [x] Unique titles and meta descriptions; canonical URLs from `SITE_URL`
- [x] Open Graph and Twitter card tags with branded images
- [x] `sitemap.xml`, `robots.txt` (admin excluded), RSS feed
- [x] Structured data: NGO, WebSite, Person (founder), Article (stories)
- [ ] After launch: verify the site in Google Search Console and submit the sitemap
- [ ] After launch: create a Google Business Profile for the Akure office

## Performance

- [x] Self-hosted, subset fonts with `font-display: swap`
- [x] Responsive WebP founder photos; vector illustrations; lazy-loaded images below the fold
- [x] No framework JavaScript (about 8 KB of site script)
- [ ] After launch: run PageSpeed Insights on mobile and keep uploaded photos small

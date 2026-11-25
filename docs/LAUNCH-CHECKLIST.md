# Launch checklist

## Information the Foundation must supply (placeholders)

Bracketed placeholders are highlighted in yellow on the website and in the documents.

| Placeholder | Where to change it |
| --- | --- |
| Official email addresses (general, donations, safeguarding, privacy) | CMS: Site settings; document footers; email signature |
| Telephone and WhatsApp numbers | CMS: Site settings; document footers |
| Office street addresses in Akure and Akungba Akoko, and map links | CMS: Site settings > Offices |
| Office hours | CMS: Site settings |
| Registration status and CAC registration number | CMS: Site settings > Registration; document footers; receipts |
| Bank name, account name, account number, Swift code | CMS: Site settings > Bank details; donation flyer; donation letter |
| Online giving link (Paystack or Flutterwave payment page) | CMS: Site settings > Online giving |
| Social media profile links (only once active) | CMS: Site settings > Social media; business cards |
| Website domain | `SITE_URL` in Vercel; `public/admin/config.yml`; print materials; email signature |
| Jumoke O. Kolade's biography, founder's story and LinkedIn link | CMS: Site settings > Founder page |
| Approval of the draft founder's message | CMS: Site settings > Founder page |
| Board of trustees names and roles | Impact page (`lib/pages.mjs`, Governance card) |
| Safeguarding Lead and Safeguarding Trustee names and contacts | Safeguarding page and policy |
| Verified impact figures | CMS: Site settings > Impact figures (leave empty until verified) |
| Programme status (Planned, Pilot, Active) | CMS: Programmes |

## Before going live

- [ ] Replace every placeholder above
- [ ] Review the four sample stories: adapt and untick "Sample article", or delete them
- [ ] Have a Nigerian legal practitioner review the privacy notice, safeguarding statement and agreement templates
- [ ] Board adopts the safeguarding, privacy, code of conduct, conflict of interest and financial accountability policies
- [ ] Set up Resend and test every form end to end on the live site
- [ ] Set up the content manager and test publishing a draft story
- [ ] Confirm usage rights for the studio portrait with JayFlash Studios
- [ ] Connect the custom domain and set `SITE_URL`
- [ ] Run `npm test` and confirm all checks pass
- [ ] Test on a low-end Android phone over mobile data, in light and dark mode

## After launch

- [ ] Submit the sitemap in Google Search Console
- [ ] Share the site with partners using the one-page profile and overview presentation
- [ ] Publish the first real story within the first month

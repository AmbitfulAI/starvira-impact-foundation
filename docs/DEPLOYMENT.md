# Deployment guide (Vercel)

## 1. Put the code on GitHub

1. Create a new repository named `starvira-impact-foundation` on GitHub (private is fine).
2. From this folder:
   ```bash
   git init && git add . && git commit -m "Initial website"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/starvira-impact-foundation.git
   git push -u origin main
   ```

## 2. Create the Vercel project

1. Sign in at vercel.com with GitHub and choose **Add New > Project**, then import the repository.
2. Framework preset: **Other**. Vercel reads `vercel.json`: build command `node build.mjs`, output `dist`. No install step is needed.
3. Deploy. You will get an address such as `starvira-impact-foundation.vercel.app`.

## 3. Environment variables

In **Project Settings > Environment Variables**, add the values from `.env.example`:

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | The live address, for example `https://www.starvira.org` |
| `RESEND_API_KEY`, `FORMS_TO_EMAIL`, `FORMS_FROM_EMAIL` | Email delivery for forms. Create a free Resend account, verify your domain, and create an API key |
| `PUBLIC_CONTACT_EMAIL` | Shown to visitors if form delivery fails |
| `TURNSTILE_SECRET_KEY` | Optional spam protection. Add the matching site key in `content/site.json` |
| `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET` | Content manager sign-in (see CMS-SETUP.md) |

Redeploy after adding variables. Until the email variables are set, forms honestly tell visitors that the message was not sent and show the contact email.

## 4. Custom domain

1. Buy a domain (for example a `.org` or `.org.ng` address) from a registrar.
2. In Vercel: **Project Settings > Domains > Add**, enter the domain, and follow the DNS instructions (an `A` record to Vercel for the root domain and a `CNAME` for `www`).
3. Set `SITE_URL` to the new address and redeploy. HTTPS is automatic.
4. Update `public/admin/config.yml` (`base_url`, `site_url`, `display_url`) to the new domain.

## 5. Scheduled stories

Stories with a future date publish automatically on the next build. To rebuild daily, create a Vercel Deploy Hook (**Settings > Git > Deploy Hooks**) and add it to GitHub as the secret `VERCEL_DEPLOY_HOOK_URL`. The workflow in `.github/workflows/scheduled-rebuild.yml` does the rest.

## Other hosts

Netlify or Cloudflare Pages can serve `dist/` with build command `node build.mjs`. The `api/` functions are written for Vercel's Node runtime; on another host, adapt them to that host's function format or point `forms.endpoint` in `content/site.json` to a form service.

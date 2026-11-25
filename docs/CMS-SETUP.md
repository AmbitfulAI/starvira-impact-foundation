# Content manager setup (Decap CMS)

The content manager lives at `https://YOUR-DOMAIN/admin`. Editors sign in with a GitHub account. Every change is saved as a commit to the repository, and Vercel rebuilds the site automatically within a minute or two.

## One-time setup

1. **Create a GitHub OAuth App:** GitHub > Settings > Developer settings > OAuth Apps > New OAuth App.
   - Homepage URL: `https://YOUR-DOMAIN`
   - Authorization callback URL: `https://YOUR-DOMAIN/api/callback`
2. Copy the Client ID and generate a Client Secret. Add them in Vercel as `GITHUB_OAUTH_CLIENT_ID` and `GITHUB_OAUTH_CLIENT_SECRET`, then redeploy.
3. Edit `public/admin/config.yml`:
   - `repo:` your `username/starvira-impact-foundation`
   - `base_url:` and `site_url:` your live address
4. Give each editor access: add them as collaborators on the GitHub repository (Settings > Collaborators). Each editor needs a free GitHub account.

If the repository is public, you can set `GITHUB_OAUTH_SCOPE=public_repo,user` to request narrower permissions.

## Editorial workflow

The content manager uses three columns: **Drafts**, **In review** and **Ready**. Nothing is published until an item is moved to Ready and **Publish** is pressed. This gives the Foundation a simple approval step.

---
title: "Deploying to GitHub Pages or Netlify"
date: "September 25, 2026"
category: "Guide"
---

quietfolio works on any host. There are two common setups.

## Netlify, Vercel or any Node host

Connect the repository and set `NEXT_PUBLIC_SITE_URL` to your domain. Security headers and the content-security policy are applied in this mode.

## GitHub Pages

Pages serves static files, so the project builds a static export. One command does it:

```
npm run deploy:pages
```

That publishes to the `gh-pages` branch. Then enable Pages for that branch in the repository settings. Static hosts can't set custom headers, so prefer Netlify or Vercel for a production site.

## Before you go live

- Replace all sample content and images.
- Set your real email in `lib/data.ts`; it is also used for `security.txt`.
- Turn off the `NEXT_PUBLIC_NOINDEX` flag if this is your real site.

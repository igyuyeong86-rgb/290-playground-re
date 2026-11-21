---
title: "How the SEO and AEO setup works"
date: "September 28, 2026"
category: "Guide"
---

Search engines and AI answer engines both read the same signals: clean HTML, accurate metadata and structured data. quietfolio ships all of them by default.

## For search engines

- Per-page titles, descriptions and canonical URLs.
- Open Graph and Twitter cards, with a generated image for every post.
- A sitemap, `robots.txt`, RSS feed and web manifest.

## For answer engines

JSON-LD describes you as a `Person`, your pages as `TechArticle` and `BlogPosting`, and adds breadcrumbs. `/llms.txt` and `/llms-full.txt` give language models a clean Markdown view of the whole site.

## Checking it

After deploying, run a page through the Rich Results Test, submit the sitemap in Search Console, and run Lighthouse. The template scores 100 on SEO, accessibility and best practices out of the box.

# Pattypan SEO Setup

Pattypan is still a mobile-first product, but `https://pattypan.ca` should be crawlable and ready for Google Search Console.

## Production URLs

- Sitemap: `https://pattypan.ca/sitemap.xml`
- Robots: `https://pattypan.ca/robots.txt`
- Canonical home URL: `https://pattypan.ca/`

## Indexed Routes

Include only public informational routes:

- `/`
- `/library`
- `/privacy`
- `/terms`
- `/support`

These routes are listed in `public/sitemap.xml`. The Expo web build copies the file into `dist/sitemap.xml` through `scripts/prepare-web-seo.mjs`.

`scripts/prepare-web-seo.mjs` also writes static informational pages for `/library`, `/privacy`, `/terms`, and `/support` during `npm run build:web` so those sitemap targets return crawlable HTML instead of only the app shell.

## Excluded Routes

Do not add private or auth-only app surfaces to the sitemap:

- sign in / sign up form steps
- onboarding
- profile
- private garden data
- plant instances owned by a user
- diagnosis history
- dynamic user pages
- account or billing settings

These are intentionally omitted because they either require a signed-in user or contain personal garden/account data.

## Robots Strategy

`public/robots.txt` allows indexing and points crawlers to the production sitemap:

```txt
User-agent: *
Allow: /

Sitemap: https://pattypan.ca/sitemap.xml
```

## Metadata

`npm run build:web` runs Expo export and then `scripts/prepare-web-seo.mjs`, which injects:

- title
- description
- canonical URL
- favicon
- theme color
- OpenGraph basics
- Twitter card basics

Current default title:

`Pattypan | Your Garden Companion`

Current default description:

`Pattypan is a mobile-first garden companion for weather-aware plant care, photo memory, diagnosis, and garden planning.`

## Google Search Console Submission

1. Open Google Search Console.
2. Add or select the property for `pattypan.ca`.
3. Verify the domain using the method Google recommends.
4. Go to **Sitemaps**.
5. Submit `https://pattypan.ca/sitemap.xml`.
6. After deployment, use URL Inspection for:
   - `https://pattypan.ca/`
   - `https://pattypan.ca/library`
   - `https://pattypan.ca/privacy`
   - `https://pattypan.ca/terms`
   - `https://pattypan.ca/support`

## Verification

After every SEO-related change:

```bash
npm run check
npm run build:web
```

Then verify the exported files exist:

- `dist/sitemap.xml`
- `dist/robots.txt`
- `dist/favicon.svg`
- `dist/index.html`

In production, verify:

- `https://pattypan.ca/sitemap.xml`
- `https://pattypan.ca/robots.txt`

The response body for `sitemap.xml` must begin with:

```xml
<?xml version="1.0" encoding="UTF-8"?>
```

If it returns the Expo `index.html`, the SPA fallback is intercepting static files. `vercel.json` excludes `sitemap.xml`, `robots.txt`, `favicon.svg`, Expo assets, and static public informational pages from the catch-all app rewrite, and sets explicit content-type headers for sitemap and robots.

## Remaining Limitations

Pattypan currently ships primarily as an Expo single-page app. The SEO build step now creates lightweight static public pages for the sitemap routes, but the privacy policy, terms, support content, and public Library articles are starter copy only. A future public-content layer should replace these with final legal/support copy and richer indexable Library content.

# Promise Gold & Diamonds – Astro static site

## Deploy to Hostinger (no Node needed on the server)
1. Hostinger hPanel → Files → File Manager → `public_html`.
2. Back up / remove the old site files (the old WordPress site, if any).
3. Upload the CONTENTS of `dist/` (index.html, 404.html, _astro/, img/, .htaccess, favicon.svg, robots.txt, sitemap.xml) — or upload `promise-gd-hostinger.zip` and click Extract.
4. Make sure `.htaccess` came along (enable "show hidden files").

## Sharing (WhatsApp / Facebook / X)
The share card is `public/og-image.jpg` (1200x630, 63 KB) with full Open Graph + Twitter tags.
WhatsApp caches previews: after going live, test with https://developers.facebook.com/tools/debug/ (click "Scrape Again"),
or share the link once as `https://promisegd.com/?v=2` to force a fresh preview.

## Edit & rebuild (on your own computer, Node 18+)
    npm install
    npm run dev      # live preview
    npm run build    # outputs /dist

Business details, services, values and the optional gold rate live in `src/config.js`.

SDB WEB STUDIO — GOOGLE INDEXING FILES

1. Check your existing GitHub repo: if robots.txt or sitemap.xml already exists, compare
   it with these examples first. Do not overwrite a more complete working sitemap.
2. Add robots.txt and sitemap.xml to the PUBLISHED ROOT of your Cloudflare Pages build,
   alongside the published index.html. For a simple static GitHub Pages project this
   is often the same folder as index.html; for build-based projects it may be public/.
3. Commit the files to your production branch (such as main). Allow the existing
   Cloudflare Pages Git integration to deploy them.
4. Visit https://sdbwebstudio.pages.dev/robots.txt
   and https://sdbwebstudio.pages.dev/sitemap.xml and check the content.
5. In https://search.google.com/search-console/ choose the URL-prefix property
   https://sdbwebstudio.pages.dev/ and open Sitemaps. Submit sitemap.xml.
6. Use URL Inspection -> Test Live URL on the homepage and main pages. If eligible,
   Request Indexing once. If quota is exceeded, try another day.
7. Check Google Search Console > Pages for excluded URL reasons; ensure your
   production URL is not blocked by robots.txt, a meta noindex tag, or an
   X-Robots-Tag: noindex response header.

These files help discovery, not guaranteed indexing or rankings.

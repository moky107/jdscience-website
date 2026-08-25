const SITE = "https://www.jdscience.co.uk";

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderPublicPage({
  title,
  description,
  canonicalPath,
  heading,
  lede,
  bodyHtml,
  jsonLd,
  breadcrumbs = [],
}) {
  const canonical = `${SITE}${canonicalPath}`;
  const crumbJson = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      ...breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: crumb.name,
        item: `${SITE}${crumb.path}`,
      })),
    ],
  };
  const graphs = [crumbJson, ...(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [])];

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <link rel="alternate" hreflang="en-GB" href="${escapeHtml(canonical)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="JD Science" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${SITE}/og-image.png" />
  <meta property="og:locale" content="en_GB" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <script type="application/ld+json">${JSON.stringify(graphs)}</script>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #0f172a; background: #f8fafc; }
    a { color: #0f766e; }
    .top { background: #004d40; color: #fff; padding: 22px 18px 28px; }
    .top a { color: #99f6e4; }
    .wrap { max-width: 920px; margin: 0 auto; }
    .crumbs { font-size: 13px; margin-bottom: 12px; }
    .crumbs a { color: #ccfbf1; }
    h1 { margin: 0 0 10px; font-size: 34px; line-height: 1.15; }
    .lede { color: #ccfbf1; line-height: 1.6; max-width: 760px; }
    main { max-width: 920px; margin: 0 auto; padding: 28px 18px 72px; }
    h2 { color: #004d40; margin: 32px 0 10px; }
    h3 { margin: 20px 0 8px; }
    p, li { line-height: 1.65; color: #334155; }
    ul { padding-left: 20px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    .card { display: block; background: #fff; border: 1px solid #d9e2ec; border-radius: 14px; padding: 16px; text-decoration: none; color: inherit; box-shadow: 0 6px 16px rgba(15,23,42,.05); }
    .card strong { display: block; color: #0f172a; margin-bottom: 6px; }
    .callout { background: #ecfeff; border-left: 4px solid #0f766e; padding: 12px 14px; margin: 0 0 18px; color: #134e4a; }
    .download { display: inline-block; margin: 8px 0 18px; font-weight: 700; }
    footer.site { background: #0f172a; color: #cbd5e1; padding: 22px 18px; }
    footer.site a { color: #99f6e4; }
  </style>
</head>
<body>
  <header class="top">
    <div class="wrap">
      <nav class="crumbs"><a href="/">JD Science</a> · <a href="/about/">About</a> · <a href="/terms/">Terms</a> · <a href="/resources/">Resources</a> · <a href="/tutors/joseph-danso/">Joseph Danso</a> · <a href="/papers">Past papers</a></nav>
      ${breadcrumbs.length ? `<nav class="crumbs">${[{ name: "Home", path: "/" }, ...breadcrumbs].map((crumb, index, list) => `${index ? " → " : ""}<a href="${escapeHtml(crumb.path)}">${escapeHtml(crumb.name)}</a>`).join("")}</nav>` : ""}
      <h1>${escapeHtml(heading)}</h1>
      <p class="lede">${escapeHtml(lede)}</p>
    </div>
  </header>
  <main>
    ${bodyHtml}
  </main>
  <footer class="site">
    <div class="wrap">
      <a href="/">JD Science</a> ·
      <a href="/about/">About</a> ·
      <a href="/terms/">Terms</a> ·
      <a href="/tutors/joseph-danso/">Joseph Danso</a> ·
      <a href="/resources/">Resources</a> ·
      <a href="mailto:info@jdscience.co.uk">info@jdscience.co.uk</a>
    </div>
  </footer>
</body>
</html>
`;
}

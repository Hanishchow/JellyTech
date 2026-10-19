// Runs after `vite build` for the GitHub Pages build.
//
// GitHub Pages serves 404.html with a 404 status, so a deep link like /about
// that relies on it never indexes. Writing a real dist/<route>/index.html per
// public route makes Pages answer 200, and gives each page its own head.
// Also writes sitemap.xml, robots.txt and the Content-Security-Policy, which is
// injected here and not in index.html so the dev server's inline HMR script is
// not blocked.

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const config = JSON.parse(readFileSync(join(root, "src/lib/seo-routes.json"), "utf8"));
const site = (process.env.SITE_URL ?? config.site).replace(/\/+$/, "");
const basePath = new URL(site).pathname.replace(/\/+$/, "");

if (!existsSync(join(dist, "index.html"))) {
  console.error("postbuild-seo: dist/index.html not found. Run the build first.");
  process.exit(1);
}

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.insforge.app wss://*.insforge.app",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const template = readFileSync(join(dist, "index.html"), "utf8");

function setAttrTag(html, tagRe, attr, value) {
  const re = new RegExp(`(${tagRe})`, "i");
  if (!re.test(html)) throw new Error(`postbuild-seo: missing ${tagRe} in index.html`);
  return html.replace(re, (tag) =>
    tag.replace(new RegExp(`${attr}="[^"]*"`), `${attr}="${esc(value)}"`)
  );
}

function render(html, { title, description, url, robots }) {
  let out = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  out = setAttrTag(out, '<meta name="description"[^>]*>', "content", description);
  out = setAttrTag(out, '<meta name="robots"[^>]*>', "content", robots);
  out = setAttrTag(out, '<link rel="canonical"[^>]*>', "href", url);
  out = setAttrTag(out, '<meta property="og:title"[^>]*>', "content", title);
  out = setAttrTag(out, '<meta property="og:description"[^>]*>', "content", description);
  out = setAttrTag(out, '<meta property="og:url"[^>]*>', "content", url);
  out = setAttrTag(out, '<meta name="twitter:title"[^>]*>', "content", title);
  out = setAttrTag(out, '<meta name="twitter:description"[^>]*>', "content", description);
  const csp = `<meta http-equiv="Content-Security-Policy" content="${esc(CSP)}" />`;
  // Vite does not rewrite <a href> against the base, so the noscript links need it.
  out = out.replace(/<a href="\//g, `<a href="${basePath}/`);
  return out.replace(/(<meta charset="[^"]*"\s*\/>)/i, `$1\n    ${csp}`);
}

// lastmod should change when the content does, not on every build, so use the
// date of the commit being built and fall back to today outside a git checkout.
let today = new Date().toISOString().slice(0, 10);
try {
  today = execSync("git log -1 --format=%cs", { cwd: root, stdio: ["ignore", "pipe", "ignore"] })
    .toString()
    .trim() || today;
} catch {}
const urls = [];

for (const [route, meta] of Object.entries(config.routes)) {
  // Pages 301s /about to /about/, so the slash form is the canonical one.
  const url = route === "/" ? `${site}/` : `${site}${route}/`;
  const html = render(template, { ...meta, url, robots: "index, follow, max-image-preview:large" });
  if (route === "/") {
    writeFileSync(join(dist, "index.html"), html);
  } else {
    const dir = join(dist, route.slice(1));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), html);
  }
  urls.push(url);
}

// Unknown URLs: the SPA shell, kept out of the index.
writeFileSync(
  join(dist, "404.html"),
  render(template, {
    title: "Page not found | JellyTech",
    description: config.routes["/"].description,
    url: `${site}/`,
    robots: "noindex, nofollow",
  })
);

writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url>\n    <loc>${u}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u === `${site}/` ? "1.0" : "0.7"}</priority>\n  </url>`
      )
      .join("\n") +
    `\n</urlset>\n`
);

writeFileSync(
  join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`
);

console.log(`postbuild-seo: wrote ${urls.length} route pages, 404.html, sitemap.xml, robots.txt for ${site}`);

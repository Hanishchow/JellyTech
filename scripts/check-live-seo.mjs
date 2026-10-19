// Live indexability check. Usage: SITE_URL=https://host/JellyTech node scripts/check-live-seo.mjs
// Exits non-zero on the first class of failure it finds, after listing all of them.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "src/lib/seo-routes.json"), "utf8"));
const site = (process.env.SITE_URL ?? config.site).replace(/\/+$/, "");

const problems = [];
const titles = new Map();

async function get(url, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url, { redirect: "manual" });
    // Pages can take a minute to publish; retry non-200s before calling it a failure.
    if (res.status === 200 || i === attempts - 1) return res;
    await new Promise((r) => setTimeout(r, 15000));
  }
}

const sitemapRes = await get(`${site}/sitemap.xml`);
if (sitemapRes.status !== 200) problems.push(`sitemap.xml returned ${sitemapRes.status}`);
const sitemap = sitemapRes.status === 200 ? await sitemapRes.text() : "";
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locs.length === 0) problems.push("sitemap.xml lists no URLs");

for (const url of locs) {
  const res = await get(url);
  if (res.status !== 200) {
    problems.push(`${url} returned ${res.status}`);
    continue;
  }
  const html = await res.text();
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? "";
  if (!title) problems.push(`${url} has no <title>`);
  else if (titles.has(title)) problems.push(`${url} repeats the title of ${titles.get(title)}`);
  else titles.set(title, url);
  if (!canonical) problems.push(`${url} has no canonical`);
  else if (canonical !== url) problems.push(`${url} canonical is ${canonical}`);
  if (/noindex/i.test(robots)) problems.push(`${url} is marked noindex`);
  if (!/Content-Security-Policy/i.test(html)) problems.push(`${url} has no CSP meta tag`);
}

const robotsRes = await get(`${site}/robots.txt`);
if (robotsRes.status !== 200) problems.push(`robots.txt returned ${robotsRes.status}`);

if (problems.length) {
  console.error(`SEO check failed (${problems.length}):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`SEO check passed: ${locs.length} URLs, unique titles, canonicals, no noindex.`);

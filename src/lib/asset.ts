/**
 * Resolve a path inside `public/` against the deployment's base URL.
 *
 * The site is served from a sub-path on GitHub Pages (`/JellyTech/`) and from
 * the root in development, so a hard-coded `/static/...` is correct in exactly
 * one of those. Vite rewrites such paths inside index.html at build time but
 * cannot see them inside component code, which is what this is for.
 *
 * Pass the path without a leading slash: asset("static/img/emblem-128.png").
 */
export function asset(path: string) {
  return import.meta.env.BASE_URL + path.replace(/^\//, "");
}

import { asset } from "@/lib/asset";

/**
 * Bump when anything under public/static/medusae changes.
 *
 * Those files have fixed names, and GitHub Pages lets a browser keep them for
 * ten minutes, so without a version in the URL a visitor could get the page's
 * new code running against the previous deploy's script. The query string makes
 * the two ship together.
 *
 * Everything that fetches these files (the hero that runs them and the loading
 * screen that preloads them) must use `simUrl`, or the preload downloads one URL
 * and the hero requests another.
 */
export const SIM_VERSION = "2026-10-22";

export function simUrl(path: string) {
  return `${asset(path)}?v=${SIM_VERSION}`;
}

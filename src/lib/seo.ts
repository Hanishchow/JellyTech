import config from "./seo-routes.json";

type RouteMeta = { title: string; description: string };
const routes = config.routes as Record<string, RouteMeta>;

const FALLBACK: RouteMeta = routes["/"];

function normalise(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

function upsert(selector: string, create: () => HTMLElement, set: (el: HTMLElement) => void) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  set(el);
}

function meta(attr: "name" | "property", key: string, content: string) {
  upsert(
    `meta[${attr}="${key}"]`,
    () => {
      const m = document.createElement("meta");
      m.setAttribute(attr, key);
      return m;
    },
    (el) => el.setAttribute("content", content)
  );
}

/** Keeps title, description, canonical and robots in step with the client-side route. */
export function applySeo(pathname: string) {
  const path = normalise(pathname);
  const entry = routes[path];
  const { title, description } = entry ?? FALLBACK;
  const url = config.site + (path === "/" ? "/" : `${path}/`);

  document.title = title;
  meta("name", "description", description);
  meta("name", "robots", entry ? "index, follow, max-image-preview:large" : "noindex, nofollow");
  meta("property", "og:title", title);
  meta("property", "og:description", description);
  meta("property", "og:url", url);
  meta("name", "twitter:title", title);
  meta("name", "twitter:description", description);
  upsert(
    'link[rel="canonical"]',
    () => {
      const l = document.createElement("link");
      l.rel = "canonical";
      return l;
    },
    (el) => el.setAttribute("href", url)
  );
}

/* =============================================================================
   Published content, read by the public pages.

   The admin panel writes these tables; this reads them. Anonymous, and only
   ever the published rows — but note that the filter is not this file's doing.
   `published` is enforced by the RLS policy (`FOR SELECT USING (published)`),
   so a draft is invisible to an anonymous caller even if they query the API
   directly. Adding `.eq("published", true)` here would be belt and braces at
   best and a false sense of security at worst.

   Every function fails soft and returns an empty list. A club site whose
   opportunity calendar is briefly unreachable should show the page without a
   calendar, not an error where the page used to be.
   ============================================================================= */

import { insforge as client } from "@/lib/insforge";

export interface PublishedOpportunity {
  id: string;
  title: string;
  kind: string;
  institution: string | null;
  field: string | null;
  location: string | null;
  starts_on: string | null;
  deadline: string | null;
  cost: string | null;
  eligibility: string | null;
  summary: string | null;
  link: string | null;
}

export interface PublishedPost {
  id: string;
  title: string;
  series: string;
  author: string | null;
  summary: string | null;
  link: string | null;
  published_on: string | null;
}

export interface PublishedTeamMember {
  id: string;
  name: string;
  role: string;
  team: string;
  year: string | null;
  photo_url: string | null;
  sort_order: number;
}

async function read<T>(table: string): Promise<T[]> {
  if (!client) return [];
  try {
    const { data, error } = await client.database.from(table).select();
    if (error) return [];
    return (data ?? []) as T[];
  } catch {
    return [];
  }
}

export const listOpportunities = () =>
  read<PublishedOpportunity>("opportunities").then((rows) =>
    rows.sort((a, b) => (a.starts_on ?? "").localeCompare(b.starts_on ?? ""))
  );

export const listPosts = () =>
  read<PublishedPost>("posts").then((rows) =>
    rows.sort((a, b) => (b.published_on ?? "").localeCompare(a.published_on ?? ""))
  );

let teamRequest: Promise<PublishedTeamMember[]> | null = null;

/** One shared request, so prefetching on hover and rendering the page cost a single round trip. */
export const listTeam = () => {
  teamRequest ??= read<PublishedTeamMember>("team_members").then((rows) => {
    // A failed read comes back empty; do not remember it.
    if (rows.length === 0) teamRequest = null;
    return rows.sort(
      (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)
    );
  });
  return teamRequest;
};

// Held so the browser keeps the downloads going and the decoded images warm.
const warmed = new Map<string, HTMLImageElement>();

export function preloadImages(urls: Array<string | null>) {
  for (const url of urls) {
    if (!url || warmed.has(url)) continue;
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    warmed.set(url, img);
  }
}

/** Start the team list and every face loading, before the page that shows them is open. */
export function prefetchTeam() {
  return listTeam().then((rows) => {
    preloadImages(rows.map((m) => m.photo_url));
    return rows;
  });
}

/** "14 November 2026", or null when there is no date to show. */
export function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* =============================================================================
   The admin surface.

   Deliberately a separate module from lib/backend.ts. That one is imported by
   every public page; this one is imported only by /admin, so the content-
   management code never ends up in the bundle path a visitor exercises, and
   the two cannot drift into one another by accident.

   Nothing here is the security boundary. `isAdmin()` decides what the panel
   *shows*; what the panel can *do* is decided by the RLS policies in
   insforge/migrations/002, which run on the server and answer to the
   SECURITY DEFINER is_admin() function, not to anything in this file. If this
   module lied and rendered the whole panel to a stranger, every write would
   still be refused.
   ============================================================================= */

import type { Member, MemberStatus } from "@/lib/backend";
import { configured, insforge as client } from "@/lib/insforge";

export const adminAvailable = configured;

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  handled: boolean;
  created_at: string;
}

export interface Opportunity {
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
  published: boolean;
}

export interface Post {
  id: string;
  title: string;
  series: string;
  author: string | null;
  summary: string | null;
  body: string | null;
  link: string | null;
  published_on: string | null;
  published: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  team: string;
  year: string | null;
  photo_url: string | null;
  sort_order: number;
  published: boolean;
}

export const OPPORTUNITY_KINDS = [
  "conference",
  "workshop",
  "visit",
  "hackathon",
  "course",
  "lecture",
  "other",
] as const;

export const POST_SERIES = [
  "GeneScene: Paper of the Week",
  "Biotech News",
  "Lab Myths vs. Facts",
  "Careers in Biotech",
  "Conference Diaries",
  "Research Breakdown",
  "Plasmid Podcast",
  "Publication",
] as const;

export const TEAMS = [
  "Core",
  "Student Welfare, Conferences & Outreach",
  "Alumni",
  "Cultural & Engagement",
  "Media",
  "Editorial & Design",
  "Hackathons & Technical",
  "Logistics & Transportation",
  "Finance",
] as const;

function db() {
  if (!client) throw new Error("The backend is not configured in this build.");
  return client.database;
}

function fail(error: unknown, fallback: string): never {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message: unknown }).message)
        : fallback;
  throw new Error(message);
}

/**
 * Whether the signed-in account is an admin.
 *
 * Asks the database rather than trusting anything local: `admins` only ever
 * returns the caller's own row, so a hit means the server agrees.
 */
export async function isAdmin(): Promise<boolean> {
  if (!client) return false;
  const { data: session } = await client.auth.getCurrentUser();
  const id = session?.user?.id;
  if (!id) return false;
  const { data, error } = await db().from("admins").select().eq("id", id);
  if (error) return false;
  return (data ?? []).length > 0;
}

/* --- the roll ------------------------------------------------------------- */

export async function listMembers(): Promise<Member[]> {
  const { data, error } = await db().from("members").select();
  if (error) fail(error, "Could not read the roll.");
  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    usn: (row.usn as string) ?? undefined,
    department: row.department as Member["department"],
    year: String(row.year),
    interests: (row.interests ?? []) as Member["interests"],
    motivation: (row.motivation as string) ?? undefined,
    status: row.status as MemberStatus,
    createdAt: String(row.created_at),
  }));
}

export async function setMemberStatus(id: string, status: MemberStatus) {
  const { error } = await db().from("members").update({ status }).eq("id", id);
  if (error) fail(error, "Could not update the member.");
}

/* --- the inbox ------------------------------------------------------------ */

export async function listEnquiries(): Promise<Enquiry[]> {
  const { data, error } = await db().from("messages").select();
  if (error) fail(error, "Could not read the inbox.");
  return (data ?? []) as Enquiry[];
}

export async function setEnquiryHandled(id: string, handled: boolean) {
  const { error } = await db().from("messages").update({ handled }).eq("id", id);
  if (error) fail(error, "Could not update the enquiry.");
}

/* --- content -------------------------------------------------------------- */

type Table = "opportunities" | "posts" | "team_members";

export async function listAll<T>(table: Table): Promise<T[]> {
  const { data, error } = await db().from(table).select();
  if (error) fail(error, `Could not read ${table}.`);
  return (data ?? []) as T[];
}

export async function createRow<T>(table: Table, row: Partial<T>) {
  const { error } = await db().from(table).insert(row as Record<string, unknown>);
  if (error) fail(error, `Could not create the ${table} entry.`);
}

export async function updateRow<T>(table: Table, id: string, patch: Partial<T>) {
  const { error } = await db()
    .from(table)
    .update(patch as Record<string, unknown>)
    .eq("id", id);
  if (error) fail(error, `Could not update the ${table} entry.`);
}

export async function deleteRow(table: Table, id: string) {
  const { error } = await db().from(table).delete().eq("id", id);
  if (error) fail(error, `Could not delete the ${table} entry.`);
}

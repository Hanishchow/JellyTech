"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Member, MemberStatus } from "@/lib/backend";
import {
  OPPORTUNITY_KINDS,
  POST_SERIES,
  TEAMS,
  adminAvailable,
  createRow,
  deleteRow,
  isAdmin,
  listAll,
  listEnquiries,
  listMembers,
  setEnquiryHandled,
  setMemberStatus,
  updateRow,
  type Enquiry,
  type Opportunity,
  type Post,
  type TeamMember,
} from "@/lib/admin";
import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
   The panel. Noir: no violet, no colour at all beyond white, black and the
   greys between them.

   That is a deliberate break from the public site rather than a second brand.
   The site is the club's front of house and is lit accordingly; this is the
   back office, and the one thing a back office must never do is make a
   destructive control look inviting. Stripping the colour means the only
   things that draw the eye are the words and the state of the data, and
   "delete" cannot borrow the brand's glow to look friendly.

   It is also much denser than the public pages. A management screen is read by
   someone scanning for one row, not by a visitor being introduced to an idea,
   so the type comes down to 13-14px and the rules come closer together.
   -------------------------------------------------------------------------- */

type Tab = "applications" | "enquiries" | "opportunities" | "posts" | "team";

const TABS: { id: Tab; label: string }[] = [
  { id: "applications", label: "Applications" },
  { id: "enquiries", label: "Enquiries" },
  { id: "opportunities", label: "Opportunities" },
  { id: "posts", label: "Media" },
  { id: "team", label: "Team" },
];

const noirField =
  "w-full border border-white/20 bg-black px-3 py-2 text-[13px] text-white placeholder:text-white/30 focus:border-white focus:outline-none";
const noirLabel =
  "font-mono text-[10px] uppercase tracking-[0.14em] text-white/45";
const noirButton =
  "border border-white/25 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-white/80 transition-colors hover:border-white hover:bg-white hover:text-black disabled:opacity-40";
const noirDanger =
  "border border-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-white/40 transition-colors hover:border-white/70 hover:text-white disabled:opacity-40";

export function AdminPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("applications");

  useEffect(() => {
    let cancelled = false;
    isAdmin()
      .then((ok) => !cancelled && setAllowed(ok))
      .catch(() => !cancelled && setAllowed(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (allowed === null) {
    return <Shell><p className="text-white/40">Checking…</p></Shell>;
  }

  if (!allowed) {
    return (
      <Shell>
        <h1 className="font-mono text-2xl tracking-[0.1em]">No access</h1>
        <p className="mt-4 max-w-md text-[13px] leading-relaxed text-white/50">
          This account is not an administrator.{" "}
          <Link to="/login" className="text-white underline underline-offset-4">
            Sign in
          </Link>{" "}
          with one that is.
          {!adminAvailable &&
            " (This build has no backend configured, so nothing can be checked.)"}
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-white/15 pb-4">
        <h1 className="font-mono text-lg tracking-[0.16em]">JellyTech · Admin</h1>
        <Link
          to="/"
          className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/40 hover:text-white"
        >
          View site
        </Link>
      </header>

      <nav className="flex flex-wrap gap-px border-b border-white/15 bg-white/15">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
              tab === t.id
                ? "bg-white text-black"
                : "bg-black text-white/55 hover:text-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="pt-8">
        {tab === "applications" && <Applications />}
        {tab === "enquiries" && <Enquiries />}
        {tab === "opportunities" && <Opportunities />}
        {tab === "posts" && <Posts />}
        {tab === "team" && <Team />}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-black text-white">
      {/* The panel owns the whole viewport: no site navbar, no footer, no
          jellyfish. Being somewhere else is the point. */}
      <div className="mx-auto max-w-[84rem] space-y-6 px-6 py-10">{children}</div>
    </div>
  );
}

/** Everything here loads the same way, so the wiring lives in one place. */
function useRows<T>(load: () => Promise<T[]>) {
  const [rows, setRows] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  const refresh = useCallback(() => {
    setBusy(true);
    load()
      .then((next) => {
        setRows(next);
        setError(null);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Could not load.")
      )
      .finally(() => setBusy(false));
  }, [load]);

  useEffect(refresh, [refresh]);
  return { rows, error, busy, refresh };
}

function Feedback({ error, busy, empty }: { error: string | null; busy: boolean; empty: boolean }) {
  if (busy) return <p className="text-[13px] text-white/40">Loading…</p>;
  if (error) return <p className="text-[13px] text-white">{error}</p>;
  if (empty) return <p className="text-[13px] text-white/40">Nothing here yet.</p>;
  return null;
}

/* --- applications --------------------------------------------------------- */

const STATUSES: MemberStatus[] = ["applied", "active", "alumni", "declined"];

function Applications() {
  const { rows, error, busy, refresh } = useRows<Member>(listMembers);

  async function move(id: string, status: MemberStatus) {
    await setMemberStatus(id, status);
    refresh();
  }

  return (
    <section className="space-y-4">
      <Feedback error={error} busy={busy} empty={rows.length === 0} />
      {rows.map((m) => (
        <article key={m.id} className="border border-white/15 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-base">
              {m.name}{" "}
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/40">
                {m.status}
              </span>
            </h2>
            <span className="font-mono text-[11px] text-white/35">
              {new Date(m.createdAt).toLocaleDateString()}
            </span>
          </div>

          <dl className="mt-3 grid gap-x-8 gap-y-1 text-[13px] text-white/60 sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className={noirLabel}>Email</dt><dd>{m.email}</dd></div>
            <div><dt className={noirLabel}>USN</dt><dd>{m.usn ?? "—"}</dd></div>
            <div><dt className={noirLabel}>Department</dt><dd>{m.department}</dd></div>
            <div><dt className={noirLabel}>Year</dt><dd>{m.year}</dd></div>
          </dl>

          {m.interests.length > 0 && (
            <p className="mt-3 text-[13px] text-white/50">
              <span className={noirLabel}>Interests </span>
              {m.interests.join(", ")}
            </p>
          )}
          {m.motivation && (
            <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-white/50">
              {m.motivation}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {STATUSES.filter((s) => s !== m.status).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => move(m.id, s)}
                className={s === "declined" ? noirDanger : noirButton}
              >
                Mark {s}
              </button>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

/* --- enquiries ------------------------------------------------------------ */

function Enquiries() {
  const { rows, error, busy, refresh } = useRows<Enquiry>(listEnquiries);

  return (
    <section className="space-y-4">
      <Feedback error={error} busy={busy} empty={rows.length === 0} />
      {rows.map((e) => (
        <article
          key={e.id}
          className={cn("border p-5", e.handled ? "border-white/10 opacity-50" : "border-white/15")}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-base">
              {e.subject}{" "}
              <span className="font-mono text-[11px] text-white/40">· {e.name}</span>
            </h2>
            <span className="font-mono text-[11px] text-white/35">
              {new Date(e.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-1 font-mono text-[11px] text-white/40">{e.email}</p>
          <p className="mt-3 max-w-2xl whitespace-pre-wrap text-[13px] leading-relaxed text-white/60">
            {e.body}
          </p>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              className={noirButton}
              onClick={async () => {
                await setEnquiryHandled(e.id, !e.handled);
                refresh();
              }}
            >
              {e.handled ? "Reopen" : "Mark handled"}
            </button>
            <a className={noirButton} href={`mailto:${e.email}?subject=Re: ${e.subject}`}>
              Reply by email
            </a>
          </div>
        </article>
      ))}
    </section>
  );
}

/* --- content editors ------------------------------------------------------ */

interface FieldSpec {
  name: string;
  label: string;
  type?: "text" | "date" | "textarea" | "select" | "number";
  options?: readonly string[];
  full?: boolean;
}

/**
 * One editor drives all three content tables. They differ only in their
 * columns, so the alternative was three near-identical components that drift.
 */
function Editor<T extends { id: string; published: boolean }>({
  table,
  fields,
  title,
  describe,
  blank,
}: {
  table: "opportunities" | "posts" | "team_members";
  fields: FieldSpec[];
  title: string;
  describe: (row: T) => string;
  blank: Partial<T>;
}) {
  const load = useCallback(() => listAll<T>(table), [table]);
  const { rows, error, busy, refresh } = useRows<T>(load);
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError(null);
    const data = new FormData(event.currentTarget);
    const patch: Record<string, unknown> = {};
    for (const f of fields) {
      const raw = String(data.get(f.name) ?? "").trim();
      patch[f.name] =
        raw === "" ? null : f.type === "number" ? Number(raw) : raw;
    }
    patch.published = data.get("published") === "on";

    try {
      const id = (editing as T | null)?.id;
      if (id) await updateRow<T>(table, id, patch as Partial<T>);
      else await createRow<T>(table, patch as Partial<T>);
      setEditing(null);
      refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save.");
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">
          {title} · {rows.length}
        </h2>
        <button type="button" className={noirButton} onClick={() => setEditing(blank)}>
          New
        </button>
      </div>

      {editing && (
        <form onSubmit={save} className="space-y-4 border border-white bg-white/[0.03] p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <label key={f.name} className={cn("block", f.full && "sm:col-span-2")}>
                <span className={noirLabel}>{f.label}</span>
                {f.type === "textarea" ? (
                  <textarea
                    name={f.name}
                    rows={4}
                    defaultValue={String((editing as Record<string, unknown>)[f.name] ?? "")}
                    className={cn(noirField, "mt-1.5 resize-y")}
                  />
                ) : f.type === "select" ? (
                  <select
                    name={f.name}
                    defaultValue={String((editing as Record<string, unknown>)[f.name] ?? f.options?.[0] ?? "")}
                    className={cn(noirField, "mt-1.5")}
                  >
                    {f.options?.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={f.name}
                    type={f.type ?? "text"}
                    defaultValue={String((editing as Record<string, unknown>)[f.name] ?? "")}
                    className={cn(noirField, "mt-1.5")}
                  />
                )}
              </label>
            ))}
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="published"
              defaultChecked={Boolean((editing as Record<string, unknown>).published)}
              className="h-4 w-4 accent-white"
            />
            <span className={noirLabel}>
              Published (visible on the public site)
            </span>
          </label>

          {saveError && <p className="text-[13px] text-white">{saveError}</p>}

          <div className="flex gap-2">
            <button type="submit" className={noirButton}>Save</button>
            <button type="button" className={noirDanger} onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <Feedback error={error} busy={busy} empty={rows.length === 0} />

      <ul className="divide-y divide-white/10 border-y border-white/10">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-3 py-3">
            <span className="text-[13px]">
              <span
                className={cn(
                  "mr-3 font-mono text-[10px] uppercase tracking-[0.1em]",
                  row.published ? "text-white" : "text-white/30"
                )}
              >
                {row.published ? "live" : "draft"}
              </span>
              {describe(row)}
            </span>
            <span className="flex gap-2">
              <button type="button" className={noirButton} onClick={() => setEditing(row)}>
                Edit
              </button>
              <button
                type="button"
                className={noirDanger}
                onClick={async () => {
                  // No modal: a one-line window.confirm is the honest amount of
                  // ceremony for deleting a draft, and a custom dialog here
                  // would be decoration pretending to be safety.
                  if (!window.confirm(`Delete "${describe(row)}"? This cannot be undone.`)) return;
                  await deleteRow(table, row.id);
                  refresh();
                }}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Opportunities() {
  return (
    <Editor<Opportunity>
      table="opportunities"
      title="Opportunity calendar"
      blank={{ kind: "conference", published: false } as Partial<Opportunity>}
      describe={(o) => `${o.title}${o.institution ? ` · ${o.institution}` : ""}`}
      fields={[
        { name: "title", label: "Title", full: true },
        { name: "kind", label: "Kind", type: "select", options: OPPORTUNITY_KINDS },
        { name: "institution", label: "Institution" },
        { name: "field", label: "Field" },
        { name: "location", label: "Location" },
        { name: "starts_on", label: "Starts on", type: "date" },
        { name: "deadline", label: "Registration deadline", type: "date" },
        { name: "cost", label: "Cost" },
        { name: "eligibility", label: "Eligibility" },
        { name: "link", label: "Link", full: true },
        { name: "summary", label: "Summary", type: "textarea", full: true },
      ]}
    />
  );
}

function Posts() {
  return (
    <Editor<Post>
      table="posts"
      title="Media"
      blank={{ series: "Biotech News", published: false } as Partial<Post>}
      describe={(p) => `${p.title} · ${p.series}`}
      fields={[
        { name: "title", label: "Title", full: true },
        { name: "series", label: "Series", type: "select", options: POST_SERIES },
        { name: "author", label: "Author" },
        { name: "published_on", label: "Date", type: "date" },
        { name: "link", label: "External link" },
        { name: "summary", label: "Summary", type: "textarea", full: true },
        { name: "body", label: "Body", type: "textarea", full: true },
      ]}
    />
  );
}

function Team() {
  return (
    <Editor<TeamMember>
      table="team_members"
      title="Team"
      blank={{ team: "Core", sort_order: 100, published: false } as Partial<TeamMember>}
      describe={(t) => `${t.name} · ${t.role} · ${t.team}`}
      fields={[
        { name: "name", label: "Name" },
        { name: "role", label: "Role" },
        { name: "team", label: "Team", type: "select", options: TEAMS },
        { name: "year", label: "Year" },
        { name: "photo_url", label: "Photo URL", full: true },
        { name: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  );
}

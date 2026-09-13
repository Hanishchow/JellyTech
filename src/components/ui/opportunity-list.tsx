"use client";

import { useEffect, useState } from "react";
import {
  formatDate,
  listOpportunities,
  type PublishedOpportunity,
} from "@/lib/content";
import { Note } from "@/components/layout/editorial";

/**
 * The live Opportunity Calendar.
 *
 * Until the club publishes its first entry this renders the same honest note
 * the page carried before, rather than an empty table pretending to be a
 * feature. The moment something is published from the admin panel, the note is
 * replaced by the real thing with no code change.
 */
export function OpportunityList() {
  const [rows, setRows] = useState<PublishedOpportunity[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listOpportunities().then((next) => !cancelled && setRows(next));
    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing is rendered while loading: a flash of "no opportunities yet"
  // followed by a list is worse than a beat of nothing.
  if (rows === null) return null;

  if (rows.length === 0) {
    return (
      <Note>
        The calendar is maintained by the Conferences &amp; Outreach team.
        Entries appear here once the first cycle of opportunities has been
        evaluated and approved.
      </Note>
    );
  }

  return (
    <ol className="border-t border-rule">
      {rows.map((o) => {
        const starts = formatDate(o.starts_on);
        const deadline = formatDate(o.deadline);
        return (
          <li
            key={o.id}
            className="grid gap-3 border-b border-rule py-8 md:grid-cols-[14rem_1fr] md:gap-10"
          >
            <div>
              <p className="label">{o.kind}</p>
              {starts && <p className="mt-2 font-mono text-sm text-ink">{starts}</p>}
              {deadline && (
                <p className="mt-1 font-mono text-xs text-signal">
                  Apply by {deadline}
                </p>
              )}
            </div>

            <div>
              <h3 className="font-display text-2xl">{o.title}</h3>
              {(o.institution || o.location) && (
                <p className="mt-1 text-sm text-ink-muted">
                  {[o.institution, o.location].filter(Boolean).join(", ")}
                </p>
              )}
              {o.summary && (
                <p className="measure mt-3 text-ink-muted">{o.summary}</p>
              )}

              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm text-ink-muted">
                {o.field && (
                  <div>
                    <dt className="label">Field</dt>
                    <dd>{o.field}</dd>
                  </div>
                )}
                {o.eligibility && (
                  <div>
                    <dt className="label">Eligibility</dt>
                    <dd>{o.eligibility}</dd>
                  </div>
                )}
                {o.cost && (
                  <div>
                    <dt className="label">Cost</dt>
                    <dd>{o.cost}</dd>
                  </div>
                )}
              </dl>

              {o.link && (
                <a
                  href={o.link}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 inline-block text-glow-bright underline underline-offset-4"
                >
                  Details
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

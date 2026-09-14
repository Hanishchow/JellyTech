"use client";

import { Masthead, Page, Section, Index, Plates } from "@/components/layout/editorial";
import { TeamSphere } from "@/components/ui/team-sphere";
import { ROLES } from "@/lib/teams";

const DECISIONS = [
  { term: "Team decisions", detail: "Routine operational decisions within a team's own responsibilities. No approval needed." },
  { term: "Inter-team coordination", detail: "Team leads coordinate directly for multi-team activities, without micromanagement from above." },
  { term: "Executive decisions", detail: "Club Head and Core Team handle collaborations, external representation and major programs." },
  { term: "Faculty approval", detail: "Faculty and college approval wherever institutional policy requires it." },
];

const FINANCE = [
  { term: "Approved institutional funding", detail: "Institutional allocations, approved event funding and other officially authorized sources." },
  { term: "Approval & documentation", detail: "Every transaction is documented: budgets, receipts and expenditure all follow college regulations." },
  { term: "Regulatory compliance", detail: "No personal collection or unauthorized financial commitment is ever made on behalf of the club." },
  { term: "Sponsorships & collaborations", detail: "Sought only where permitted, and always through the proper approval mechanisms." },
];

export function TeamPage() {
  return (
    <Page>
      <Masthead
        eyebrow="Team & governance"
        title="Centralized enough to hold direction"
        standfirst="Decentralized enough that teams decide for themselves. Leadership transfers are structured: every team maintains its own procedures, documents and contacts, so the club survives any change in student leadership."
      />

      <Section
        title="The people"
        intro="Everyone currently on the club's roll, by team. Published from the admin panel, so it fills out as appointments are confirmed."
      >
        <TeamSphere />
      </Section>

      <Section title="What each team does" intro="Nine roles. Each operates independently within its own remit and coordinates directly with the others.">
        <div className="border-t border-rule">
          {ROLES.map((role, i) => (
            <article
              key={role.title}
              className="grid gap-4 border-b border-rule py-8 md:grid-cols-[4rem_20rem_1fr] md:gap-8"
            >
              <span className="label pt-2">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-lg leading-snug">{role.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {role.summary}
                </p>
              </div>
              <ul className="space-y-1.5 text-sm text-ink-muted">
                {role.duties.map((duty) => (
                  <li key={duty} className="flex gap-3">
                    {/* A hairline rather than a glyph: a dash or a coloured dot
                        in front of every row is decoration, and it repeats 36
                        times on this page. */}
                    <span
                      className="mt-2.5 h-px w-3 flex-none bg-glow/60"
                      aria-hidden="true"
                    />
                    <span>{duty}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="How decisions are made"
        intro="Four levels, so that routine work never waits on an approval it does not need."
      >
        <Index items={DECISIONS} />
      </Section>

      <Section title="Finance &amp; compliance" intro="The club is non-commercial. Everything it spends is institutional money, handled as such.">
        <Plates items={FINANCE} columns={2} />
      </Section>

    </Page>
  );
}

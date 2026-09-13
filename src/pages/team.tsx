"use client";

import { Masthead, Page, Section, Index, Plates, Note } from "@/components/layout/editorial";
import { HeroCarousel, type HeroCarouselItem } from "@/components/ui/hero-carousel";
import { plate } from "@/lib/imagery";

const ROLES = [
  {
    title: "Club Head / President",
    summary: "The primary student leader: sets direction, delegates, and is accountable for the club as a whole.",
    duties: [
      "Establish the strategic direction of the club",
      "Coordinate all functional teams",
      "Represent the club before faculty and college authorities",
      "Ensure teams operate independently while staying aligned",
    ],
  },
  {
    title: "Student Welfare, Conferences & Outreach",
    summary: "Finds the opportunities everything else is built on.",
    duties: [
      "Research conferences and scientific events",
      "Prepare summaries of relevant opportunities",
      "Coordinate student participation and permissions",
      "Maintain participation records",
    ],
  },
  {
    title: "Alumni Team",
    summary: "Builds the standing network the club draws speakers and mentors from.",
    duties: [
      "Identify and contact biotechnology alumni",
      "Maintain an alumni contact database",
      "Invite alumni for talks, mentorship and podcasts",
      "Build an institutional network, not last-minute speakers",
    ],
  },
  {
    title: "Cultural & Engagement Team",
    summary: "Makes sure opportunities reach students who would not otherwise hear about them.",
    duties: [
      "Conduct classroom campaigns across AIT",
      "Democratize access to scientific activities",
      "Encourage first-year and cross-department participation",
      "Coordinate student volunteers",
    ],
  },
  {
    title: "Media Team",
    summary: "Records what happens, so it exists after the day it happened.",
    duties: [
      "Photograph and record events",
      "Produce short-form videos and reels",
      "Document meetings and external coverage",
      "Maintain an organized, geotagged media archive",
    ],
  },
  {
    title: "Editorial & Design Team",
    summary: "Turns the record into something readable, and keeps the club's visual voice consistent.",
    duties: [
      "Graphic design, website and posters",
      "Blogs, explainers and event reports",
      "Magazine and digital publications",
      "Work closely with Media on every story",
    ],
  },
  {
    title: "Hackathons & Technical Activities",
    summary: "The hands-on, competitive side of the club.",
    duties: [
      "Research hackathons and competitions",
      "Identify biotechnology and interdisciplinary challenges",
      "Assemble student teams and document outcomes",
      "Develop internal hackathons where appropriate",
    ],
  },
  {
    title: "Logistics & Transportation",
    summary: "The part of an event nobody sees unless it goes wrong.",
    duties: [
      "Transport arrangements and venue coordination",
      "Permissions, setup and equipment",
      "Registration desks and scheduling",
      "External conference and visit logistics",
    ],
  },
  {
    title: "Treasurer / Finance Team",
    summary: "Keeps the club solvent, documented and compliant.",
    duties: [
      "Maintain financial records and budgets",
      "Track income and expenditure",
      "Prepare receipts, documentation and financial reports",
      "Ensure all expenditure follows institutional regulations",
    ],
  },
];

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

/* One hue per team, walked around a cool marine range so the backdrop swings on
   every change without ever leaving the site's palette. */
const ACCENTS = [
  "#21476e", "#2f6d7a", "#3a5f9e", "#4a4f8c", "#2b7a6b",
  "#5a4a86", "#1f5f8b", "#3d6b5a", "#46527f",
];

/** Break a team name into two roughly equal lines, since the carousel sets each
    line as its own reveal and one long trailing line reads badly. */
function twoLines(title: string) {
  const words = title.split(" ");
  const at = Math.ceil(words.length / 2);
  return [words.slice(0, at).join(" "), words.slice(at).join(" ")].join("\n");
}

/* The nine teams as a filmstrip. Deliberately not portraits: the founding team
   has not been appointed, and a row of stock faces standing in for real students
   would be a lie the rest of the page then has to live with. Each card carries
   its team's remit instead, and the strip takes real photographs the moment the
   Media team has them. */
const STRIP: HeroCarouselItem[] = ROLES.map((role, i) => ({
  id: role.title,
  title: twoLines(role.title),
  image: plate(i),
  accent: ACCENTS[i % ACCENTS.length],
}));

export function TeamPage() {
  return (
    <Page>
      <Masthead
        eyebrow="Team & governance"
        title="Centralized enough to hold direction"
        standfirst="Decentralized enough that teams decide for themselves. Leadership transfers are structured: every team maintains its own procedures, documents and contacts, so the club survives any change in student leadership."
      />

      <Section title="The nine teams" intro="Drag the strip, or use the arrow keys.">
        <div className="pt-2">
          <HeroCarousel
            items={STRIP}
            defaultIndex={0}
            autoplay
            autoplayDelay={5200}
            className="h-[75dvh] min-h-[26rem]"
          />
        </div>
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

      <Section title="The people">
        <Note>
          The founding team is being constituted. Names, photographs and contact
          details for each role will be published here once appointments are
          confirmed by faculty.
        </Note>
      </Section>
    </Page>
  );
}

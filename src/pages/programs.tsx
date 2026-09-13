"use client";

import { Masthead, Page, Section, Index, Plates, Note } from "@/components/layout/editorial";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";
import { OpportunityList } from "@/components/ui/opportunity-list";
import { STREAM_IMAGES } from "@/lib/imagery";

const PROCESS = [
  { term: "Discover", detail: "A team identifies an opportunity in the scientific ecosystem: a conference, workshop, visit, course or competition." },
  { term: "Propose", detail: "The team prepares a short proposal setting out the opportunity, who it suits and what it would take." },
  { term: "Approve", detail: "Review by the appropriate leadership, and by faculty wherever institutional policy requires it." },
  { term: "Execute", detail: "Relevant teams independently perform their assigned roles: outreach, logistics, media, editorial, finance." },
  { term: "Document", detail: "Media and Editorial record the activity as it happens: photographs, recordings, notes, geotagged coverage." },
  { term: "Review", detail: "A standardized post-event report records outcomes, participation, feedback, finances, challenges and recommendations." },
];

const THEMES = [
  { term: "Infectious diseases", detail: "Epidemiology, disease biology and public health. Conferences and workshops." },
  { term: "Flow cytometry", detail: "Cell analysis and sorting techniques. Technical workshop." },
  { term: "Spatial omics", detail: "Spatial transcriptomics and proteomics. Conference or symposium." },
  { term: "Advanced microscopy", detail: "Imaging research facilities and methods. Institutional exposure." },
  { term: "Neuroscience", detail: "Brain research and cognition. Symposium and lectures." },
  { term: "Pharma & biomanufacturing", detail: "Drug development, production and scale-up. Industry visits." },
  { term: "Biosafety", detail: "Laboratory safety and regulations. Training program." },
  { term: "Synthetic biology", detail: "Engineering biological systems. Hackathons and hands-on work." },
];

const EXPOSURE = [
  { term: "Research institute visits", detail: "Guided tours of leading research institutions and their facilities." },
  { term: "Laboratory exposure", detail: "Getting inside real lab environments beyond the teaching lab." },
  { term: "Research facility tours", detail: "Seeing the instrumentation and infrastructure modern research depends on." },
  { term: "Faculty interaction sessions", detail: "Conversations with researchers about their work and how they got to it." },
  { term: "Observational programs", detail: "Short-term opportunities to observe working research groups." },
  { term: "Company & institutional visits", detail: "Biotech companies, pharmaceutical organizations and startups." },
];

const SPEAKERS = [
  { term: "Alumni of AIT", detail: "Graduates working in research, industry and entrepreneurship, located through professional networks and kept as a standing relationship." },
  { term: "Faculty & researchers", detail: "Professor spotlights and academic journeys, from inside the institute and beyond it." },
  { term: "Industry professionals", detail: "Biotech, pharma and life-science practitioners on career and technical practice." },
  { term: "Startup founders", detail: "Entrepreneurs building companies where biology meets engineering, data and design." },
];

const FORMATS = [
  { term: "Guest lectures", detail: "Topic-driven talks on emerging science and its applications." },
  { term: "Expert interactions", detail: "Small-group question sessions with visiting researchers and professionals." },
  { term: "Career sessions", detail: "Pathways in biotechnology students may not know exist." },
  { term: "Podcast & interview guests", detail: "Conversations recorded for the Plasmid Podcast." },
];

const NETWORK = [
  { term: "Alumni network", detail: "An institutional relationship with AIT graduates in research, industry and entrepreneurship, not a list of last-minute speakers." },
  { term: "Startups & entrepreneurs", detail: "Interaction with founders building at the intersection of biology, engineering, data and design." },
  { term: "Industry & pharmaceutical organizations", detail: "Visits, talks and career pathways across the biotechnology and pharma ecosystem." },
  { term: "Research institutions & universities", detail: "The Institutional Exposure Program connects students with academic research beyond the syllabus." },
  { term: "Interdisciplinary collaboration at AIT", detail: "Biotechnology-led but AIT-wide: electronics, aeronautics, mechanical, CS/AI and design students all contribute." },
];

const REPORT_FIELDS = [
  "Event name", "Date", "Venue", "Organizing team", "Collaborating teams",
  "Objective", "Description", "Participants", "Key outcomes", "Student feedback",
  "Media coverage", "Financial summary", "Challenges", "Recommendations", "Future action",
];

export function ProgramsPage() {
  return (
    <Page>
      <Masthead
        eyebrow="Programs"
        title="Exposure, and what is done with it"
        standfirst="The club researches, evaluates and coordinates scientific conferences, symposiums, workshops, courses, hackathons and institutional programs on behalf of students, then documents every activity so that each one becomes the foundation for the next."
      />

      {/* The corridor runs full-bleed directly under the masthead: the stream of
          opportunities the club puts students in front of, arriving. It is
          decorative and aria-hidden, so the page reads identically without it. */}
      <div className="mt-16">
        <ImageStreamHero
          images={STREAM_IMAGES}
          speed={22}
          axis={50}
          className="h-[22rem] w-full bg-ground-deep sm:h-[26rem]"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ground via-transparent to-ground" />
        </ImageStreamHero>
      </div>

      <Section title="How an activity happens" intro="Every major activity follows the same six stages rather than being treated as an isolated task.">
        <Index items={PROCESS} />
      </Section>

      <Section
        title="The opportunity calendar"
        intro="Each tracked opportunity records its date, institution, field, eligibility, registration deadline, cost, location, relevance, the student profile it suits and the club action required. These are the founding focus areas."
      >
        <Plates items={THEMES} />

        <div className="mt-20">
          <p className="label mb-6">Tracked now</p>
          <OpportunityList />
        </div>
      </Section>

      <Section
        title="Institutional Exposure Program"
        intro="A core pillar: direct relationships with the research and industry ecosystem, so students see where biotechnology actually operates."
      >
        <Plates items={EXPOSURE} />
        <ul className="mt-12 grid gap-x-10 gap-y-2 border-t border-rule pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Universities",
            "Research institutes",
            "Laboratories",
            "Biotechnology companies",
            "Pharmaceutical organizations",
            "Startups",
            "Research facilities",
          ].map((place) => (
            <li key={place} className="text-sm text-ink-muted">
              {place}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Speakers" intro="Talks sourced from long-term relationships rather than last-minute requests.">
        <Plates items={SPEAKERS} columns={2} />
        <div className="mt-16">
          <p className="label mb-6">Engagement formats</p>
          <Plates items={FORMATS} columns={2} />
        </div>
      </Section>

      <Section title="Collaborations" intro="The club is built on relationships maintained as an ongoing network, not a series of one-off transactions.">
        <Index items={NETWORK} />
      </Section>

      <Section
        title="The record"
        intro="Every major activity produces a short standardized report. Nothing is left as institutional memory in one student's head."
      >
        <ul className="flex flex-wrap gap-x-6 gap-y-2 border-t border-rule pt-8">
          {REPORT_FIELDS.map((field) => (
            <li key={field} className="font-mono text-xs uppercase tracking-[0.1em] text-ink-muted">
              {field}
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <Note>
            No activities have been completed yet. The club is in its founding
            year. Past events, their reports and their media will be published
            here as they happen.
          </Note>
        </div>
      </Section>
    </Page>
  );
}

"use client";

import { Link } from "react-router-dom";
import { JellyHero } from "@/components/ui/jelly-hero";
import { Section, Index, Plates, Pull } from "@/components/layout/editorial";

const ECOSYSTEM = [
  "Discover",
  "Engage",
  "Create",
  "Communicate",
  "Connect",
  "Continue",
];

const PILLARS = [
  {
    term: "Industry & scientific exposure",
    detail:
      "Conferences, symposiums, workshops, technical courses, industry and research-institute visits, guest lectures, poster presentations, hackathons and career sessions, so students see where biotechnology exists beyond the classroom.",
  },
  {
    term: "Interdisciplinary science community",
    detail:
      "A community rather than an event organizer. Students become science communicators through explainers, biotech news, Paper of the Week, lab myths versus facts, professor spotlights and the campus podcast.",
  },
  {
    term: "Research & institutional exposure",
    detail:
      "Direct relationships with the research ecosystem through the Institutional Exposure Program: guided laboratory tours, research presentations, faculty interaction and observational programs.",
  },
];

const DIFFERENCE = [
  {
    term: "Not an event calendar",
    detail:
      "The conventional model ends at Workshop → Attendance → Certificate → Finished. Every JellyTech activity is documented, communicated and fed into the next opportunity, so a year of work compounds instead of resetting.",
  },
  {
    term: "Biotechnology-led, AIT-wide",
    detail:
      "Open to students from every department: AI, computer science, electronics, mechanical, aeronautical and design, because science does not exist within departmental boundaries.",
  },
  {
    term: "Built to survive its founders",
    detail:
      "Every team maintains standard operating procedures, documents and contacts, and leadership transfers are structured. The club is designed to outlast any particular set of students.",
  },
];

export function HomePage() {
  return (
    <>
      <JellyHero />

      {/* The reader arrives out of the water into the paper. */}
      <div className="relative z-10 bg-ground">
        <Section className="pt-28">
          <p className="label">Acharya Institute of Technology</p>
          <p className="measure mt-8 font-display text-[clamp(1.5rem,3vw,2.4rem)] leading-[1.25]">
            JellyTech is a student-led, faculty-supervised club building a
            continuous ecosystem of scientific exposure, research engagement and
            science communication, where students do not merely consume
            scientific knowledge, but create, interpret and communicate it.
          </p>

          <ol className="mt-14 flex flex-wrap gap-x-8 gap-y-8 border-t border-rule pt-8">
            {ECOSYSTEM.map((stage, i) => (
              /* The numeral sits above the word rather than beside it. Inline,
                 the two ran together ("01Discover") and needed a separator dot
                 to prise them apart, which put six dots across one line for no
                 reason. Stacked, the alignment does that work and the dots go.
                 The numeral is also set small and in the accent so it reads as
                 a marker rather than as part of the label. */
              <li key={stage} className="min-w-[7.5rem] flex-1">
                <span className="block font-mono text-[11px] tabular-nums tracking-[0.08em] text-glow">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-1.5 block font-display text-xl leading-none">
                  {stage}
                </span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Three pillars" intro="What the club actually does, and why each part needs the other two.">
          <Plates items={PILLARS} />
        </Section>

        <Pull cite="Vision">
          A student community that connects biotechnology education with
          research, industry and real scientific practice.
        </Pull>

        <Section title="What makes it different" intro="Its distinguishing feature is not the number of events. It is the ecosystem.">
          <Index items={DIFFERENCE} />
        </Section>

        <Section title="Where to go next">
          <div className="grid gap-px border-t border-rule bg-rule sm:grid-cols-3">
            {[
              { to: "/about", label: "About", note: "Identity, mission, principles" },
              { to: "/programs", label: "Programs", note: "Exposure, visits, speakers" },
              { to: "/join", label: "Join", note: "Open to every department" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group bg-ground px-6 py-10 transition-colors hover:bg-ground-raised"
              >
                <span className="font-display text-2xl">{item.label}</span>
                <span className="label mt-3 block">{item.note}</span>
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}

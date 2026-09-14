"use client";

import { Masthead, Page, Section, Index, Plates, Pull, Note } from "@/components/layout/editorial";
import { HeroCarousel, type HeroCarouselItem } from "@/components/ui/hero-carousel";
import { ROLES } from "@/lib/teams";
import { plate } from "@/lib/imagery";
import { Link } from "react-router-dom";

const IDENTITY = [
  {
    term: "Student-led, faculty-supervised",
    detail:
      "A non-commercial, co-curricular organization of Acharya Institute of Technology. Students plan, execute and evaluate; faculty supervise and approve where institutional policy requires it.",
  },
  {
    term: "Interdisciplinary and AIT-wide",
    detail:
      "Biotechnology-led at its core, but open to students across every department: AI, computer science, electronics, mechanical, aeronautical and design.",
  },
  {
    term: "Flexible involvement",
    detail:
      "Diverse opportunities and meaningful involvement without heavy continuous participation requirements. Students engage at the depth their year and workload allow.",
  },
  {
    term: "An ecosystem, not a series of events",
    detail:
      "Discover, engage, create, communicate, connect, continue. Every activity is built so that it produces the material for the next one.",
  },
];

const MISSION = [
  "Provide meaningful exposure to biotechnology, life sciences, research and industry.",
  "Create opportunities for interaction with researchers, professionals, alumni, startups and institutions.",
  "Encourage exploration of scientific fields beyond the academic syllabus.",
  "Develop scientific communication, media, research and organizational skills.",
  "Encourage interdisciplinary collaboration between biotechnology and other departments of AIT.",
  "Create a continuous ecosystem of conferences, workshops, hackathons, institutional visits and scientific media.",
  "Improve the visibility and representation of the Biotechnology Department within the institute.",
  "Create opportunities for students to actively contribute to and communicate scientific knowledge.",
];

const CONVENTIONAL = ["Workshop", "Attendance", "Certificate", "Finished"];
const JellyTech = [
  "Opportunity discovery",
  "Scientific exposure",
  "Student participation",
  "Research / industry interaction",
  "Documentation",
  "Scientific communication",
  "Networking",
  "Future opportunity",
];

const PRINCIPLES = [
  { term: "Interdisciplinary activities", detail: "Science does not exist within departmental boundaries." },
  { term: "Accessibility", detail: "Scientific opportunities are communicated to students regardless of year or department." },
  { term: "Continuous engagement", detail: "An ecosystem of opportunities rather than isolated events." },
  { term: "Student leadership", detail: "Students actively plan, execute and evaluate activities." },
  { term: "Professionalism", detail: "External interactions are conducted responsibly." },
  { term: "Scientific integrity", detail: "Scientific information is communicated accurately and responsibly." },
  { term: "Documentation", detail: "Activities are recorded for institutional continuity." },
  { term: "Sustainability", detail: "Systems that survive changes in student leadership." },
  { term: "Collaboration", detail: "Teams work together while retaining functional autonomy." },
  { term: "Representation", detail: "A platform for showcasing biotechnology and its interdisciplinary applications at AIT." },
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

/* The nine teams as a filmstrip. Deliberately not portraits: this is the shape
   of the organisation, not its roster. The people are on the Team page, on a
   sphere, and putting faces here as well would say the same thing twice in two
   different ways. */
const STRIP: HeroCarouselItem[] = ROLES.map((role, i) => ({
  id: role.title,
  title: twoLines(role.title),
  image: plate(i),
  accent: ACCENTS[i % ACCENTS.length],
}));

function Chain({ steps, muted }: { steps: string[]; muted?: boolean }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
      {steps.map((step, i) => (
        <li key={step} className="flex items-center gap-2">
          <span
            className={
              muted
                ? "text-sm text-ink-faint line-through decoration-ink-faint/40"
                : "text-sm text-ink"
            }
          >
            {step}
          </span>
          {i < steps.length - 1 && (
            <span className="text-ink-faint" aria-hidden="true">→</span>
          )}
        </li>
      ))}
    </ol>
  );
}

export function AboutPage() {
  return (
    <Page>
      <Masthead
        eyebrow="About"
        title="What JellyTech is"
        standfirst="A student-led, faculty-supervised, non-commercial co-curricular organization at Acharya Institute of Technology, building a continuous ecosystem of exposure, participation, creation and communication in biotechnology, life sciences and scientific engagement."
      />

      <Section title="Identity">
        <Plates items={IDENTITY} columns={2} />
      </Section>

      <Pull cite="From the vision">
        Students do not merely consume scientific knowledge. They create,
        interpret, communicate and apply it.
      </Pull>

      <Section title="Vision">
        <p className="measure text-lead">
          To build a vibrant interdisciplinary student community that connects
          biotechnology education with research, industry, innovation,
          communication and real-world scientific practice, where students do
          not merely consume scientific knowledge, but also create, interpret,
          communicate and apply it.
        </p>
      </Section>

      <Section title="Aim">
        <p className="measure font-display text-lead">
          To establish a student-led interdisciplinary platform that provides
          continuous opportunities for scientific exposure, research engagement,
          industry interaction, innovation and scientific communication for
          students at Acharya Institute of Technology, emphasizing exposure and
          application, rather than limiting itself to conventional academic
          activities.
        </p>
      </Section>

      <Section title="Mission" intro="Eight commitments the club holds itself to.">
        <ol className="border-t border-rule">
          {MISSION.map((item, i) => (
            <li key={item} className="flex gap-8 border-b border-rule py-5">
              <span className="label pt-1.5">{String(i + 1).padStart(2, "0")}</span>
              <p className="measure">{item}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title="Two models"
        intro="The distinguishing feature is not the number of events. It is what happens after one."
      >
        <div className="grid gap-12 border-t border-rule pt-10 md:grid-cols-2">
          <div>
            <p className="label mb-5">Conventional</p>
            <Chain steps={CONVENTIONAL} muted />
          </div>
          <div>
            <p className="label mb-5 text-glow-bright">JellyTech</p>
            <Chain steps={JellyTech} />
          </div>
        </div>
      </Section>

      <Section
        title="How the work is divided"
        intro="Nine functional teams, each operating independently within its own remit and coordinating directly with the others. Drag the strip, or use the arrow keys."
      >
        <div className="pt-2">
          <HeroCarousel
            items={STRIP}
            defaultIndex={0}
            autoplay
            autoplayDelay={5200}
            className="h-[70dvh] min-h-[24rem]"
          />
        </div>
        <p className="measure mt-8 text-ink-muted">
          What each team actually does, and who is on it, is on the{" "}
          <Link to="/team" className="text-glow-bright underline underline-offset-4">
            Team &amp; governance
          </Link>{" "}
          page.
        </p>
      </Section>

      <Section title="Constitutional principles" intro="Ten principles that govern how the club functions.">
        <Index items={PRINCIPLES} />
      </Section>

      <Section>
        <Note>
          JellyTech is in its founding year. Much of what is described here is a
          structure being put in place rather than a record of things already
          done. The pages across this site say which is which.
        </Note>
      </Section>
    </Page>
  );
}

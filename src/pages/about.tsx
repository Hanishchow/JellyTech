"use client";

import { Masthead, Page, Section, Index, Plates, Pull, Note } from "@/components/layout/editorial";

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
const JELLYTECH = [
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
        title="What JELLYTECH is"
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
            <p className="label mb-5 text-glow-bright">JELLYTECH</p>
            <Chain steps={JELLYTECH} />
          </div>
        </div>
      </Section>

      <Section title="Constitutional principles" intro="Ten principles that govern how the club functions.">
        <Index items={PRINCIPLES} />
      </Section>

      <Section>
        <Note>
          JELLYTECH is in its founding year. Much of what is described here is a
          structure being put in place rather than a record of things already
          done. The pages across this site say which is which.
        </Note>
      </Section>
    </Page>
  );
}

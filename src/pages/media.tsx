"use client";

import { Masthead, Page, Section, Index, Plates, Pull, Note } from "@/components/layout/editorial";

const SERIES = [
  { term: "GeneScene: Paper of the Week", detail: "One research paper explained in accessible language every week, so current science is readable regardless of a student's year or specialization." },
  { term: "Research Breakdown", detail: "Complex published research broken into understandable concepts, so students can follow where a field is actually moving." },
  { term: "Biotech News", detail: "Important developments in biotechnology and life sciences, summarized. A campus-wide pulse on what is happening now." },
  { term: "Lab Myths vs. Facts", detail: "Common scientific misconceptions explained accurately and responsibly. A direct application of the scientific-integrity principle." },
  { term: "Careers in Biotech", detail: "Career paths students may not know exist: industry, research, regulatory, communication, data and beyond." },
  { term: "Conference Diaries", detail: "Student accounts of external scientific events, written by the students who attended them." },
];

const PODCAST = [
  { term: "Professor spotlights", detail: "Faculty research journeys and the questions driving their work." },
  { term: "Student research interviews", detail: "Undergraduate projects, learnings and advice, in students' own words." },
  { term: "Alumni conversations", detail: "Where AIT graduates have gone, and how current students might follow." },
  { term: "Conference diaries", detail: "Student experiences from external scientific events, recorded on return." },
];

const PUBLICATIONS = [
  { term: "Student articles & explainers", detail: "Long-form pieces that make research and biotechnology concepts readable." },
  { term: "Conference & event reports", detail: "Coverage of external events written by the students who attended." },
  { term: "Digital magazine", detail: "A periodic collection of the club's best scientific communication." },
  { term: "Annual report", detail: "A yearly review of activities, opportunities and outcomes." },
];

const SHOWCASE = [
  { term: "Student research showcases", detail: "Student projects, final-year work and undergraduate research at AIT, given visibility beyond the department." },
  { term: "Poster presentations", detail: "A structured, visible format for students to present their own research, analysis and ideas." },
];

export function MediaPage() {
  return (
    <Page>
      <Masthead
        eyebrow="Media"
        title="Students as science communicators"
        standfirst="The club's second pillar is a publishing operation: explainers, news, interviews, a podcast and a magazine, produced by the Editorial & Design and Media teams and reviewed for scientific accuracy before anything goes out."
      />

      <Section title="Standing series" intro="Recurring formats that train students to understand research and then explain it.">
        <Index items={SERIES} />
      </Section>

      <Pull cite="Constitutional principle: scientific integrity">
        Scientific information is communicated accurately and responsibly.
      </Pull>

      <Section
        title="Plasmid Podcast"
        intro="The campus science podcast: conversations with researchers, alumni, faculty and students, produced and hosted by JELLYTECH members."
      >
        <Plates items={PODCAST} columns={2} />
        <div className="mt-10">
          <Note>
            Recording begins once the Media team's equipment and workflow are in
            place. Episodes will be published here and on the usual podcast
            platforms.
          </Note>
        </div>
      </Section>

      <Section title="Publications" intro="The written record of the club's scientific communication.">
        <Plates items={PUBLICATIONS} columns={2} />
      </Section>

      <Section title="Student work" intro="Media is not only about covering other people's science.">
        <Plates items={SHOWCASE} columns={2} />
      </Section>

      <Section title="Contributing">
        <p className="measure font-display text-lead">
          Writing, design, photography, video, editing and interviewing are open
          to students from any department. No biotechnology background is
          required to work on the media side.
        </p>
        <p className="measure mt-6 text-ink-muted">
          Everything published is reviewed for scientific accuracy before it goes
          out, and carries the name of the student who made it.
        </p>
      </Section>
    </Page>
  );
}

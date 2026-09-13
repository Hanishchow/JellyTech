"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";
import { PageSection } from "@/components/page-section";
import {
  Layers,
  Users,
  GraduationCap,
  RefreshCw,
  Target,
  Eye,
  Quote,
  Lightbulb,
  BookOpen,
  Building2,
  FlaskConical,
  Shield,
  FileText,
  Repeat,
  Handshake,
} from "lucide-react";

const identity = [
  {
    title: "Student-led, faculty-supervised",
    description:
      "A student-led, faculty-supervised, non-commercial, co-curricular organization of Acharya Institute of Technology.",
    icon: GraduationCap,
  },
  {
    title: "Interdisciplinary & AIT-wide",
    description:
      "Biotechnology-led at its core, but open to students across all departments — AI, CS, electronics, mechanical, aeronautical, design and more.",
    icon: Users,
  },
  {
    title: "Flexible co-curricular involvement",
    description:
      "Diverse opportunities + meaningful involvement + flexible participation. No heavy continuous participation requirements.",
    icon: RefreshCw,
  },
  {
    title: "An ecosystem, not just events",
    description:
      "Discover → Engage → Create → Communicate → Connect → Continue. Every activity builds the foundation for the next.",
    icon: Layers,
  },
];

const mission = [
  "Provide meaningful exposure to biotechnology, life sciences, research and industry.",
  "Create opportunities for interaction with researchers, professionals, alumni, startups and institutions.",
  "Encourage exploration of scientific fields beyond the academic syllabus.",
  "Develop scientific communication, media, research and organizational skills.",
  "Encourage interdisciplinary collaboration between biotechnology and other departments of AIT.",
  "Create a continuous ecosystem of conferences, workshops, hackathons, institutional visits and scientific media.",
  "Improve the visibility and representation of the Biotechnology Department within the institute.",
  "Create opportunities for students to actively contribute to and communicate scientific knowledge.",
];

const pillars = [
  {
    id: "I",
    color: "text-primary",
    bg: "bg-primary/10",
    ring: "border-primary/20",
    title: "Industry & Scientific Exposure",
    description:
      "Conferences, scientific symposiums, workshops, technical courses, industry visits, research institute visits, guest lectures, expert interactions, poster presentations, hackathons, startup interactions and career sessions — so students understand where biotechnology exists beyond the classroom.",
  },
  {
    id: "II",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    ring: "border-blue-400/20",
    title: "Interdisciplinary Science Community",
    description:
      "A community rather than an event organizer. Students become science communicators through explainers, biotech news, Paper of the Week, lab myths vs. facts, professor spotlights, conference coverage and campus podcasts.",
  },
  {
    id: "III",
    color: "text-green-400",
    bg: "bg-green-400/10",
    ring: "border-green-400/20",
    title: "Research & Institutional Exposure",
    description:
      "Direct relationships with the research ecosystem through the Institutional Exposure Program — guided laboratory tours, research presentations, faculty and researcher interactions, observational programs and collaborative visits.",
  },
];

const conventionalModel = [
  "Workshop",
  "Attendance",
  "Certificate",
  "Finished",
];

const jellyModel = [
  "Opportunity Discovery",
  "Scientific Exposure",
  "Student Participation",
  "Research / Industry Interaction",
  "Documentation",
  "Scientific Communication",
  "Networking",
  "Future Opportunity",
];

const principles = [
  { title: "Interdisciplinary Activities", description: "Science does not exist within departmental boundaries.", icon: BookOpen },
  { title: "Accessibility", description: "Scientific opportunities are communicated to students regardless of year or department.", icon: Lightbulb },
  { title: "Continuous Engagement", description: "An ecosystem of opportunities rather than isolated events.", icon: Repeat },
  { title: "Student Leadership", description: "Students actively plan, execute and evaluate activities.", icon: Users },
  { title: "Professionalism", description: "External interactions are conducted responsibly.", icon: Shield },
  { title: "Scientific Integrity", description: "Scientific information is communicated accurately and responsibly.", icon: FlaskConical },
  { title: "Documentation", description: "Activities are recorded for institutional continuity.", icon: FileText },
  { title: "Sustainability", description: "Systems that survive changes in student leadership.", icon: Building2 },
  { title: "Collaboration", description: "Teams work together while retaining functional autonomy.", icon: Handshake },
  { title: "Representation", description: "A platform for showcasing biotechnology and its interdisciplinary applications at AIT.", icon: Eye },
];

export function AboutPage() {
  return (
    <PageShell
      badge="About"
      title="What is JELLYTECH?"
      subtitle="A student-led, faculty-supervised, non-commercial, co-curricular organization at Acharya Institute of Technology — building a continuous ecosystem of exposure, participation, creation and communication in biotechnology, life sciences and scientific engagement."
    >
      <PageSection title="Identity" description="The proposed model shifts emphasis from ‘Event → Poster → Attendance → Done’ towards an ecosystem that keeps students engaged beyond any single activity.">
        <div className="grid gap-4 sm:grid-cols-2">
          {identity.map((item) => (
            <Card key={item.title} className="bg-zinc-900/80 border-white/10">
              <CardContent className="p-6 space-y-3">
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-zinc-900/80 border-white/10">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-white">Vision</h3>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <Quote className="h-5 w-5 text-primary/60" />
              <p className="mt-3 text-white/85 leading-relaxed">
                To build a vibrant interdisciplinary student community that connects
                biotechnology education with research, industry, innovation,
                communication and real-world scientific practice — where students do
                not merely consume scientific knowledge, but also create, interpret,
                communicate and apply it.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/80 border-white/10">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-white">Aim</h3>
            </div>
            <p className="text-white/75 leading-relaxed">
              To establish a student-led interdisciplinary platform that provides
              continuous opportunities for scientific exposure, research engagement,
              industry interaction, innovation and scientific communication for
              students at Acharya Institute of Technology — emphasizing exposure and
              application, rather than limiting itself to conventional academic
              activities.
            </p>
          </CardContent>
        </Card>
      </div>

      <PageSection title="Mission" description="What JELLYTECH is committed to doing.">
        <ul className="grid gap-3 sm:grid-cols-2">
          {mission.map((item) => (
            <li key={item} className="flex items-start gap-3 rounded-xl border border-white/10 bg-zinc-900/70 p-4">
              <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
              <span className="text-sm text-white/75 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection title="Core Pillars">
        <div className="grid gap-4 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.id} className={pillar.ring}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={pillar.bg + " h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold " + pillar.color}>
                    {pillar.id}
                  </div>
                </div>
                <h3 className="font-semibold text-white">{pillar.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{pillar.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>

      <PageSection title="What makes JELLYTECH different?" description="Its distinguishing feature is not the number of events — it is the ecosystem.">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
                Conventional model
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {conventionalModel.map((step, i) => (
                  <span key={step} className="flex items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/50">
                      {step}
                    </span>
                    {i < conventionalModel.length - 1 && <span className="text-white/20">→</span>}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
                JELLYTECH model
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {jellyModel.map((step, i) => (
                  <span key={step} className="flex items-center gap-2">
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm text-white">
                      {step}
                    </span>
                    {i < jellyModel.length - 1 && <span className="text-primary/40">→</span>}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageSection>

      <PageSection title="Constitutional principles" description="The functioning of JELLYTECH is guided by these ten principles.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((principle) => (
            <Card key={principle.title} className="bg-zinc-900/80 border-white/10">
              <CardContent className="p-5 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <principle.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-white">{principle.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{principle.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>
    </PageShell>
  );
}
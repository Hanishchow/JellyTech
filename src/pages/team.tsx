"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { PageSection } from "@/components/page-section";
import { Link } from "react-router-dom";
import {
  CornerDownRight,
  GraduationCap,
  Users,
  Megaphone,
  Video,
  PenTool,
  Trophy,
  Truck,
  Wallet,
  ArrowRight,
} from "lucide-react";

const teamRoles = [
  {
    title: "Club Head / President",
    between: "The primary student leader — sets direction, delegates and ensures accountability.",
    icon: CornerDownRight,
    responsibilities: [
      "Establish the strategic direction of the club",
      "Coordinate all functional teams",
      "Represent the club before faculty and college authorities",
      "Ensure teams operate independently while aligned",
    ],
  },
  {
    title: "Student Welfare, Conferences & Outreach",
    icon: Megaphone,
    responsibilities: [
      "Research conferences and scientific events",
      "Prepare summaries of relevant opportunities",
      "Coordinate student participation and permissions",
      "Maintain participation records",
    ],
  },
  {
    title: "Alumni Team",
    icon: GraduationCap,
    responsibilities: [
      "Identify and contact biotechnology alumni",
      "Maintain an alumni contact database",
      "Invite alumni for talks, mentorship and podcasts",
      "Build an institutional network, not last-minute speakers",
    ],
  },
  {
    title: "Cultural & Engagement Team",
    icon: Users,
    responsibilities: [
      "Conduct classroom campaigns across AIT",
      "Democratize access to scientific activities",
      "Encourage first-year and cross-department participation",
      "Coordinate student volunteers",
    ],
  },
  {
    title: "Media Team",
    icon: Video,
    responsibilities: [
      "Photograph and record events",
      "Produce short-form videos and reels",
      "Document meetings and external coverage",
      "Maintain an organized, geotagged media archive",
    ],
  },
  {
    title: "Editorial & Design Team",
    icon: PenTool,
    responsibilities: [
      "Graphic design, website and posters",
      "Blogs, explainers and event reports",
      "Magazine and digital publications",
      "Work closely with Media on every story",
    ],
  },
  {
    title: "Hackathons & Technical Activities",
    icon: Trophy,
    responsibilities: [
      "Research hackathons and competitions",
      "Identify biotechnology and interdisciplinary challenges",
      "Assemble student teams and document outcomes",
      "Develop internal hackathons where appropriate",
    ],
  },
  {
    title: "Logistics & Transportation",
    icon: Truck,
    responsibilities: [
      "Transport arrangements and venue coordination",
      "Permissions, setup and equipment",
      "Registration desks and scheduling",
      "External conference and visit logistics",
    ],
  },
  {
    title: "Treasurer / Finance Team",
    icon: Wallet,
    responsibilities: [
      "Maintain financial records and budgets",
      "Track income and expenditure",
      "Prepare receipts, documentation and financial reports",
      "Ensure all expenditure follows institutional regulations",
    ],
  },
];

const decisionLevels = [
  {
    level: "Level 1",
    title: "Team decisions",
    description: "Routine operational decisions within a team's own responsibilities.",
    icon: Users,
  },
  {
    level: "Level 2",
    title: "Inter-team coordination",
    description: "Team leads coordinate directly for multi-team activities without micromanagement.",
    icon: CornerDownRight,
  },
  {
    level: "Level 3",
    title: "Executive decisions",
    description: "Club Head and Core Team handle collaborations, representation and major programs.",
    icon: Trophy,
  },
  {
    level: "Level 4",
    title: "Faculty approval",
    description: "Faculty and college approval wherever required by institutional policy.",
    icon: GraduationCap,
  },
];

export function TeamPage() {
  return (
    <PageShell
      badge="Team"
      title="Our Team"
      subtitle="Centralized enough to keep direction, decentralized enough that teams make decisions independently. Leadership transfers are structured — every team maintains SOPs, documents and contacts so the club survives any change in student leadership."
    >
      <PageSection title="Organization structure">
        <div className="flex flex-wrap items-center justify-start gap-2 text-sm">
          {["Faculty Advisor / Coordinator", "Club Head / President", "Core Executive Team", "Functional Teams"].map((level, i) => (
            <span key={level} className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70">
                {level}
              </span>
              {i < 3 && <span className="text-white/20">↓</span>}
            </span>
          ))}
        </div>
      </PageSection>

      <PageSection title="Roles & responsibilities">
        <div className="grid gap-4 sm:grid-cols-2">
          {teamRoles.map((role) => (
            <Card key={role.title} className="bg-zinc-900/80 border-white/10">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <role.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-white">{role.title}</h3>
                </div>
                {role.between && (
                  <p className="text-sm text-white/55">{role.between}</p>
                )}
                <ul className="space-y-1.5">
                  {role.responsibilities.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-white/65 leading-relaxed">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary/70" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>

      <PageSection title="Decision-making structure">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {decisionLevels.map((item) => (
            <Card key={item.level} className="bg-zinc-900/80 border-white/10">
              <CardContent className="p-5 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs uppercase tracking-wider text-primary">{item.level}</p>
                <h3 className="font-medium text-white">{item.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center space-y-4">
        <h2 className="text-xl font-semibold text-white">Want to build the club with us?</h2>
        <p className="mx-auto max-w-xl text-sm text-white/60 leading-relaxed">
          Roles are open to students from every department. The club prioritizes early
          talent identification — first-years are groomed through mentorship and
          meaningful responsibility so the next batch can carry the club forward.
        </p>
        <Button asChild>
          <Link to="/signup">
            Join the Movement <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </PageShell>
  );
}
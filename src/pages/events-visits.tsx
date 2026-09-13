"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { PageSection } from "@/components/page-section";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  FlaskConical,
  Microscope,
  Users,
  Compass,
  Landmark,
} from "lucide-react";

const programs = [
  {
    title: "Research institute visits",
    description: "Guided tours of leading research institutions and their facilities.",
    icon: Landmark,
  },
  {
    title: "Laboratory exposure",
    description: "Getting inside real lab environments beyond the teaching lab.",
    icon: FlaskConical,
  },
  {
    title: "Research facility tours",
    description: "Seeing instrumentation and infrastructure modern research depends on.",
    icon: Microscope,
  },
  {
    title: "Faculty interaction sessions",
    description: "Conversations with researchers about their work and journey.",
    icon: Users,
  },
  {
    title: "Observational programs",
    description: "Short-term opportunities to observe working research groups.",
    icon: Compass,
  },
  {
    title: "Company & institutional visits",
    description: "Biotech companies, pharmaceutical organizations and startups.",
    icon: Building2,
  },
];

const institutions = [
  "Universities",
  "Research institutes",
  "Laboratories",
  "Biotechnology companies",
  "Pharmaceutical organizations",
  "Startups",
  "Research facilities",
];

export function VisitsPage() {
  return (
    <PageShell
      badge="Events"
      title="Institutional Exposure & Industry Visits"
      subtitle="A core pillar of JELLYTECH: building direct relationships with the research and industry ecosystem so students see where biotechnology actually operates, and what careers and research look like beyond the classroom."
    >
      <PageSection title="Institutional Exposure Program">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((item) => (
            <Card key={item.title} className="bg-zinc-900/80 border-white/10">
              <CardContent className="p-5 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-white">{item.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>

      <PageSection title="Where we go">
        <div className="flex flex-wrap gap-2">
          {institutions.map((type) => (
            <span
              key={type}
              className="rounded-full border border-white/10 bg-zinc-900/70 px-3 py-1.5 text-sm text-white/65"
            >
              {type}
            </span>
          ))}
        </div>
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center space-y-3">
          <h3 className="font-semibold text-white">First visits in planning</h3>
          <p className="mx-auto max-w-xl text-sm text-white/55 leading-relaxed">
            The Conferences &amp; Outreach and Logistics teams are identifying candidate
            institutions and coordinating permissions and transportation for the first
            exposure visits.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/events/upcoming">
              See proposed focus areas <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </PageSection>
    </PageShell>
  );
}
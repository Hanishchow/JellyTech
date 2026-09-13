"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";
import { PageSection } from "@/components/page-section";
import { BookOpen, Lightbulb, FileText, Users } from "lucide-react";

const series = [
  {
    title: "Paper of the Week — GeneScene",
    description:
      "One research paper explained in accessible language every week — making current science readable for students regardless of their year or specialization.",
    icon: BookOpen,
  },
  {
    title: "Research Breakdown",
    description:
      "Breaking down complex published research into understandable concepts so students can follow where the field is moving.",
    icon: Lightbulb,
  },
  {
    title: "Student Research Showcases",
    description:
      "Highlighting student projects, final-year work and undergraduate research at AIT — giving visibility to student contribution.",
    icon: Users,
  },
  {
    title: "Poster Presentations",
    description:
      "An opportunity for students to present their own research, analysis and ideas in a structured, visible format.",
    icon: FileText,
  },
];

export function PapersPage() {
  return (
    <PageShell
      badge="Research"
      title="Paper of the Week — GeneScene"
      subtitle="JELLYTECH is building a student media program that makes current science accessible. These series train students to understand and communicate research — not just attend events."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {series.map((item) => (
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

      <PageSection
        description="The first write-ups will be prepared once the editorial and science-communication workflows are established — the Media and Editorial teams collaborate on every piece."
      >
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
          <p className="text-sm text-white/50">
            The inaugural GeneScene entry is being curated. Each week's paper will
            be selected by a rotating editorial group and reviewed for scientific
            accuracy before publication.
          </p>
        </div>
      </PageSection>
    </PageShell>
  );
}
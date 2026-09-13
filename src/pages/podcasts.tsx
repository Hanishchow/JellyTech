"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";
import { PageSection } from "@/components/page-section";
import { Radio, Mic, Users, Award, GraduationCap } from "lucide-react";

const episodeThemes = [
  {
    title: "Professor spotlights",
    description: "Faculty research journeys and the questions driving their work.",
    icon: Award,
  },
  {
    title: "Student research interviews",
    description: "Undergraduate projects, learnings and advice, in students' own words.",
    icon: Users,
  },
  {
    title: "Alumni conversations",
    description: "Where AIT grads have gone — and how students can follow.",
    icon: GraduationCap,
  },
  {
    title: "Conference diaries",
    description: "Student experiences from external scientific events.",
    icon: Mic,
  },
];

export function PodcastsPage() {
  return (
    <PageShell
      badge="Podcast"
      title="Plasmid Podcast"
      subtitle="The campus science podcast — conversations with researchers, alumni, faculty and students, produced and hosted by JELLYTECH members."
    >
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Radio className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-wider text-primary font-semibold">
              Coming soon
            </p>
            <p className="text-white/70 text-sm mt-1">
              The first episodes are in planning with the Media and Editorial teams.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 animate-pulse" />
            <div className="space-y-1">
              <div className="h-2 w-40 rounded bg-white/15" />
              <div className="h-2 w-24 rounded bg-white/10" />
            </div>
          </div>
          <span className="text-xs text-white/40">No episodes yet</span>
        </div>
      </div>

      <PageSection title="Planned episode themes">
        <div className="grid gap-4 sm:grid-cols-2">
          {episodeThemes.map((item) => (
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
    </PageShell>
  );
}
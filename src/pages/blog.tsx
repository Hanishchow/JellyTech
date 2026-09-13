"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";
import { PageSection } from "@/components/page-section";
import { Newspaper, FileText, Camera, ScrollText } from "lucide-react";

const blogSeries = [
  {
    title: "GeneScene — Paper of the Week",
    description: "One research paper explained each week in accessible language.",
    icon: FileText,
  },
  {
    title: "Biotech News",
    description: "Important developments in biotechnology and life sciences.",
    icon: Newspaper,
  },
  {
    title: "Conference Diaries",
    description: "Student experiences from external scientific events.",
    icon: Camera,
  },
  {
    title: "Digital Magazine",
    description: "The best of the club's scientific communication, collected.",
    icon: ScrollText,
  },
];

export function BlogPage() {
  return (
    <PageShell
      badge="Blog"
      title="Blog & Digital Magazine"
      subtitle="JELLYTECH's written and visual science communication — produced by the Editorial & Design team, reviewed for scientific accuracy, and open to contributors from every department."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {blogSeries.map((item) => (
          <Card key={item.title} className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-6 space-y-3">
              <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
              <p className="text-xs text-white/35">Coming soon</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <PageSection title="Latest articles">
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
          <p className="mx-auto max-w-xl text-sm text-white/55 leading-relaxed">
            The first articles are being prepared once the editorial workflow
            launches. Want to write? Pitch an idea through the Editorial &amp; Design
            team — every contribution is credited and reviewed.
          </p>
        </div>
      </PageSection>
    </PageShell>
  );
}
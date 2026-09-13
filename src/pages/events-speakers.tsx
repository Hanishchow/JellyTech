"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";
import { PageSection } from "@/components/page-section";
import {
  GraduationCap,
  Microscope,
  Building2,
  Rocket,
  Mic,
  MessageSquare,
  Award,
} from "lucide-react";

const sources = [
  {
    title: "Alumni of AIT",
    description: "Graduates working in research, industry and entrepreneurship, located through professional networks.",
    icon: GraduationCap,
  },
  {
    title: "Faculty & researchers",
    description: "Professor spotlights and academic journeys from inside and beyond the institute.",
    icon: Microscope,
  },
  {
    title: "Industry professionals",
    description: "Biotech, pharma and life-science practitioners sharing career and technical insight.",
    icon: Building2,
  },
  {
    title: "Startup founders",
    description: "Entrepreneurs building companies at the intersection of biology, engineering and data.",
    icon: Rocket,
  },
];

const formats = [
  { title: "Guest lectures", description: "Topic-driven talks on emerging science and applications.", icon: MessageSquare },
  { title: "Expert interactions", description: "Small-group Q&A with visiting researchers and professionals.", icon: Mic },
  { title: "Career sessions", description: "Pathways students may not know exist in biotechnology.", icon: Award },
  { title: "Podcast & interview guests", description: "Conversations recorded for the Plasmid Podcast.", icon: Mic },
];

export function SpeakersPage() {
  return (
    <PageShell
      badge="Events"
      title="Speakers"
      subtitle="JELLYTECH brings researchers, alumni, faculty, industry professionals and founders to students. The speaker program is in its planning phase — the Alumni and Conferences teams are building the network so talks are sourced from long-term relationships, not last-minute requests."
    >
      <PageSection title="Who we invite">
        <div className="grid gap-4 sm:grid-cols-2">
          {sources.map((item) => (
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

      <PageSection title="Engagement formats">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {formats.map((item) => (
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
        <p className="text-sm text-white/45">
          The first speaker sessions are being coordinated with faculty and alumni. Proposals for
          speakers are welcome from any student — pitch the Conferences &amp; Outreach team.
        </p>
      </PageSection>
    </PageShell>
  );
}
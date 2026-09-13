"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";
import { PageSection } from "@/components/page-section";
import { Newspaper, FlaskConical, Briefcase } from "lucide-react";

const updates = [
  {
    title: "Biotech News",
    description:
      "Important developments in biotechnology and life sciences, summarized for students — so the club keeps a campus-wide pulse on what is happening right now.",
    icon: Newspaper,
  },
  {
    title: "Lab Myths vs. Facts",
    description:
      "Common scientific misconceptions explained accurately and responsibly — a recurring series built on the principle of scientific integrity.",
    icon: FlaskConical,
  },
  {
    title: "Careers in Biotech",
    description:
      "Exploring career paths students may not know exist — from industry and research to regulatory, communication, data and beyond.",
    icon: Briefcase,
  },
];

export function ResearchUpdatesPage() {
  return (
    <PageShell
      badge="Research"
      title="Research & Opportunity Updates"
      subtitle="A rolling stream of concise, accurate summaries of what is happening in biotechnology and life sciences, plus the opportunities the club identifies for students."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {updates.map((item) => (
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

      <PageSection
        title="Opportunity feed"
        description="The Conferences & Outreach team maintains the Opportunity Calendar — each entry tracks date, institution, field, eligibility, registration deadline, cost, location, relevance and club action required."
      >
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
          <p className="mx-auto max-w-xl text-sm text-white/55 leading-relaxed">
            No posts yet. Updates will begin with the first confirmed external
            events and will be posted here and promoted across campus by the
            Cultural &amp; Engagement team.
          </p>
        </div>
      </PageSection>
    </PageShell>
  );
}
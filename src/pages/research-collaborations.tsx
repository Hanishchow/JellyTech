"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";
import { PageSection } from "@/components/page-section";
import {
  GraduationCap,
  Rocket,
  Building2,
  Landmark,
  Handshake,
} from "lucide-react";

const collaborations = [
  {
    title: "Alumni network",
    description:
      "A long-term relationship with AIT graduates in research, industry and entrepreneurship — built as an institutional network, not a list of last-minute speakers.",
    icon: GraduationCap,
  },
  {
    title: "Startups & entrepreneurs",
    description:
      "Interaction with founders building companies at the intersection of biology, engineering, data and design.",
    icon: Rocket,
  },
  {
    title: "Industry & pharmaceutical organizations",
    description:
      "Visits, talks and career pathways across the biotechnology and pharma ecosystem.",
    icon: Building2,
  },
  {
    title: "Research institutions & universities",
    description:
      "The Institutional Exposure Program connects students with academic research beyond the syllabus.",
    icon: Landmark,
  },
  {
    title: "Interdisciplinary collaboration at AIT",
    description:
      "Biotechnology-led but AIT-wide: electronics, aeronautics, mechanical, CS/AI and design students all contribute to the club.",
    icon: Handshake,
  },
];

export function CollaborationsPage() {
  return (
    <PageShell
      badge="Research"
      title="Collaborations"
      subtitle="JELLYTECH is built on relationships — with alumni, startups, industry, research institutions and the wider AIT community — maintained as an ongoing network rather than a series of one-off transactions."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collaborations.map((item, i) => (
          <Card
            key={item.title}
            className={
              i === 0
                ? "bg-primary/5 border-primary/20 sm:col-span-2"
                : "bg-zinc-900/80 border-white/10"
            }
          >
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
        description="The potential contributions across departments are what make JELLYTECH a biotechnology-led, interdisciplinary organization."
      >
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-900 text-white/60">
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Potential contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-zinc-900/60">
              {[
                ["Biotechnology", "Scientific research & subject expertise"],
                ["Computer Science / AI", "Data and AI applications"],
                ["Electronics", "Hardware and instrumentation"],
                ["Mechanical", "Design and prototyping"],
                ["Aeronautical", "Technical collaboration"],
                ["Design-oriented students", "Graphics and visual communication"],
                ["Any department", "Media, management, outreach, writing"],
              ].map(([dept, role]) => (
                <tr key={dept}>
                  <td className="px-4 py-3 text-white/85 font-medium">{dept}</td>
                  <td className="px-4 py-3 text-white/60">{role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageSection>
    </PageShell>
  );
}
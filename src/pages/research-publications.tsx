"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";
import { PageSection } from "@/components/page-section";
import { FileText, BookOpen, ScrollText, Presentation } from "lucide-react";

const publicationTypes = [
  {
    title: "Student articles & scientific explainers",
    description: "Long-form pieces that make research and biotech concepts readable.",
    icon: FileText,
  },
  {
    title: "Conference & event reports",
    description: "Coverage of external events written by attending students.",
    icon: BookOpen,
  },
  {
    title: "Digital magazine",
    description: "A periodic collection of the club's best scientific communication.",
    icon: ScrollText,
  },
  {
    title: "Annual report",
    description: "An annual review of achievements, opportunities and outcomes.",
    icon: Presentation,
  },
];

export function PublicationsPage() {
  return (
    <PageShell
      badge="Research"
      title="Publications"
      subtitle="The written record of JELLYTECH's scientific communication — produced by the Editorial & Design team in collaboration with Media."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {publicationTypes.map((item) => (
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

      <PageSection title="Our first publication will appear here">
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center space-y-3">
          <p className="mx-auto max-w-xl text-sm text-white/55 leading-relaxed">
            All JELLYTECH publications follow the principles of scientific integrity
            and responsible communication — every piece is reviewed before release.
            Contributions from students in any department are welcome through the
            Editorial &amp; Design team.
          </p>
        </div>
      </PageSection>
    </PageShell>
  );
}
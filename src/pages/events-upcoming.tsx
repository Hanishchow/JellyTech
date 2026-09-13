"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";
import { PageSection } from "@/components/page-section";
import {
  Book,
  Zap,
  Mic,
  Calendar,
  Users,
  Compass,
  Search,
  ClipboardCheck,
  Rocket,
  FileText,
  RefreshCw,
  ShieldCheck as Shield,
} from "lucide-react";

const eventFlow = [
  { step: "1. Discover", description: "A team identifies an opportunity in the scientific ecosystem.", icon: Search },
  { step: "2. Propose", description: "The team prepares a short proposal.", icon: FileText },
  { step: "3. Approve", description: "Review by the appropriate leadership and faculty.", icon: ClipboardCheck },
  { step: "4. Execute", description: "Relevant teams independently perform their assigned roles.", icon: Rocket },
  { step: "5. Document", description: "Media and Editorial teams record the activity.", icon: Mic },
  { step: "6. Review", description: "A post-event report records outcomes, feedback and recommendations.", icon: RefreshCw },
];

const themes = [
  { title: "Infectious Diseases", scope: "Conferences & workshops", icon: Book, note: "Epidemiology, disease biology and public health." },
  { title: "Flow Cytometry", scope: "Technical workshop", icon: Zap, note: "Cell analysis and sorting techniques." },
  { title: "Spatial Omics", scope: "Conference / symposium", icon: Mic, note: "Spatial transcriptomics and proteomics." },
  { title: "Advanced Microscopy", scope: "Institutional exposure", icon: Calendar, note: "Imaging research facilities and methods." },
  { title: "Neuroscience", scope: "Symposium & lectures", icon: Users, note: "Brain research and cognition." },
  { title: "Pharma & Biomanufacturing", scope: "Industry visits", icon: Compass, note: "Drug development, production and scale-up." },
  { title: "Biosafety", scope: "Training program", icon: Shield, note: "Laboratory safety and regulations." },
  { title: "Synthetic Biology", scope: "Hackathons & hands-on", icon: Zap, note: "Engineering biological systems." },
];

export function EventsPage() {
  return (
    <PageShell
      badge="Events"
      title="Upcoming Events & Opportunity Calendar"
      subtitle="The club researches, evaluates and coordinates scientific conferences, symposiums, workshops, courses and institutional programs on behalf of students — then documents every activity so each one feeds the next."
    >
      <PageSection
        title="How an event happens"
        description="Every major activity follows a standard six-stage process instead of being treated as an isolated task."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eventFlow.map((item) => (
            <Card key={item.step} className="bg-zinc-900/80 border-white/10">
              <CardContent className="p-5 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-white">{item.step}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>

      <PageSection
        title="Proposed opportunity themes"
        description="The founding proposal identifies these as the initial focus areas for the Opportunity Calendar. Each tracked opportunity records date, institution, field, eligibility, cost, location, relevance, recommended student profile and the club action required."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {themes.map((theme) => (
            <Card key={theme.title} className="bg-zinc-900/80 border-white/10">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <theme.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-white">{theme.title}</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                      {theme.scope}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-white/55">{theme.note}</p>
                  <p className="mt-2 text-xs text-white/35">
                    Status: proposed — being researched by the Conferences &amp; Outreach team
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5">
          <p className="text-sm text-white/50">
            The post-event report scales across the club's workflow: students can
            check how a visit relates to <span className="text-white/80">field, eligibility</span> and{" "}
            <span className="text-white/80">relevance</span>, and later review outcomes under
            "Future Action".
          </p>
        </div>
      </PageSection>
    </PageShell>
  );
}
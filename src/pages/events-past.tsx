"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { PageSection } from "@/components/page-section";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  Users,
  ClipboardCheck,
  Camera,
  Scale,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

const reportFields = [
  "Event Name",
  "Date",
  "Venue",
  "Organizing Team",
  "Collaborating Teams",
  "Objective",
  "Description",
  "Participants",
  "Key Outcomes",
  "Student Feedback",
  "Media Coverage",
  "Financial Summary",
  "Challenges",
  "Recommendations",
  "Future Action",
];

const coverage = [
  { title: "Participants", description: "Every event records who attended and from which departments.", icon: Users },
  { title: "Outcomes & feedback", description: "What worked, what did not, and what students took away.", icon: ClipboardCheck },
  { title: "Media coverage", description: "Photos, geotagged documentation and recordings are archived.", icon: Camera },
  { title: "Financial summary", description: "Expenditure and approvals are tracked for transparency.", icon: Scale },
  { title: "Challenges & recommendations", description: "Problems encountered feed into future recommendations.", icon: MessageSquare },
  { title: "Future action", description: "Every report closes the loop into the next opportunity.", icon: TrendingUp },
];

export function PastEventsPage() {
  return (
    <PageShell
      badge="Events"
      title="Past Events"
      subtitle="The club documents every activity so that each year's work becomes the foundation for the next. No events have been recorded yet — this page will grow as the first activities complete."
    >
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-white">No events recorded yet</h2>
        <p className="mx-auto max-w-xl text-sm text-white/55 leading-relaxed">
          Our first workshops, conferences and institutional visits are in planning.
          Once they complete, the event archive — including post-event reports,
          media and outcomes — will appear here.
        </p>
        <Button asChild>
          <Link to="/events/upcoming">
            View planned opportunities <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <PageSection
        title="Standard post-event report"
        description="Every major JELLYTECH activity produces a short standardized report using these sections."
      >
        <div className="flex flex-wrap gap-2">
          {reportFields.map((field) => (
            <span
              key={field}
              className="rounded-full border border-white/10 bg-zinc-900/70 px-3 py-1.5 text-xs text-white/65"
            >
              {field}
            </span>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coverage.map((item) => (
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
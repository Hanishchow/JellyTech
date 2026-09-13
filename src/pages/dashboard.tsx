"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BrowserWindow } from "@/components/ui/mock-browser-window";
import {
  FloatingPanelRoot,
  FloatingPanelTrigger,
  FloatingPanelContent,
  FloatingPanelForm,
  FloatingPanelLabel,
  FloatingPanelTextarea,
  FloatingPanelHeader,
  FloatingPanelBody,
  FloatingPanelFooter,
  FloatingPanelCloseButton,
  FloatingPanelSubmitButton,
} from "@/components/ui/floating-panel";
import { MorphingPageDots } from "@/components/ui/morphing-page-dots";
import { Toggle } from "@/components/ui/toggle";
import {
  Book,
  Users,
  Zap,
  Mic,
  Calendar,
  ArrowRight,
  ExternalLink,
  Bell,
  StickyNote,
  Layers,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Real content drawn from the JELLYTECH DPR                          */
/* ------------------------------------------------------------------ */

const stats = [
  { label: "Core Pillars", value: "3", icon: Layers, color: "text-primary" },
  {label: "Functional Teams", value: "8", icon: Users, color: "text-green-400" },
  { label: "Media Series", value: "9", icon: Mic, color: "text-blue-400" },
  { label: "Engagement Model", value: "6", icon: Zap, color: "text-purple-400" },
];

const opportunityThemes = [
  { title: "Infectious Diseases", scope: "Conferences & workshops", icon: Book },
  { title: "Flow Cytometry", scope: "Technical workshop", icon: Zap },
  { title: "Spatial Omics", scope: "Conference / symposium", icon: Mic },
  { title: "Advanced Microscopy", scope: "Institutional exposure", icon: Calendar },
  { title: "Neuroscience", scope: "Symposium & lectures", icon: Users },
  { title: "Pharma & Biomanufacturing", scope: "Industry visits", icon: Book },
  { title: "Biosafety", scope: "Training program", icon: Calendar },
  { title: "Synthetic Biology", scope: "Hackathons & hands-on", icon: Zap },
];

const pillars = [
  {
    id: "I",
    title: "Industry & Scientific Exposure",
    description:
      "Conferences, symposiums, workshops, industry and research institute visits, guest lectures, hackathons and career sessions.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "II",
    title: "Interdisciplinary Science Community",
    description:
      "An AIT-wide community of science communicators — explainers, Paper of the Week (GeneScene), biotech news, lab myths vs. facts and the Plasmid Podcast.",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    id: "III",
    title: "Research & Institutional Exposure",
    description:
      "Direct links to universities, research institutes, labs and companies through the Institutional Exposure Program.",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
];

const THEME_PAGE_SIZE = 2;

export function DashboardPage() {
  const [themePage, setThemePage] = useState(0);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const totalPages = Math.ceil(opportunityThemes.length / THEME_PAGE_SIZE);
  const pagedThemes = opportunityThemes.slice(
    themePage * THEME_PAGE_SIZE,
    themePage * THEME_PAGE_SIZE + THEME_PAGE_SIZE
  );

  return (
    <div className="min-h-screen px-4 py-20 flex items-start justify-center bg-background">
      <BrowserWindow
        size="xl"
        variant="chrome"
        headerStyle="full"
        url="jellytech.org/dashboard"
        className="h-[900px] w-full"
      >
        <div className="p-6 lg:p-8 space-y-8 overflow-y-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-white/60 mt-1">
                Your home base for the student-led scientific ecosystem at Acharya
                Institute of Technology.
              </p>
            </div>
            <Button asChild>
              <a href="/events/upcoming">
                Opportunity Calendar{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-zinc-900/80 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">{stat.label}</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "h-12 w-12 rounded-lg flex items-center justify-center",
                        stat.color
                      )}
                    >
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-zinc-900/80 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Opportunity Calendar</CardTitle>
                  <p className="text-xs text-white/45 mt-1">
                    Proposed themes from the founding proposal
                  </p>
                </div>
                <Button variant="ghost" asChild size="sm">
                  <a href="/events/upcoming">
                    View All <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/10">
                  {pagedThemes.map((theme, i) => (
                    <div
                      key={i}
                      className="p-4 hover:bg-white/5 transition-colors flex items-center gap-4"
                    >
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <theme.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">
                          {theme.title}
                        </h4>
                        <p className="text-xs text-white/45 mt-1">
                          Proposed theme — details to be confirmed
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary whitespace-nowrap">
                        {theme.scope}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center py-3">
                  <MorphingPageDots
                    count={totalPages}
                    activeIndex={themePage}
                    onDotClick={setThemePage}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/80 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl">Core Pillars</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/10">
                  {pillars.map((pillar) => (
                    <div key={pillar.id} className="p-4 hover:bg-white/5 transition-colors flex items-start gap-4">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold",
                          pillar.bgColor,
                          pillar.color
                        )}
                      >
                        {pillar.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white">{pillar.title}</h4>
                        <p className="text-sm text-white/50 mt-1 leading-relaxed">
                          {pillar.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FloatingPanelRoot>
              <Card className="bg-zinc-900/80 border-white/10 h-full">
                <CardHeader>
                  <CardTitle className="text-xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-3 bg-zinc-800 border-white/10 hover:bg-zinc-700">
                    <Calendar className="h-5 w-5" /> Create Event
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 bg-zinc-800 border-white/10 hover:bg-zinc-700">
                    <Book className="h-5 w-5" /> Submit Paper
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 bg-zinc-800 border-white/10 hover:bg-zinc-700">
                    <Mic className="h-5 w-5" /> Record Podcast
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 bg-zinc-800 border-white/10 hover:bg-zinc-700">
                    <Users className="h-5 w-5" /> Invite Members
                  </Button>
                  <FloatingPanelTrigger title="Quick Note" className="w-full justify-start gap-3 bg-zinc-800 border-white/10 hover:bg-zinc-700">
                    <StickyNote className="h-5 w-5" /> Quick Note
                  </FloatingPanelTrigger>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-white">Notifications</p>
                        <p className="text-xs text-white/50">Stay updated on events</p>
                      </div>
                    </div>
                    <Toggle
                      pressed={notificationsOn}
                      onPressedChange={setNotificationsOn}
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      aria-label="Toggle notifications"
                    >
                      {notificationsOn ? "On" : "Off"}
                    </Toggle>
                  </div>
                </CardContent>
              </Card>

              <FloatingPanelContent className="w-80 h-72">
                <FloatingPanelForm
                  onSubmit={(note) => console.log("Quick note:", note)}
                >
                  <FloatingPanelHeader>Jot something down</FloatingPanelHeader>
                  <FloatingPanelBody className="flex-1 p-0">
                    <FloatingPanelLabel htmlFor="quick-note">
                      Write a quick note for the team
                    </FloatingPanelLabel>
                    <FloatingPanelTextarea
                      id="quick-note"
                      className="text-zinc-900 dark:text-zinc-100"
                      placeholder="e.g. Book Room 301 for the AI workshop…"
                    />
                  </FloatingPanelBody>
                  <FloatingPanelFooter>
                    <FloatingPanelCloseButton />
                    <FloatingPanelSubmitButton />
                  </FloatingPanelFooter>
                </FloatingPanelForm>
              </FloatingPanelContent>
            </FloatingPanelRoot>

            <Card className="bg-zinc-900/80 border-white/10 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl">Announcements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <h4 className="font-medium text-primary mb-1">
                    Biotechnology-led, AIT-wide
                  </h4>
                  <p className="text-white/80 text-sm">
                    Membership is open to students from every department of Acharya
                    Institute of Technology — not just Biotechnology. Discover → Engage
                    → Create → Communicate → Connect → Continue.
                  </p>
                  <Button asChild size="sm" className="mt-2">
                    <a href="/signup">
                      Join the Movement <ArrowRight className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="font-medium text-green-400 mb-1">
                    Plasmid Podcast — Campus Science Podcast
                  </h4>
                  <p className="text-white/80 text-sm">
                    Conversations with researchers, alumni, faculty and students —
                    coming soon.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-2 border-green-500/50 text-green-400 hover:bg-green-500/10">
                    <a href="/podcasts">
                      Listen <ArrowRight className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <h4 className="font-medium text-purple-400 mb-1">
                    Paper of the Week — GeneScene
                  </h4>
                  <p className="text-white/80 text-sm">
                    A recurring series that explains one research paper in accessible
                    language every week.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                    <a href="/research/papers">
                      Read <ArrowRight className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </BrowserWindow>
    </div>
  );
}
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
import { Book, Users, Zap, Mic, Calendar, Clock, ArrowRight, ExternalLink, Bell, StickyNote } from "lucide-react";

const stats = [
  { label: "Events This Month", value: "12", icon: Calendar, color: "text-primary" },
  { label: "Active Members", value: "247", icon: Users, color: "text-green-400" },
  { label: "Research Papers", value: "34", icon: Book, color: "text-blue-400" },
  { label: "Podcast Episodes", value: "18", icon: Mic, color: "text-purple-400" },
];

const upcomingEvents = [
  {
    title: "AI in Genomics Workshop",
    date: "2026-09-20",
    time: "10:00 AM - 4:00 PM",
    location: "Bio Infinity Lab, Room 301",
    type: "workshop",
  },
  {
    title: "CRISPR Technology Seminar",
    date: "2026-09-25",
    time: "2:00 PM - 5:00 PM",
    location: "Main Auditorium",
    type: "seminar",
  },
  {
    title: "Industry Visit: Biotech Solutions Inc.",
    date: "2026-10-02",
    time: "9:00 AM - 3:00 PM",
    location: "Biotech Solutions HQ",
    type: "visit",
  },
  {
    title: "Student Research Symposium",
    date: "2026-10-10",
    time: "All Day",
    location: "Convention Center",
    type: "symposium",
  },
];

const recentActivity = [
  { action: "New research paper published", time: "2 hours ago", type: "research" },
  { action: "Podcast Episode 18 released", time: "5 hours ago", type: "podcast" },
  { action: "Workshop registration opened", time: "1 day ago", type: "event" },
  { action: "New member joined: Sarah Chen", time: "2 days ago", type: "member" },
  { action: "Industry visit confirmed", time: "3 days ago", type: "visit" },
];

const EVENT_PAGE_SIZE = 2;

export function DashboardPage() {
  const [eventPage, setEventPage] = useState(0);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const eventPages = Math.ceil(upcomingEvents.length / EVENT_PAGE_SIZE);
  const pagedEvents = upcomingEvents.slice(
    eventPage * EVENT_PAGE_SIZE,
    eventPage * EVENT_PAGE_SIZE + EVENT_PAGE_SIZE
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
              <p className="text-white/60 mt-1">Welcome back! Here's what's happening at JellyTech.</p>
            </div>
            <Button asChild>
              <a href="/events/upcoming">View All Events <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-zinc-900/80 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">{stat.label}</p>
                      <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", stat.color)}>
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
                <CardTitle className="text-xl">Upcoming Events</CardTitle>
                <Button variant="ghost" asChild size="sm">
                  <a href="/events">View All <ExternalLink className="ml-1 h-3 w-3" /></a>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/10">
                  {pagedEvents.map((event, index) => (
                    <div key={index} className="p-4 hover:bg-white/5 transition-colors flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{event.title}</h4>
                        <p className="text-sm text-white/60 flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" /> {event.date} •
                          <Clock className="h-3.5 w-3.5 ml-2" /> {event.time}
                        </p>
                        <p className="text-xs text-white/40 flex items-center gap-1 mt-1">
                          <ExternalLink className="h-3 w-3" /> {event.location}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                        {event.type}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center py-3">
                  <MorphingPageDots
                    count={eventPages}
                    activeIndex={eventPage}
                    onDotClick={setEventPage}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/80 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                <Button variant="ghost" asChild size="sm">
                  <a href="/activity">View All <ExternalLink className="ml-1 h-3 w-3" /></a>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/10">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="p-4 hover:bg-white/5 transition-colors flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Book className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm">{activity.action}</p>
                        <p className="text-xs text-white/50">{activity.time}</p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/60">
                        {activity.type}
                      </span>
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
                    <FloatingPanelTextarea id="quick-note" className="text-zinc-900 dark:text-zinc-100" placeholder="e.g. Book Room 301 for the AI workshop…" />
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
                  <h4 className="font-medium text-primary mb-1">New Semester Registration Open!</h4>
                  <p className="text-white/80 text-sm">Registration for the Fall 2026 semester is now open. Secure your spot in upcoming workshops and research programs.</p>
                  <Button asChild size="sm" className="mt-2">
                    <a href="/register">Register Now <ArrowRight className="ml-1 h-3 w-3" /></a>
                  </Button>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="font-medium text-green-400 mb-1">Research Grant Applications</h4>
                  <p className="text-white/80 text-sm">Applications for the Bio Infinity Research Grant are now being accepted. Deadline: October 15, 2026.</p>
                  <Button asChild variant="outline" size="sm" className="mt-2 border-green-500/50 text-green-400 hover:bg-green-500/10">
                    <a href="/grants">Apply Now <ArrowRight className="ml-1 h-3 w-3" /></a>
                  </Button>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <h4 className="font-medium text-purple-400 mb-1">New Podcast Season!</h4>
                  <p className="text-white/80 text-sm">Season 3 of "BioTech Unfiltered" launches next week. Featuring interviews with leading researchers and industry experts.</p>
                  <Button asChild variant="outline" size="sm" className="mt-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                    <a href="/podcasts">Listen Now <ArrowRight className="ml-1 h-3 w-3" /></a>
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
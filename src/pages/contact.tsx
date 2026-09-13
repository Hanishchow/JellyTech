"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/page-shell";
import { Building2, Mail, Send, Users } from "lucide-react";

export function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <PageShell
      badge="Contact"
      title="Get in touch"
      subtitle="JELLYTECH is a biotechnology-led, AIT-wide club. Questions, speaker suggestions, media pitches and department collaborations are all welcome."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-zinc-900/80 border-white/10">
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Send a message</h2>
              <p className="text-sm text-white/55 mt-1">
                Your message goes to the core team. Include what you are interested in
                — joining, volunteering, speaking or collaborating.
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="contact-name" className="text-white">
                  Name
                </Label>
                <Input
                  id="contact-name"
                  required
                  placeholder="Your name"
                  className="bg-zinc-800 border-white/10 text-white placeholder-white/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-white">
                  Email
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="bg-zinc-800 border-white/10 text-white placeholder-white/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-message" className="text-white">
                  Message
                </Label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  placeholder="How can we help, or how would you like to contribute?"
                  className="w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Send className="mr-2 h-4 w-4" /> Send message
              </Button>
              {sent && (
                <p className="text-sm text-green-400 text-center">
                  Thanks — we'll get back to you soon.
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-white">Where we operate</h3>
                <p className="text-sm text-white/60 mt-1 leading-relaxed">
                  Acharya Institute of Technology, Soldevanahalli, Bengaluru. Find us
                  through the Biotechnology Department and the campus club ecosystem.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-white">Reaching the teams</h3>
                <p className="text-sm text-white/60 mt-1 leading-relaxed">
                  Connect with the Alumni, Media, Editorial &amp; Design, Conferences
                  and other teams directly once roles are announced. Until then, the
                  message form reaches the core team.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-white">Biotechnology-led, AIT-wide</h3>
                <p className="text-sm text-white/60 mt-1 leading-relaxed">
                  Students from every department are welcome — CS/AI, electronics,
                  mechanical, aeronautical and design contribute to the club's
                  functioning alongside biotechnology.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
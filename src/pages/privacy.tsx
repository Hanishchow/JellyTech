"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";

const sections = [
  ["1. What we collect", "Contact information you provide (name, email) and participation records for club activities. Public documentation such as photographs and media is collected only with appropriate permission."],
  ["2. How it is used", "Information is used for club administration, event coordination, communication, documentation and the annual report."],
  ["3. Sharing", "Personal details are not sold or shared commercially. Documentation such as event media and reports may be shared for institutional purposes in accordance with college rules."],
  ["4. Records", "The club maintains a centralized digital archive of reports, media and contacts that is transferred between successive leadership teams."],
  ["5. Your choices", "You may request to withdraw from participation records or media where not required for institutional documentation."],
];

export function PrivacyPage() {
  return (
    <PageShell
      badge="Legal"
      title="Privacy Policy"
      subtitle="How JELLYTECH handles information shared by its members."
    >
      <div className="space-y-4">
        {sections.map(([title, body]) => (
          <Card key={title} className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-6">
              <h2 className="font-semibold text-white mb-2">{title}</h2>
              <p className="text-sm text-white/60 leading-relaxed">{body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
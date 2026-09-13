"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";

const sections = [
  ["1. Governance", "JELLYTECH functions as a student-led, faculty-supervised, non-commercial, co-curricular organization of Acharya Institute of Technology, subject to the rules of the institute."],
  ["2. Membership", "Membership is open to eligible students of Acharya Institute of Technology in accordance with institutional regulations. Participation is voluntary and flexible."],
  ["3. Content & intellectual property", "Scientific content produced by the club is communicated responsibly, without plagiarism or misrepresentation. Appropriate permission is obtained before publishing photographs or recordings where required."],
  ["4. Financial activities", "All financial activities comply with the financial regulations and approval mechanisms of Acharya Institute of Technology. No personal collection or unauthorized commitment is made on behalf of the club."],
  ["5. External representation", "Members representing JELLYTECH maintain professional conduct and represent the institution responsibly at external events."],
  ["6. Amendments & dissolution", "Amendments to the constitution may be proposed by the Executive Committee subject to approval by the Faculty Coordinator and competent institutional authority. The organization may be dissolved only in accordance with the rules and procedures of Acharya Institute of Technology."],
];

export function TermsPage() {
  return (
    <PageShell
      badge="Legal"
      title="Terms of Service"
      subtitle="The terms governing membership, participation and conduct within JELLYTECH."
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
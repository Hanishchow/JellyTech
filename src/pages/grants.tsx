"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";
import { PageSection } from "@/components/page-section";
import { Wallet, ShieldCheck, FileText, Handshake } from "lucide-react";

const points = [
  {
    title: "Approved institutional funding",
    description: "Institutional allocations, approved event funding and other officially authorized sources.",
    icon: Wallet,
  },
  {
    title: "Approval & documentation",
    description: "Every transaction is documented — budgets, receipts and expenditure all follow college regulations.",
    icon: FileText,
  },
  {
    title: "Regulatory compliance",
    description: "No personal collection or unauthorized financial commitment is ever made on behalf of the club.",
    icon: ShieldCheck,
  },
  {
    title: "Sponsorships & collaborations",
    description: "Sought only where permitted, always through the proper approval mechanisms.",
    icon: Handshake,
  },
];

export function GrantsPage() {
  return (
    <PageShell
      badge="Grants"
      title="Research Grants & Funding"
      subtitle="JELLYTECH helps students identify research opportunities and funding available through approved institutional channels. Direct grant programs, where applicable, will be announced here."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {points.map((item) => (
          <Card key={item.title} className="bg-zinc-900/80 border-white/10">
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

      <PageSection title="Current opportunities">
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center space-y-3">
          <p className="mx-auto max-w-xl text-sm text-white/55 leading-relaxed">
            No grant calls are open right now. When the club identifies eligible
            funding or awards, they will appear here with eligibility, deadlines and
            the club action required.
          </p>
        </div>
      </PageSection>
    </PageShell>
  );
}
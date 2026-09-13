"use client";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export function NotFoundPage() {
  return (
    <PageShell
      badge="404"
      title="Page not found"
      subtitle="This section hasn't been created yet, or the address is wrong."
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" /> Back to home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go to dashboard
          </Link>
        </Button>
      </div>
    </PageShell>
  );
}
"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  badge?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}

export function PageShell({
  badge,
  title,
  subtitle,
  children,
  className,
}: PageShellProps) {
  return (
    <div className="relative min-h-screen bg-background pt-28 pb-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.10),transparent_60%)]" />
      <div className={cn("relative mx-auto max-w-6xl px-4 space-y-12", className)}>
        <header className="space-y-4">
          {badge && (
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
              {badge}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-3xl text-lg text-white/60 leading-relaxed">
              {subtitle}
            </p>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}
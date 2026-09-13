"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
   The page furniture.

   Everything here is sized to be seen from across a room. The first version of
   this file was built like a printed journal, which produced pages that read
   as briefing documents: small headings, a grey rule above each one, body copy
   doing all the work. The type is now the design. A section heading is 3rem of
   Bricolage at 800, a masthead is twice that, and the violet rule above each
   section is thick enough to read as a band rather than a hairline.

   Nothing here draws a card. Cards were what made every page of the old site
   look the same: a grid of identical boxes regardless of what was in them.
   Scale, rules and light carry the structure instead, which is what lets a page
   of eight items and a page of three look meaningfully different.
   -------------------------------------------------------------------------- */

export function Masthead({
  eyebrow,
  title,
  standfirst,
  children,
}: {
  eyebrow?: string;
  title: string;
  standfirst?: string;
  children?: ReactNode;
}) {
  return (
    <header className="relative border-b border-rule pb-16 pt-40">
      {/* A bloom behind the masthead, as though the page itself were lit from
          under the headline. Fixed size in vw so it scales with the type. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-16 h-[38vw] max-h-[36rem]"
        style={{
          background:
            "radial-gradient(60% 60% at 22% 40%, rgb(var(--glow) / 0.18), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-page px-6">
        {eyebrow && <p className="label mb-8">{eyebrow}</p>}
        <h1 className="max-w-[15ch] text-display">{title}</h1>
        {standfirst && (
          <p className="measure mt-10 text-lead text-ink-muted">{standfirst}</p>
        )}
        {children}
      </div>
    </header>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="relative pb-40">
      {/* The sub-page ground. Its one rule lives in globals.css so the gradient
          sheet can be dropped in there without touching any page. */}
      <div className="page-ground" aria-hidden="true" />
      {children}
    </div>
  );
}

export function Section({
  title,
  intro,
  children,
  className,
}: {
  title?: string;
  intro?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mx-auto max-w-page px-6 pt-28", className)}>
      {/* No section numbering. A folio mark above every heading is the
          templated rhythm that makes generated pages look generated; the
          heading alone says what the section is, and its position on the page
          already orders it. */}
      {(title || intro) && (
        <div className="mb-14 border-t-4 border-glow pt-8">
          {title && <h2 className="max-w-[16ch] text-heading">{title}</h2>}
          {intro && <p className="measure mt-6 text-lg text-ink-muted">{intro}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

/* An index: numbered rows for anything with an order to it, a process, a set of
   principles, a list of roles. The ordinal is set big enough to be part of the
   composition rather than a bullet substitute. */
export function Index({
  items,
}: {
  items: { term: string; detail: string; aside?: string }[];
}) {
  return (
    <ol className="border-t border-rule">
      {items.map((item, i) => (
        <li
          key={item.term}
          className="group grid gap-3 border-b border-rule py-8 transition-colors hover:bg-glow/[0.06] md:grid-cols-[6rem_22rem_1fr] md:gap-10"
        >
          <span className="font-mono text-2xl font-semibold leading-none text-glow/70 transition-colors group-hover:text-glow-bright md:text-3xl">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="font-display text-2xl md:text-[1.75rem]">{item.term}</h3>
          <div>
            <p className="measure text-ink-muted">{item.detail}</p>
            {item.aside && <p className="label mt-3">{item.aside}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* A plate: the figure-like treatment, for things that are scanned rather than
   read in order. */
export function Plates({
  items,
  columns = 3,
}: {
  items: { term: string; detail: string }[];
  columns?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        "grid gap-x-12 gap-y-14 border-t border-rule pt-12",
        columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"
      )}
    >
      {items.map((item) => (
        <div key={item.term} className="border-l-2 border-glow/40 pl-6">
          <h3 className="font-display text-2xl md:text-[1.6rem]">{item.term}</h3>
          <p className="mt-3 leading-relaxed text-ink-muted">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

/* A pull quote, used sparingly, for the two or three statements on the site
   that are actually worth setting large. This is one of the few places the
   glow is turned on: it is a claim about the club, so it should look lit. */
export function Pull({ children, cite }: { children: ReactNode; cite?: string }) {
  return (
    <figure className="mx-auto max-w-page px-6 py-28">
      <blockquote className="lit max-w-[24ch] font-display text-title font-bold">
        {children}
      </blockquote>
      {cite && <figcaption className="label mt-10">{cite}</figcaption>}
    </figure>
  );
}

/* A note: the aside for the handful of places where the honest answer is "this
   has not happened yet". It takes the signal colour, not the brand violet, so
   that "not yet" never gets mistaken for "here it is". */
export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="measure border-l-4 border-signal bg-signal/[0.08] px-7 py-6 leading-relaxed text-ink-muted">
      {children}
    </p>
  );
}

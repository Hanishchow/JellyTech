"use client";

import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { cn } from "@/lib/utils";
import { asset } from "@/lib/asset";

const NAV = [
  { title: "About", url: "/about" },
  { title: "Programs", url: "/programs" },
  { title: "Media", url: "/media" },
  { title: "Team", url: "/team" },
  { title: "Join", url: "/join" },
];

export function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [settled, setSettled] = useState(false);

  // The site is one ground throughout, so the bar no longer swaps palettes. It
  // only gains its backing once the reader has left the top of the page, which
  // keeps the jellyfish uninterrupted for the first screen.
  //
  // Motion's scroll value rather than a scroll listener of our own: this runs
  // off the React render cycle and touches state only on the one frame the
  // threshold is crossed, instead of every scroll frame.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const past = y > 80;
    setSettled((was) => (was === past ? was : past));
  });

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 text-ink transition-colors duration-500",
        settled
          ? "border-b border-rule bg-ground/85 backdrop-blur-xl"
          : "border-b border-transparent"
      )}
    >
      <nav
        className="mx-auto flex max-w-page items-center justify-between px-6 py-4"
        aria-label="Main"
      >
        <Link to="/" className="group flex items-center gap-3">
          <img
            src={asset("static/img/emblem-128.png")}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 transition-transform duration-500 group-hover:scale-110"
            style={{ filter: "drop-shadow(0 0 10px rgb(var(--glow) / 0.6))" }}
          />
          <span className="font-display text-xl font-extrabold tracking-tight">
            JELLYTECH
          </span>
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              className={({ isActive }) =>
                cn(
                  "relative py-1 text-base font-medium transition-colors",
                  isActive ? "text-glow-bright" : "text-ink-muted hover:text-ink"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.title}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -bottom-0.5 left-0 h-0.5 bg-glow transition-all duration-300",
                      isActive ? "w-full" : "w-0"
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
          <Link
            to="/login"
            className="border border-glow/40 px-4 py-2 text-base font-medium text-ink transition-colors hover:bg-glow hover:text-white"
          >
            Member login
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="font-mono text-xs uppercase tracking-[0.12em] text-glow-bright md:hidden"
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {open && (
        <div className="border-t border-rule bg-ground px-6 py-10 md:hidden">
          <ul className="space-y-5">
            {NAV.map((item) => (
              <li key={item.url}>
                <Link to={item.url} className="font-display text-4xl font-extrabold">
                  {item.title}
                </Link>
              </li>
            ))}
            <li className="pt-4">
              <Link to="/login" className="label">
                Member login
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

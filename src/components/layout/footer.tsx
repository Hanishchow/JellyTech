import { Link } from "react-router-dom";
import { asset } from "@/lib/asset";

const COLUMNS = [
  {
    heading: "The club",
    links: [
      { label: "About", url: "/about" },
      { label: "Team & governance", url: "/team" },
      { label: "Join", url: "/join" },
    ],
  },
  {
    heading: "What we run",
    links: [
      { label: "Programs", url: "/programs" },
      { label: "Media & publishing", url: "/media" },
      { label: "Member login", url: "/login" },
    ],
  },
  {
    heading: "Formalities",
    links: [
      { label: "Privacy", url: "/privacy" },
      { label: "Terms", url: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-rule bg-ground-deep text-ink-muted">
      {/* The emblem, sunk into the floor of the page and glowing through it. */}
      <img
        src={asset("static/img/emblem-512.png")}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-[-6%] w-[34rem] max-w-[70%] opacity-25"
      />

      <div className="relative mx-auto max-w-page px-6 pb-16 pt-24">
        <p className="font-display text-mega leading-none text-ink">
          Jelly<span className="text-glow">Tech</span>
        </p>

        <div className="mt-16 grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <p className="measure text-base leading-relaxed">
            A student-led, faculty-supervised, non-commercial co-curricular
            organization of Acharya Institute of Technology. Biotechnology-led,
            open to every department.
          </p>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h2 className="label">{col.heading}</h2>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.url}>
                    <Link
                      to={link.url}
                      className="transition-colors hover:text-glow-bright"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="relative border-t border-rule">
        <div className="mx-auto flex max-w-page flex-col gap-2 px-6 py-6 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>Acharya Institute of Technology, Bengaluru</span>
          {/* The upstream attribution has not been dropped, only moved: the
              background is Ash Weeks' work under Artistic-2.0, which requires
              the notice to travel with it, and it now sits in the Attribution
              clause on the Terms page rather than the footer strip. */}
          <a
            href="https://hanishchow.github.io/"
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors hover:text-glow-bright"
          >
            Designed and built by Hanishchow
          </a>
        </div>
      </div>
    </footer>
  );
}

# particulate-medusae (unused, kept for reference)

The original WebGL jellyfish simulation by Ash Weeks (milcktoast), Artistic-2.0.
This was the site's background until 2026-09-13. It is no longer loaded by
anything: `src/components/ui/jelly-field.ts` replaced it with a dependency-free
canvas implementation. See the header comment in that file for why.

Kept out of `public/` so it is not shipped (roughly 650KB of JavaScript that
nothing on the site executes), and kept in the repo so the original work and its
attribution are not simply deleted.

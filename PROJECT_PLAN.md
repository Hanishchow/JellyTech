# JellyTech — Project Plan (step-by-step)

> Rule: discuss + approve each step before moving to the next.

## Step 0 — Setup ✅
- Local folder: `JellyTech/`
- GitHub repo: `Hanishchow/JellyTech` (public)

## Step 1 — Outlook ✅ LOCKED
- JellyTech = central channel for events + knowledge under Bio Infinity Forum (funding via forum, HOD on board)
- Pillars: scientific paper presentations, research updates, events, podcasts, fun activities, industry-connect (business ↔ students, industry visits), student-life improvement
- Structure: set of wings; JellyTech sits in editorial wing; founder is POC of editorial wing
- Audience: students (members/recruits), faculty, forum/sponsors, industry contacts

### V1 scope — FULL (locked)
Home, Events, Research & Papers, Podcasts, Industry Connect/Visits, Fun & Student Life, Knowledge Centre, Wings/Team, Join/Contact — all in v1, built incrementally with placeholders.

### Branding + content (locked)
- Theme: I propose a jelly theme (colors/layout) for approval
- Content: placeholders first, real content filled later

## Step 2 — Tech stack (PARTIAL: hero first)
- Hero/first page: classic static stack (upstream Three r72 + vanilla JS, no build
  step, served as-is). Chosen for speed: the approved jellyfish runs unmodified.
- Modern React + TS + shadcn decision DEFERRED until sections need it (UI_STACK
  elements 01–02 require it). Full-v1 sections may mix: classic hero + modern app,
  or full port — founder decides in a later step.

## Step 3 — First page ✅ LIVE (local preview)
- `index.html`: pure fullscreen jellyfish canvas, sim always active, zero overlay
  UI (overlay removed per founder 2026-09-12).
- Dev chrome from upstream demo hidden via CSS (re-enable for tuning).
- Audio omitted (autoplay + 4 MB weight).
- Local preview: http://127.0.0.1:8932/index.html (restart: serve.py 8932 <repo>).
- Original demo still at http://127.0.0.1:8931/index.html for comparison.

## Step 4+ (pending founder's layout steps)
- Tetris loader, scroll-freeze hero, real sections one by one.

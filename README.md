# JellyTech

The website for **JellyTech**, a student-led, faculty-supervised biotechnology
and life-sciences club at Acharya Institute of Technology.

**Live: <https://hanishchow.github.io/JellyTech/>**

The home page is a jellyfish simulation, which is the whole identity: the club
is named after the animal, the palette is lifted from its own emblem, and every
page sits in the same black water it swims in.

---

## Running it

You need **Node 20+** and **pnpm**. Not npm — the lockfile is pnpm's, and
`package.json` declares it, so `npm install` will refuse.

```bash
pnpm install
pnpm dev
```

That serves <http://localhost:3000>. There is no build step to run first and no
backend to start; the site talks to a hosted one.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server, hot reload |
| `pnpm build` | Type-check, then build to `dist/` for the root of a domain |
| `pnpm build:pages` | The same, built for `/JellyTech/` — this is what gets deployed |
| `pnpm typecheck` | Types only, no build |
| `pnpm preview` | Serve the last build locally |

### Environment

Copy the two values into a `.env` at the repo root:

```
VITE_INSFORGE_URL=https://6v9g2tra.ap-southeast.insforge.app
VITE_INSFORGE_ANON_KEY=anon_...
```

Ask Hanish for the anon key, or read it with `npx @insforge/cli secrets get ANON_KEY`.

**It is not a secret.** It is a publishable client key, it ships inside the
JavaScript bundle, and it is meant to. What actually protects member data is
row-level security in Postgres — see [the migrations](insforge/migrations/).
Treat the *admin* key in `.insforge/project.json` completely differently: that
one is gitignored, and it must stay that way.

Without a `.env` the site still runs. The data layer falls back to a
browser-local stand-in, and the Join, Login and member pages say so on the page
rather than pretending to work.

---

## How it is put together

| | |
| --- | --- |
| Framework | React 19 + TypeScript, built by Vite |
| Routing | React Router, `BrowserRouter` with a base path |
| Styling | Tailwind, with the design tokens in `src/styles/globals.css` |
| Motion | Motion (`framer-motion`) |
| Backend | InsForge — Postgres, auth, row-level security |
| Hosting | GitHub Pages, served from the `gh-pages` branch |

```
src/
  components/
    layout/      navbar, footer, and the editorial page furniture
    ui/          everything else, including the jellyfish hero
  lib/
    insforge.ts  the single backend client — read the comment at the top
    backend.ts   members, applications, auth
    admin.ts     the admin panel's data layer
    content.ts   published content, read by the public pages
  pages/         one file per route
  styles/        globals.css: colour, type, the sub-page background
insforge/
  migrations/    the database, as SQL. Read these before changing access rules
public/static/
  medusae/       the jellyfish simulation (see Attribution)
vendor/medusae/  the same, kept out of the build for reference
```

### Things that will surprise you

Every one of these is commented where it lives, but they are the traps:

- **One backend client.** `lib/insforge.ts` exports a single instance and
  everything imports it. Calling `createClient()` a second time gives you a
  second session that is not signed in, which has already cost one debugging
  session.
- **`#container` is `pointer-events-none`.** The simulation attaches
  TrackballControls to it, which binds the wheel and calls `preventDefault`.
  That div is fixed across the whole viewport, so with pointer events on, **the
  entire site cannot be scrolled**.
- **Published is a policy, not a checkbox.** Drafts are invisible because the
  RLS `SELECT` policy says `USING (published)`, not because the client filters
  them.
- **Paths go through `lib/asset.ts`.** The site is served from `/JellyTech/`,
  so a hard-coded `/static/...` is wrong in production and right in dev.

---

## The admin panel

At `/admin`, for signed-in administrators. Applications, the enquiry inbox, and
create/edit/delete for the opportunity calendar, media posts and the team list —
each with a draft/live toggle.

It is deliberately black and white. It is the back office, and the one thing a
back office must never do is make a destructive control look inviting.

Administrators are rows in the `admins` table, added with the service key by a
human. Nothing in the app can grant it: the table has no `INSERT` policy.

```bash
npx @insforge/cli db query "INSERT INTO admins (id, note) \
  SELECT id, 'Media lead' FROM auth.users WHERE email = 'someone@acharya.ac.in'"
```

---

## Deploying

Pages serves the `gh-pages` branch, which holds the built site rather than the
source.

```bash
pnpm build:pages
cp dist/index.html dist/404.html   # SPA fallback: without it, deep links 404
touch dist/.nojekyll
# then commit the contents of dist/ to gh-pages and push
```

`404.html` is not optional. GitHub Pages has no rewrite rule, so a direct visit
to `/JellyTech/team` would 404 without it.

If you would rather this happened by itself on every push to `main`, ask — a
GitHub Actions workflow would take about ten minutes and would mean nobody has
to remember the steps above.

---

## Contributing

`main` is the trunk. Branch from it, open a pull request, and let someone else
read it before it lands.

```bash
git switch main && git pull
git switch -c media/podcast-page
# ...
git push -u origin media/podcast-page
```

Before you open the PR:

- `pnpm typecheck` passes.
- You looked at the page in a browser, not only at the diff.
- You checked it on a narrow window. The jellyfish is framed differently below
  768px and it is easy to break without noticing on a laptop.

Content — opportunities, media posts, team members — does **not** need a pull
request. That is what the admin panel is for. Code changes are for things the
panel cannot express.

---

## Attribution

The jellyfish is [**particulate-medusae**](https://github.com/milcktoast/particulate-medusae)
by Ash Weeks, used under the Artistic-2.0 licence. It runs here essentially as
published: the only change is that its demo control panel is replaced by a
start/stop function, because the panel's markup does not exist on this site and
it throws without it. The physics, geometry, shaders and post-effect chain are
untouched, and the licence notice stays with the code.

Built by [Hanishchow](https://hanishchow.github.io/).

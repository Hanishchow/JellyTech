-- =============================================================================
-- JELLYTECH backend, v2: the admin panel and the content it pushes.
--
-- THE PROBLEM THIS SOLVES
--
-- v1 had no notion of a privileged user, because the obvious implementation is
-- a trap: put a `role` column on `members`, then write a policy on `members`
-- that reads `members` to find out whether you may read `members`. Postgres
-- evaluates that subquery under RLS too, so it recurses, and the usual fix
-- people reach for (making the policy permissive enough to break the loop)
-- quietly opens the table to everyone.
--
-- The way out is a separate `admins` table and a SECURITY DEFINER function.
-- `is_admin()` runs as its owner, so it sees `admins` without RLS applied and
-- cannot recurse into whatever table is asking. Every privileged policy below
-- is one call to it. Nothing grants a user the ability to make themselves an
-- admin: `admins` has no INSERT policy at all, so rows go in through the
-- dashboard with the service key, by a human.
-- =============================================================================

CREATE TABLE IF NOT EXISTS admins (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- An admin may confirm they are one. Nobody may enumerate the others, and
-- there is deliberately no INSERT, UPDATE or DELETE policy.
CREATE POLICY admins_read_own ON admins
  FOR SELECT USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION is_admin()
  RETURNS BOOLEAN
  LANGUAGE SQL
  SECURITY DEFINER
  STABLE
  SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid());
$$;

-- -----------------------------------------------------------------------------
-- Admin reach over the v1 tables
-- -----------------------------------------------------------------------------

-- The roll, and the ability to move an application to active. Members still
-- cannot change their own status; this is the only route.
CREATE POLICY members_admin_read   ON members  FOR SELECT USING (is_admin());
CREATE POLICY members_admin_update ON members  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY members_admin_delete ON members  FOR DELETE USING (is_admin());

-- The enquiry inbox stops being write-only, for admins.
CREATE POLICY messages_admin_read   ON messages FOR SELECT USING (is_admin());
CREATE POLICY messages_admin_update ON messages FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY messages_admin_delete ON messages FOR DELETE USING (is_admin());

-- -----------------------------------------------------------------------------
-- Content the panel pushes to the site
--
-- All three follow the same shape: the world reads what is published, admins
-- read and write everything. `published` is what makes a draft possible, and
-- the public SELECT policy is the only thing enforcing it, so it is not a UI
-- convenience that can be bypassed by hitting the API directly.
-- -----------------------------------------------------------------------------

-- The Opportunity Calendar: conferences, workshops, visits, hackathons.
CREATE TABLE IF NOT EXISTS opportunities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  kind          TEXT NOT NULL DEFAULT 'conference'
                CHECK (kind IN ('conference','workshop','visit','hackathon','course','lecture','other')),
  institution   TEXT,
  field         TEXT,
  location      TEXT,
  starts_on     DATE,
  deadline      DATE,
  cost          TEXT,
  eligibility   TEXT,
  summary       TEXT,
  link          TEXT,
  published     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Media: GeneScene write-ups, biotech news, podcast episodes, reports.
CREATE TABLE IF NOT EXISTS posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  series        TEXT NOT NULL DEFAULT 'Biotech News',
  author        TEXT,
  summary       TEXT,
  body          TEXT,
  link          TEXT,
  published_on  DATE,
  published     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The people, per team. Separate from `members`: a member is someone who
-- applied, a team entry is someone the club puts on its public page, and
-- conflating the two would publish the roll.
CREATE TABLE IF NOT EXISTS team_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  role          TEXT NOT NULL,
  team          TEXT NOT NULL,
  year          TEXT,
  photo_url     TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 100,
  published     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members  ENABLE ROW LEVEL SECURITY;

CREATE POLICY opportunities_public_read ON opportunities FOR SELECT USING (published);
CREATE POLICY posts_public_read         ON posts         FOR SELECT USING (published);
CREATE POLICY team_public_read          ON team_members  FOR SELECT USING (published);

CREATE POLICY opportunities_admin_all ON opportunities FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY posts_admin_all         ON posts         FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY team_admin_all          ON team_members  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS opportunities_pub_idx ON opportunities (published, starts_on);
CREATE INDEX IF NOT EXISTS posts_pub_idx         ON posts (published, published_on DESC);
CREATE INDEX IF NOT EXISTS team_sort_idx         ON team_members (team, sort_order);

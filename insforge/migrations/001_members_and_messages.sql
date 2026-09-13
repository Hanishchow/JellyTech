-- =============================================================================
-- JELLYTECH backend, v1
--
-- Two tables. `members` is the club roll: exactly one row per authenticated
-- user, keyed by the auth user's own id so there is no second identity to keep
-- in sync. `messages` is the enquiry inbox, which anyone may write to and only
-- the core team may read.
--
-- The access rules are deliberately blunt, because the failure mode that
-- matters for a student club is a member's USN and email leaking to every other
-- signed-in member, not a sophisticated attack. A member can see and edit their
-- own row and nothing else. Nobody reads the roll through the API at all: the
-- core team reads it in the InsForge dashboard with the admin key. That avoids
-- a role column on `members` deciding who may read `members`, which is the
-- recursive-policy trap that quietly disables RLS for everyone.
-- =============================================================================

CREATE TABLE IF NOT EXISTS members (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  usn         TEXT,
  department  TEXT NOT NULL,
  year        TEXT NOT NULL,
  interests   TEXT[] NOT NULL DEFAULT '{}',
  motivation  TEXT,
  -- applied -> active is a human decision made by the Cultural & Engagement
  -- team, so it is never set from the client (see the update policy below).
  status      TEXT NOT NULL DEFAULT 'applied'
              CHECK (status IN ('applied', 'active', 'alumni', 'declined')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT NOT NULL,
  body        TEXT NOT NULL,
  -- Null for enquiries from people who are not members.
  author_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  handled     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- members -------------------------------------------------------------------

CREATE POLICY members_read_own ON members
  FOR SELECT USING (auth.uid() = id);

-- A member may only ever create their own row, and only in the 'applied'
-- state: without the status check, anyone could sign up as an active member.
CREATE POLICY members_insert_own ON members
  FOR INSERT WITH CHECK (auth.uid() = id AND status = 'applied');

-- Editing your own details is fine; promoting yourself is not, so the status
-- has to match whatever is already stored.
CREATE POLICY members_update_own ON members
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND status = (SELECT m.status FROM members m WHERE m.id = auth.uid())
  );

-- messages ------------------------------------------------------------------

-- The contact form is open to people who have no account, so this is the one
-- genuinely public write on the site. It is append-only: no policy grants
-- SELECT, UPDATE or DELETE to anyone, so a sender cannot read the inbox back,
-- and the team reads it with the admin key.
CREATE POLICY messages_insert_public ON messages
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS members_status_idx   ON members (status);
CREATE INDEX IF NOT EXISTS messages_created_idx ON messages (created_at DESC);

-- =============================================================================
-- JELLYTECH backend, v3: hardening, first-party analytics, account deletion.
--
-- 1. Length limits on everything a stranger can type into the database.
-- 2. A cap on how fast the public tables can be written to.
-- 3. Two insert-only tables: page views and client-side errors. No third-party
--    script, no cookie, no IP, no user id: a path, a referrer host, a time.
-- 4. delete_my_account(): the member's own way out.
--
-- Safe to run twice.
-- =============================================================================

-- 1. Length limits ------------------------------------------------------------
-- NOT VALID: new and updated rows are checked, rows already stored are not
-- re-scanned, so a limit can never fail a migration over old data.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'members_field_lengths') THEN
    ALTER TABLE members ADD CONSTRAINT members_field_lengths CHECK (
      char_length(name) <= 100
      AND char_length(email) <= 254
      AND (usn IS NULL OR char_length(usn) <= 20)
      AND (motivation IS NULL OR char_length(motivation) <= 1000)
    ) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_field_lengths') THEN
    ALTER TABLE messages ADD CONSTRAINT messages_field_lengths CHECK (
      char_length(name) <= 100
      AND char_length(email) <= 254
      AND char_length(subject) <= 100
      AND char_length(body) <= 4000
    ) NOT VALID;
  END IF;
END $$;

-- 2. Write-rate cap -----------------------------------------------------------
-- The public tables take writes from people with no identity, so the only thing
-- there is to count is "how many in the last minute, from anyone". That is a
-- floor under abuse, not a per-person limit. It is SECURITY DEFINER because the
-- caller has no SELECT on these tables, and an invisible table counts as empty.

CREATE OR REPLACE FUNCTION enforce_insert_cap()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  cap    INT := TG_ARGV[0]::INT;
  recent INT;
BEGIN
  EXECUTE format(
    'SELECT count(*) FROM %I.%I WHERE created_at > now() - interval ''1 minute''',
    TG_TABLE_SCHEMA, TG_TABLE_NAME
  ) INTO recent;

  IF recent >= cap THEN
    RAISE EXCEPTION 'Too many requests. Try again in a minute.';
  END IF;
  RETURN NEW;
END;
$$;

-- 3. First-party analytics and error log --------------------------------------

CREATE TABLE IF NOT EXISTS page_views (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path          TEXT NOT NULL CHECK (char_length(path) <= 200),
  referrer_host TEXT CHECK (referrer_host IS NULL OR char_length(referrer_host) <= 100),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_errors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message    TEXT NOT NULL CHECK (char_length(message) <= 500),
  source     TEXT CHECK (source IS NULL OR char_length(source) <= 200),
  path       TEXT CHECK (path IS NULL OR char_length(path) <= 200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_views_created_idx   ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS client_errors_created_idx ON client_errors (created_at DESC);
CREATE INDEX IF NOT EXISTS messages_recent_idx       ON messages (created_at DESC);

ALTER TABLE page_views    ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_errors ENABLE ROW LEVEL SECURITY;

-- Anyone may append; only an admin may read or prune. Same shape as `messages`.
DROP POLICY IF EXISTS page_views_insert_public ON page_views;
CREATE POLICY page_views_insert_public ON page_views FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS page_views_admin_read ON page_views;
CREATE POLICY page_views_admin_read ON page_views FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS page_views_admin_delete ON page_views;
CREATE POLICY page_views_admin_delete ON page_views FOR DELETE USING (is_admin());

DROP POLICY IF EXISTS client_errors_insert_public ON client_errors;
CREATE POLICY client_errors_insert_public ON client_errors FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS client_errors_admin_read ON client_errors;
CREATE POLICY client_errors_admin_read ON client_errors FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS client_errors_admin_delete ON client_errors;
CREATE POLICY client_errors_admin_delete ON client_errors FOR DELETE USING (is_admin());

DROP TRIGGER IF EXISTS messages_insert_cap ON messages;
CREATE TRIGGER messages_insert_cap BEFORE INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION enforce_insert_cap(10);

DROP TRIGGER IF EXISTS page_views_insert_cap ON page_views;
CREATE TRIGGER page_views_insert_cap BEFORE INSERT ON page_views
  FOR EACH ROW EXECUTE FUNCTION enforce_insert_cap(300);

DROP TRIGGER IF EXISTS client_errors_insert_cap ON client_errors;
CREATE TRIGGER client_errors_insert_cap BEFORE INSERT ON client_errors
  FOR EACH ROW EXECUTE FUNCTION enforce_insert_cap(60);

-- Retention: telemetry is kept 90 days. There is no scheduler to lean on, so
-- roughly one insert in a hundred sweeps the old rows. The privacy page promises
-- this, so it has to be true without anyone remembering to run it.

CREATE OR REPLACE FUNCTION prune_telemetry()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  IF random() < 0.01 THEN
    DELETE FROM page_views    WHERE created_at < now() - interval '90 days';
    DELETE FROM client_errors WHERE created_at < now() - interval '90 days';
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS page_views_prune ON page_views;
CREATE TRIGGER page_views_prune AFTER INSERT ON page_views
  FOR EACH STATEMENT EXECUTE FUNCTION prune_telemetry();

DROP TRIGGER IF EXISTS client_errors_prune ON client_errors;
CREATE TRIGGER client_errors_prune AFTER INSERT ON client_errors
  FOR EACH STATEMENT EXECUTE FUNCTION prune_telemetry();

-- 4. Leaving the club ---------------------------------------------------------
-- Removes the caller's own auth user. `members` goes with it (ON DELETE
-- CASCADE) and `messages.author_id` is set null. It can only ever name
-- auth.uid(), so there is no argument for someone to point at another account.

CREATE OR REPLACE FUNCTION delete_my_account()
  RETURNS VOID
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in.';
  END IF;
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION delete_my_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION delete_my_account() TO authenticated;

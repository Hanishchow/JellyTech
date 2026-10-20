# Database backups

The workflow `.github/workflows/db-backup.yml` exports the club's InsForge
database every Sunday, encrypts it with AES-256 and keeps it as a workflow
artifact for 30 days. Run it any time from the Actions tab ("Database backup",
Run workflow).

## One-time setup

Two repository secrets, set at Settings > Secrets and variables > Actions:

| Secret | What it is |
| --- | --- |
| `INSFORGE_API_KEY` | The project's admin key, `api_key` in `.insforge/project.json` (never commit that file) |
| `BACKUP_PASSPHRASE` | A long random passphrase. Keep a copy in a password manager. Without it a backup cannot be opened |

Or from a terminal, which reads the values without printing them:

```bash
node -p "require('./.insforge/project.json').api_key" | gh secret set INSFORGE_API_KEY --repo Hanishchow/JellyTech
openssl rand -base64 32 | gh secret set BACKUP_PASSPHRASE --repo Hanishchow/JellyTech
```

If you generate the passphrase that way, it exists only inside GitHub. Print it
once (`openssl rand -base64 32`, then set it by hand) if you want your own copy.

## Why encrypted

The repository and its artifacts are public. A dump contains members' names,
emails and USNs, so it is never stored in the clear and never committed.

## Restoring

1. Download the artifact from the run page and unzip it.
2. Decrypt: `gpg --decrypt jellytech-YYYY-MM-DD.sql.gpg > restore.sql` (it asks for the passphrase).
3. Review `restore.sql` (it is plain SQL: `CREATE TABLE IF NOT EXISTS` plus `INSERT`s), then load it with `insforge db import restore.sql`.

The export covers the app's own tables (members, messages, admins,
opportunities, posts, team_members, page_views, client_errors). It does not
include sign-in accounts, which InsForge keeps separately, and it does not
include uploaded team photos in storage. A restored `members` row whose sign-in
no longer exists needs that person to join again.

Before any migration that changes the live database, take a manual dump first:

```bash
insforge db export --output ../jt-backups/before-change.json
```

Keep that file outside the repository. The CLI writes a JSON envelope; the SQL
is its `data` field, so unwrap it before importing:

```bash
node -e "const f=require('fs');f.writeFileSync('restore.sql',JSON.parse(f.readFileSync('../jt-backups/before-change.json','utf8')).data)"
```

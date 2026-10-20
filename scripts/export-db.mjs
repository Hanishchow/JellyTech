// Exports the club's database as plain SQL, using the project's admin key.
//
// Why this is not `insforge db export`: that command insists on an interactive
// browser login before it will run, which a CI runner cannot do, even though the
// export itself is a single authenticated POST. So the workflow calls the same
// endpoint directly.
//
// The API caps rowLimit at 10,000 per table; the club has a few dozen rows. If a
// table ever approaches that, this script must page instead of trusting the cap.
//
// Usage: INSFORGE_API_KEY=... node scripts/export-db.mjs <output.sql>
// The key comes from the environment and is never printed.

import { writeFileSync } from "node:fs";

const HOST = process.env.INSFORGE_URL ?? "https://6v9g2tra.ap-southeast.insforge.app";
const key = process.env.INSFORGE_API_KEY;
const out = process.argv[2];

if (!key) {
  console.error("INSFORGE_API_KEY is not set.");
  process.exit(1);
}
if (!out) {
  console.error("Usage: node scripts/export-db.mjs <output.sql>");
  process.exit(1);
}

const res = await fetch(`${HOST}/api/database/advance/export`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
  body: JSON.stringify({ format: "sql", includeData: true, rowLimit: 10000 }),
});

if (!res.ok) {
  console.error(`Export failed: HTTP ${res.status}`);
  process.exit(1);
}

const raw = await res.text();
let sql = raw;
try {
  const parsed = JSON.parse(raw);
  // The API wraps the SQL in a JSON envelope; the field has been called both
  // `data` and `content`.
  sql = typeof parsed.data === "string" ? parsed.data : parsed.content;
} catch {
  /* already plain SQL */
}

if (typeof sql !== "string" || sql.length < 1000 || !/^INSERT INTO /m.test(sql)) {
  console.error("Export came back empty or without any rows; refusing to write it.");
  process.exit(1);
}

writeFileSync(out, sql);
const tables = (sql.match(/^CREATE TABLE IF NOT EXISTS (\S+)/gm) ?? []).length;
const rows = (sql.match(/^INSERT INTO /gm) ?? []).length;
console.log(`Wrote ${out}: ${tables} tables, ${rows} insert statements, ${sql.length} bytes.`);

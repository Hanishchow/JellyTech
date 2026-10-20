/* =============================================================================
   Form checks, shared by the join, contact, login and reset forms.

   These are for the person typing: they turn "the save failed" into "your
   message is 4,210 characters, the limit is 4,000" before a request is made.
   They are not the security boundary. The same limits are enforced by CHECK
   constraints in insforge/migrations/003_hardening.sql, which is what holds
   against someone who skips this file.
   ============================================================================= */

/** Keep in step with the CHECK constraints in 003_hardening.sql. */
export const LIMITS = {
  name: 100,
  email: 254,
  usn: 20,
  motivation: 1000,
  subject: 100,
  message: 4000,
} as const;

export type FieldErrors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function tooLong(value: string, max: number, label: string) {
  return value.length > max
    ? `${label} is ${value.length.toLocaleString()} characters; the limit is ${max.toLocaleString()}.`
    : null;
}

export function checkName(value: string, label = "Name"): string | null {
  if (!value.trim()) return `${label} is required.`;
  return tooLong(value, LIMITS.name, label);
}

export function checkEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return "Email is required.";
  if (!EMAIL.test(email)) return "That does not look like an email address.";
  return tooLong(email, LIMITS.email, "Email");
}

export function checkPassword(value: string, min: number): string | null {
  if (value.length < min) return `Use at least ${min} characters.`;
  if (value.length > 128) return "Use 128 characters or fewer.";
  return null;
}

export function checkCode(value: string): string | null {
  return /^\d{6}$/.test(value.trim()) ? null : "Enter the 6-digit code from the email.";
}

/** Drops the null entries, so `Object.keys(result).length === 0` means "fine". */
function collect(entries: Array<[string, string | null]>): FieldErrors {
  const errors: FieldErrors = {};
  for (const [key, message] of entries) if (message) errors[key] = message;
  return errors;
}

export function validateApplication(
  v: {
    name: string;
    email: string;
    usn?: string;
    password?: string;
    year: string;
    department: string;
    motivation?: string;
  },
  passwordMin: number
): FieldErrors {
  return collect([
    ["name", checkName(v.name, "Full name")],
    ["email", checkEmail(v.email)],
    ["usn", v.usn ? tooLong(v.usn, LIMITS.usn, "USN") : null],
    ["password", v.password === undefined ? null : checkPassword(v.password, passwordMin)],
    ["year", v.year ? null : "Choose your year."],
    ["department", v.department ? null : "Choose your department."],
    ["motivation", v.motivation ? tooLong(v.motivation, LIMITS.motivation, "That note") : null],
  ]);
}

export function validateContact(v: { name: string; email: string; body: string }): FieldErrors {
  return collect([
    ["name", checkName(v.name, "Your name")],
    ["email", checkEmail(v.email)],
    [
      "body",
      !v.body.trim() ? "Write a message first." : tooLong(v.body, LIMITS.message, "Your message"),
    ],
  ]);
}

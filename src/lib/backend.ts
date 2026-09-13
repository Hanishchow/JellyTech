/* =============================================================================
   The one place the site talks to a backend.

   Live against InsForge (Postgres + auth). Every page imports `backend` and
   nothing else, so the transport is replaceable without touching a page.

   A browser-local implementation is kept behind the same interface and takes
   over when the environment has no credentials, which is what a fresh clone
   without a .env gets. It reports `isLive: false` and the pages say so out
   loud, rather than accepting an application into a void.

   WHERE THE SECURITY IS

   Not here. The anon key below is publishable and ships in the bundle; what
   protects member data is the row-level-security policies in
   insforge/migrations/001_members_and_messages.sql. A member can read and edit
   their own row and nothing else, and nobody can read the roll or the enquiry
   inbox through the API at all. Read that file before changing anything in
   this one.
   ============================================================================= */

import { insforge as sharedClient, rememberSession, forgetSession } from "@/lib/insforge";

export type Department =
  | "Biotechnology"
  | "Computer Science / AI"
  | "Electronics"
  | "Mechanical"
  | "Aeronautical"
  | "Design"
  | "Other";

export const DEPARTMENTS: Department[] = [
  "Biotechnology",
  "Computer Science / AI",
  "Electronics",
  "Mechanical",
  "Aeronautical",
  "Design",
  "Other",
];

export const INTERESTS = [
  "Conferences & outreach",
  "Alumni network",
  "Cultural & engagement",
  "Media (photo / video)",
  "Editorial & design",
  "Hackathons & technical",
  "Logistics",
  "Finance",
] as const;

export type Interest = (typeof INTERESTS)[number];

export type MemberStatus = "applied" | "active" | "alumni" | "declined";

export interface Member {
  id: string;
  name: string;
  email: string;
  usn?: string;
  department: Department;
  year: string;
  interests: Interest[];
  motivation?: string;
  status: MemberStatus;
  createdAt: string;
}

/** The details the club needs, independent of how the account was created. */
export interface ApplicationDetails {
  name: string;
  email: string;
  usn?: string;
  department: Department;
  year: string;
  interests: Interest[];
  motivation?: string;
}

export interface Application extends ApplicationDetails {
  /** Applying with a password creates the account in the same step. */
  password: string;
}

/**
 * Someone who has authenticated (with Google, say) but has no membership
 * record yet. They are half-way through applying, and the Join page finishes
 * the job rather than asking them to invent a password they will never use.
 */
export interface PendingAccount {
  id: string;
  email: string;
  name?: string;
}

export type OAuthProvider = "google" | "github";

export interface Message {
  name: string;
  email: string;
  subject: string;
  body: string;
}

export interface Backend {
  /** False while the browser-local stand-in is in use. */
  readonly isLive: boolean;
  /** Minimum password length the server will accept. */
  readonly passwordMinLength: number;
  /** Empty when no third-party sign-in is available. */
  readonly oauthProviders: readonly OAuthProvider[];
  apply(application: Application): Promise<Member>;
  /**
   * Finish an application for someone who is already authenticated. Used after
   * a Google sign-in, where the account exists but the membership does not.
   */
  completeApplication(details: ApplicationDetails): Promise<Member>;
  /** Send the browser to the provider. Never returns on success. */
  startOAuth(provider: OAuthProvider, redirectTo: string): Promise<void>;
  /** Authenticated but not yet a member, or null. */
  pendingAccount(): Promise<PendingAccount | null>;
  contact(message: Message): Promise<void>;
  signIn(email: string, password: string): Promise<Member>;
  signOut(): Promise<void>;
  currentMember(): Promise<Member | null>;
}

const PASSWORD_MIN = 8;

/** The database row shape, which is snake_case where the app is camelCase. */
interface MemberRow {
  id: string;
  name: string;
  email: string;
  usn: string | null;
  department: string;
  year: string;
  interests: string[] | null;
  motivation: string | null;
  status: MemberStatus;
  created_at: string;
}

function toMember(row: MemberRow): Member {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    usn: row.usn ?? undefined,
    department: row.department as Department,
    year: row.year,
    interests: (row.interests ?? []) as Interest[],
    motivation: row.motivation ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

/** InsForge returns `{ data, error }`; this turns the error half into a throw. */
function unwrap<T>(result: { data: T | null; error: unknown }, fallback: string): T {
  if (result.error) {
    const message =
      result.error instanceof Error
        ? result.error.message
        : typeof result.error === "object" && result.error && "message" in result.error
          ? String((result.error as { message: unknown }).message)
          : fallback;
    throw new Error(message);
  }
  if (result.data == null) throw new Error(fallback);
  return result.data;
}

function createInsforgeBackend(insforge: NonNullable<typeof sharedClient>): Backend {

  async function memberFor(userId: string): Promise<Member | null> {
    const { data, error } = await insforge.database
      .from("members")
      .select()
      .eq("id", userId);
    if (error) return null;
    const rows = (data ?? []) as MemberRow[];
    return rows[0] ? toMember(rows[0]) : null;
  }

  /** The membership row, once an account exists to attach it to. */
  async function insertMember(userId: string, details: ApplicationDetails) {
    const insert = await insforge.database
      .from("members")
      .insert({
        id: userId,
        name: details.name,
        email: details.email.trim().toLowerCase(),
        usn: details.usn ?? null,
        department: details.department,
        year: details.year,
        interests: details.interests,
        motivation: details.motivation ?? null,
      })
      .select();

    const rows = unwrap(insert, "Could not record the application.") as MemberRow[];
    const row = rows[0];
    if (!row) throw new Error("Could not record the application.");
    return toMember(row);
  }

  return {
    isLive: true,
    passwordMinLength: PASSWORD_MIN,
    oauthProviders: ["google"],

    async apply(application) {
      // Applying is a signup: the member row is keyed by the auth user's id,
      // so the account has to exist before the row can.
      const signUp = await insforge.auth.signUp({
        email: application.email.trim().toLowerCase(),
        password: application.password,
        name: application.name,
      });
      const account = unwrap(signUp, "Could not create the account.");
      rememberSession(account.accessToken);

      const userId = account.user?.id;
      if (!userId) {
        throw new Error("The account was created but returned no id.");
      }
      return insertMember(userId, application);
    },

    async completeApplication(details) {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error || !data?.user?.id) {
        throw new Error("You are not signed in any more. Start again.");
      }
      return insertMember(data.user.id, details);
    },

    async startOAuth(provider, redirectTo) {
      // The SDK spots the `insforge_code` on the way back and exchanges it for
      // a session by itself, so there is no callback route to write here.
      const { error } = await insforge.auth.signInWithOAuth(provider, {
        redirectTo,
        additionalParams: { prompt: "select_account" },
      });
      if (error) {
        throw new Error(
          error instanceof Error ? error.message : "Could not reach the provider."
        );
      }
    },

    async pendingAccount() {
      const { data, error } = await insforge.auth.getCurrentUser();
      const user = data?.user;
      if (error || !user?.id) return null;
      // Signed in, but is there a membership behind it?
      if (await memberFor(user.id)) return null;
      return {
        id: user.id,
        email: user.email ?? "",
        name: (user as { profile?: { name?: string } }).profile?.name,
      };
    },

    async contact(message) {
      const insert = await insforge.database.from("messages").insert({
        name: message.name,
        email: message.email.trim().toLowerCase(),
        subject: message.subject,
        body: message.body,
      });
      if (insert.error) throw new Error("Could not send the message.");
    },

    async signIn(email, password) {
      const result = await insforge.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      const session = unwrap(result, "Could not sign in.");
      rememberSession(session.accessToken);

      const userId = session.user?.id;
      if (!userId) throw new Error("Could not sign in.");

      const member = await memberFor(userId);
      if (!member) {
        throw new Error(
          "That account exists but has no membership record. Contact the core team."
        );
      }
      return member;
    },

    async signOut() {
      await insforge.auth.signOut();
      forgetSession();
    },

    async currentMember() {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error || !data?.user?.id) return null;
      return memberFor(data.user.id);
    },
  };
}

/* --------------------------------------------------------------------------
   The stand-in. Useful for filling in the flows, useless as security: it
   stores applications in localStorage and checks no password at all. It only
   runs when there are no credentials in the environment.
   -------------------------------------------------------------------------- */

const KEY_MEMBERS = "jellytech.members";
const KEY_SESSION = "jellytech.session";
const KEY_MESSAGES = "jellytech.messages";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private browsing, storage disabled — the flows still complete */
  }
}

function createLocalBackend(): Backend {
  return {
    isLive: false,
    passwordMinLength: PASSWORD_MIN,
    // There is no provider to talk to without a backend, and an offered
    // Google button that cannot work is worse than no button.
    oauthProviders: [],

    async completeApplication() {
      throw new Error("Third-party sign-in needs the live backend.");
    },

    async startOAuth() {
      throw new Error("Third-party sign-in needs the live backend.");
    },

    async pendingAccount() {
      return null;
    },

    async apply(application) {
      const members = read<Member[]>(KEY_MEMBERS, []);
      if (members.some((m) => m.email === application.email)) {
        throw new Error("An application already exists for this email address.");
      }

      const { password: _password, ...rest } = application;
      const member: Member = {
        id: crypto.randomUUID(),
        status: "applied",
        createdAt: new Date().toISOString(),
        ...rest,
      };

      write(KEY_MEMBERS, [...members, member]);
      write(KEY_SESSION, member.id);
      return member;
    },

    async contact(message) {
      const messages = read<(Message & { at: string })[]>(KEY_MESSAGES, []);
      write(KEY_MESSAGES, [...messages, { ...message, at: new Date().toISOString() }]);
    },

    async signIn(email) {
      const members = read<Member[]>(KEY_MEMBERS, []);
      const member = members.find((m) => m.email === email.trim().toLowerCase());
      if (!member) {
        throw new Error("No application found for that email address on this device.");
      }
      write(KEY_SESSION, member.id);
      return member;
    },

    async signOut() {
      write(KEY_SESSION, null);
    },

    async currentMember() {
      const id = read<string | null>(KEY_SESSION, null);
      if (!id) return null;
      return read<Member[]>(KEY_MEMBERS, []).find((m) => m.id === id) ?? null;
    },
  };
}

export const backend: Backend = sharedClient
  ? createInsforgeBackend(sharedClient)
  : createLocalBackend();

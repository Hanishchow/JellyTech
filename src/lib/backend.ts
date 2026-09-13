/* =============================================================================
   The one place the site talks to a backend.

   The club is moving to InsForge (Postgres + auth), but that account has not
   been linked yet, so this module defines the contract the UI is written
   against and ships a browser-local implementation behind it. Every page
   imports `backend` and nothing else — swapping in the real client means
   replacing `createLocalBackend()` with `createInsforgeBackend()` below and
   changing no page code.

   The local implementation is deliberately honest about what it is: it stores
   applications and sessions in localStorage, so it is useful for filling in
   the flows and useless as security. `backend.isLive` is false while it is in
   use, and the UI says so rather than implying a member account exists
   somewhere.
   ============================================================================= */

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

export interface Member {
  id: string;
  name: string;
  email: string;
  usn?: string;
  department: Department;
  year: string;
  interests: Interest[];
  status: "applied" | "active";
  createdAt: string;
}

export interface Application {
  name: string;
  email: string;
  usn?: string;
  department: Department;
  year: string;
  interests: Interest[];
  motivation?: string;
}

export interface Message {
  name: string;
  email: string;
  subject: string;
  body: string;
}

export interface Backend {
  /** False while the browser-local stand-in is in use. */
  readonly isLive: boolean;
  apply(application: Application): Promise<Member>;
  contact(message: Message): Promise<void>;
  signIn(email: string, password: string): Promise<Member>;
  signOut(): Promise<void>;
  currentMember(): Member | null;
}

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

    async apply(application) {
      const members = read<Member[]>(KEY_MEMBERS, []);
      const existing = members.find((m) => m.email === application.email);
      if (existing) {
        throw new Error("An application already exists for this email address.");
      }

      const member: Member = {
        id: crypto.randomUUID(),
        status: "applied",
        createdAt: new Date().toISOString(),
        ...application,
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

    currentMember() {
      const id = read<string | null>(KEY_SESSION, null);
      if (!id) return null;
      return read<Member[]>(KEY_MEMBERS, []).find((m) => m.id === id) ?? null;
    },
  };
}

export const backend: Backend = createLocalBackend();

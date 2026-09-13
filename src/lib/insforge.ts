/* =============================================================================
   One client, one session.

   TWO BUGS LIVE HERE, BOTH FOUND THE HARD WAY

   1. THREE CLIENTS, THREE SESSIONS. backend.ts, admin.ts and content.ts each
      called createClient(). The SDK holds the access token on the client
      instance, so signing in through one left the other two anonymous.

      That is why a signed-in admin was told "this account is not an
      administrator": isAdmin() was asking a client that had never signed in.

      It is also why signing in with Google left the member area saying "apply
      to join". `insforge_code` in the callback URL is single-use, and all
      three clients try to exchange it as they initialise. One wins; the other
      two get nothing. If the winner was the content client, the member area
      was asking a client whose exchange had failed, so the reader looked
      signed out on the page they had just signed in to.

      Everything now imports the single instance below.

   2. THE SESSION RESTS ON A CROSS-SITE COOKIE. Not a confirmed fault, a known
      fragility: the SDK keeps the token in memory and restores it after a
      reload from an httpOnly refresh cookie. On GitHub Pages that cookie is
      cross-site, because the page is hanishchow.github.io and the API is
      *.insforge.app. It survived a reload when tested here, so the browsers
      that allow it are fine; browsers restricting third-party cookies are
      not, and that failure would look exactly like being signed out.

      So the token is mirrored into localStorage and put back on startup. This
      is the usual trade: a token in localStorage is reachable by injected
      script, where an httpOnly cookie is not. It is the right call here anyway,
      because the alternative is not "a safer session", it is "no session at
      all" for whoever has those cookies blocked. The cookie still does the work
      where it is allowed; this only covers where it is not.

      It covers password sign-in only. The token for an OAuth round trip is
      exchanged inside the SDK and never surfaces, so Google sign-in still
      depends on the cookie across reloads.

   If the site ever moves behind a custom domain that shares a parent with the
   API, delete the mirroring and let the cookie do its job.
   ============================================================================= */

import { createClient } from "@insforge/sdk";

const url = import.meta.env.VITE_INSFORGE_URL;
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;

/** False in a clone with no .env, where the local stand-in takes over. */
export const configured = Boolean(url && anonKey);

const TOKEN_KEY = "jellytech.session.token";

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private browsing: the in-memory session still works for this tab */
  }
}

export const insforge = configured
  ? createClient({ baseUrl: url, anonKey })
  : null;

if (insforge) {
  // Put a stored token back before anything asks who the user is.
  const stored = readToken();
  if (stored) {
    try {
      insforge.setAccessToken(stored);
    } catch {
      writeToken(null);
    }
  }

  // The SDK keeps its token on a private TokenManager with no public getter,
  // so the mirror cannot be filled from here: sign-in responses carry the
  // token and rememberSession() below records it. This subscription exists
  // only to clear a stale mirror when the session ends, which matters because
  // a token we keep after sign-out would be handed back on the next load.
  try {
    insforge.auth.onAuthStateChange((event) => {
      if (String(event) === "SIGNED_OUT") writeToken(null);
    });
  } catch {
    /* older SDK without the subscription: signOut() clears it explicitly */
  }
}

/**
 * Record the token a sign-in handed back.
 *
 * This is the only place the token is legible to us: the state-change callback
 * receives the event alone, and the SDK's own copy sits on a private field.
 */
export function rememberSession(accessToken: string | null | undefined) {
  if (accessToken) writeToken(accessToken);
}

export function forgetSession() {
  writeToken(null);
}

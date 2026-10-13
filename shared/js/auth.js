// Auth for every tool: Sign in with Microsoft (Entra, CF tenant only)
// through Supabase Auth. See docs/auth.md.
//
// This file only decides what to SHOW. It is not the lock. The lock is Row
// Level Security in the database (db/policies/): a browser that skips all of
// this still gets nothing back.

import { getClient } from "./supabase.js";

export const STAFF_DOMAIN = "cornerstoneweb.org";

// Resolves once any sign-in redirect (?code=...) has been processed.
export async function getSession() {
  const supabase = await getClient();
  const { data } = await supabase.auth.getSession();
  // Tidy the address bar after the Microsoft round trip.
  if (new URLSearchParams(location.search).has("code")) {
    history.replaceState(null, "", location.pathname + location.hash);
  }
  return data.session ?? null;
}

export function isStaff(session) {
  const email = session?.user?.email?.toLowerCase() ?? "";
  return email.endsWith("@" + STAFF_DOMAIN);
}

// The person's profile (name etc.). A session restored from the browser's
// storage does not always carry user_metadata, so fall back to the signed
// access token, which always includes it.
export function userMeta(session) {
  const m = session?.user?.user_metadata;
  if (m && (m.full_name || m.name)) return m;
  try {
    const part = session.access_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(decodeURIComponent(escape(atob(part))));
    return { ...(claims.user_metadata ?? {}), ...(m ?? {}) };
  } catch {
    return m ?? {};
  }
}

export function displayName(session) {
  const m = userMeta(session);
  return m.full_name || m.name || session?.user?.email || "Signed in";
}

export async function signIn() {
  const supabase = await getClient();
  await supabase.auth.signInWithOAuth({
    provider: "azure",
    options: {
      // "profile" is what makes Microsoft include the person's name.
      scopes: "openid email profile",
      // Come back to this exact page. Must match a Redirect URL in Supabase.
      redirectTo: location.origin + location.pathname,
    },
  });
}

export async function signOut() {
  const supabase = await getClient();
  await supabase.auth.signOut();
  location.replace(location.pathname);
}

// Reads that go through RLS. Returns [] on any error so a page never breaks
// because the database said no.
export async function selectAll(table, orderBy) {
  const supabase = await getClient();
  let q = supabase.from(table).select("*");
  if (orderBy) q = q.order(orderBy);
  const { data, error } = await q;
  if (error) { console.warn(`[auth] ${table}:`, error.message); return []; }
  return data ?? [];
}

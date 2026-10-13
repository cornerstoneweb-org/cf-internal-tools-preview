// Single Supabase client for every tool. Import from here, never construct
// a second client.
import { SUPABASE } from "../../config/supabase.config.js";

let client = null;

export async function getClient() {
  if (client) return client;
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  client = createClient(SUPABASE.url, SUPABASE.publishableKey, {
    auth: {
      // PKCE returns ?code=... instead of #access_token=..., so the sign-in
      // redirect never collides with the hub's #/section routing.
      flowType: "pkce",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return client;
}

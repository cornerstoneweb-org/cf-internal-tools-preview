// Supabase connection for every CF tool. Committed on purpose.
//
// Both values are PUBLIC by design: they ship to every browser that opens
// the site. The publishable key grants nothing on its own. Row Level
// Security in the database decides what anyone can read. See db/policies/.
//
// NEVER put a secret or service_role key in this file or anywhere in the repo.
export const SUPABASE = {
  url: "https://dulpvxsmzgewrqwwkkjp.supabase.co",
  publishableKey: "sb_publishable_hM5j9gj1WpX_Q0_2k4ip_A_QRB4AJTt",
};

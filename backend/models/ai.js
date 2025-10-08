import { get, run } from "../db.js";

// Create a new USSD chat session
export function startAiSession({ msisdn, locale = "en", source = "ussd" }) {
  // sqlite-compatible: use randomblob() as UUID fallback if needed.
  // In Postgres (Supabase) gen_random_uuid() is used by default, so we can insert and RETURNING id.
  const row = get(
    "INSERT INTO ai_sessions(msisdn, source, locale) VALUES (?, ?, ?) RETURNING id",
    [msisdn, source, locale]
  );
  return row?.id;
}

// Reuse the most recent session for this msisdn (last 2 hours)
export function getRecentAiSession(msisdn) {
  return get(
    "SELECT id FROM ai_sessions WHERE msisdn=? ORDER BY created_at DESC LIMIT 1",
    [msisdn]
  )?.id;
}

export function addAiMessage({ session_id, role, content }) {
  run(
    "INSERT INTO ai_messages(session_id, role, content) VALUES (?, ?, ?)",
    [session_id, role, content]
  );
}

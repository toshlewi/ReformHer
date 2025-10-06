import { get, run } from "../db.js";

export function upsertUser({ msisdn, locale, region, business_type, topics, delivery_window, consent }) {
  const existing = get("SELECT * FROM users WHERE msisdn = ?", [msisdn]);
  const topicsStr = (topics || []).join(",");
  if (existing) {
    run(`UPDATE users SET locale=?, region=?, business_type=?, topics=?, delivery_window=?, consent=? WHERE msisdn=?`,
      [locale, region, business_type, topicsStr, delivery_window, consent ? 1 : 0, msisdn]);
  } else {
    run(`INSERT INTO users (msisdn, locale, region, business_type, topics, delivery_window, consent)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [msisdn, locale, region, business_type, topicsStr, delivery_window, consent ? 1 : 0]);
  }
  return get("SELECT * FROM users WHERE msisdn = ?", [msisdn]);
}

export function getUser(msisdn) {
  return get("SELECT * FROM users WHERE msisdn = ?", [msisdn]);
}

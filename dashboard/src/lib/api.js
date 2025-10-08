// dashboard/src/lib/api.js
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const timeout = (ms, p) =>
  Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);

async function _fetch(url, opts = {}) {
  const res = await timeout(12000, fetch(url, opts));
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
  }
  return res;
}

/** ---- USSD emulator ----
 * Keep sessionId STABLE while user is in one dial session.
 * Reset it when user hangs up (when response starts with "END ").
 */
export async function postUssd({ sessionId, phoneNumber, text }) {
  const serviceCode = "*500#";
  const body = new URLSearchParams({
    sessionId,
    serviceCode,
    phoneNumber,              // e.g. "254712345678" or "+254712345678"
    text: text || ""
  });

  const res = await _fetch(`${API_BASE}/api/ussd`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  // Backend returns plain text: "CON ..." or "END ..."
  return res.text();
}

/** ---- Outbox for emulator sidebar ---- */
export async function fetchOutbox(limit = 50) {
  const res = await _fetch(`${API_BASE}/api/sms/outbox?limit=${limit}`);
  const json = await res.json();
  return json.messages || [];
}

/** ---- Users table (backend already has /api/users) ---- */
export async function fetchUsers(limit = 200) {
  const res = await _fetch(`${API_BASE}/api/users?limit=${limit}`);
  const json = await res.json();
  return json.users || [];
}

/** ---- Analytics summary (backend already has /api/analytics/summary) ---- */
export async function fetchAnalyticsSummary() {
  const res = await _fetch(`${API_BASE}/api/analytics/summary`);
  return res.json(); // { totalUsers, quizCount, avgScore, byTopic }
}

/** ---- (Optional) If you add these routes on the backend, uncomment below ---- */
// export async function fetchLessonHistory(limit = 200) {
//   const res = await _fetch(`${API_BASE}/api/lessons/history?limit=${limit}`);
//   const json = await res.json();
//   return json.history || [];
// }

// export async function fetchQuizAttempts(limit = 200) {
//   const res = await _fetch(`${API_BASE}/api/quizzes/attempts?limit=${limit}`);
//   const json = await res.json();
//   return json.attempts || [];
// }

// export async function createHelplineTicket({ msisdn, topic, notes }) {
//   const res = await _fetch(`${API_BASE}/api/helpline`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ msisdn, topic, notes })
//   });
//   return res.json(); // { ok: true, id, ... }
// }

// export async function fetchHelplineTickets({ msisdn, limit = 50 } = {}) {
//   const qs = new URLSearchParams({ limit, ...(msisdn ? { msisdn } : {}) });
//   const res = await _fetch(`${API_BASE}/api/helpline?${qs}`);
//   const json = await res.json();
//   return json.tickets || [];
// }

// export async function askAI({ msisdn, text, locale = "en" }) {
//   const res = await _fetch(`${API_BASE}/api/ai/ask`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ msisdn, text, locale })
//   });
//   return res.json(); // { session_id, answer_short, answer_full }
// }

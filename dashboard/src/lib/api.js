// dashboard/src/lib/api.js
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function postUssd({ sessionId, phoneNumber, text }) {
  const serviceCode = "*500#";
  const body = new URLSearchParams({ sessionId, serviceCode, phoneNumber, text: text || "" });
  const res = await fetch(`${API_BASE}/api/ussd`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const msg = await res.text();
  return msg; // "CON ..." or "END ..."
}

export async function fetchOutbox(limit = 50) {
  const res = await fetch(`${API_BASE}/api/sms/outbox?limit=${limit}`);
  const json = await res.json();
  return json.messages || [];
}

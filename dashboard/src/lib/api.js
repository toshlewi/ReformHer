// dashboard/src/lib/api.js
export const API_BASE = "http://localhost:8000";

export async function postForm(path, form) {
  const body = new URLSearchParams(form).toString();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  // USSD gateways often return plain text (CON/END ...)
  const text = await res.text().catch(() => "");
  return text;
}

export async function getJson(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return res.json();
}

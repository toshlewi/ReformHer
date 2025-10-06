import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function SmsOutbox({ limit = 50 }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let t;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/sms/outbox?limit=${limit}`);
        const json = await res.json();
        setMessages(json.messages || []);
      } catch (e) {
        console.error("Outbox fetch failed:", e);
      }
    };
    load();
    t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, [limit]);

  return (
    <div className="card">
      <div className="card-title">SMS Outbox (latest {limit})</div>
      <div className="divide-y">
        {messages.length === 0 && (
          <div className="p-3 text-sm text-slate-500">
            No messages yet. Perform an action in the USSD emulator (e.g., Register) to queue SMS.
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className="p-3">
            <div className="text-xs text-slate-400">
              {new Date(m.created_at).toLocaleString()} • {m.msisdn}
            </div>
            <div className="font-medium text-slate-800">{m.body}</div>
            <div className="text-xs text-slate-500 mt-1">Status: {m.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
